import { randomUUID } from "node:crypto";
import type { Server as HttpServer } from "node:http";
import { Server as IOServer, type Socket } from "socket.io";
import { parseBet } from "../lib/game/bet";
import {
  CHAT_MAX_LENGTH,
  CLIENT_EVENT,
  GLOBAL_ROOM,
  SERVER_EVENT,
  SOCKET_PATH,
  type Ack,
  type ChatMessagePayload,
  type RoomStatePayload,
} from "../shared/protocol";
import { authenticateSocket, type SocketUser } from "./auth";
import { RateLimiter } from "./rate-limit";
import { pushChat, RoomManager, type ManagedRoom } from "./rooms";

export { SOCKET_PATH };

/** Действия игрока: защита от заклинившей кнопки и от скрипта-спамера. */
const actionLimiter = new RateLimiter(20, 5_000);
const chatLimiter = new RateLimiter(5, 10_000);

export function createSocketServer(httpServer: HttpServer): IOServer {
  const io = new IOServer(httpServer, {
    path: SOCKET_PATH,
    serveClient: false,
    // Engine.IO по умолчанию добивает upgrade-запросы, которые не попали в его
    // путь. В одном процессе с Next это убивает HMR-сокет, поэтому чужие
    // upgrade'ы оставляем в покое — их разбирает обработчик в server.ts.
    destroyUpgrade: false,
  });

  const manager = new RoomManager((managed) => {
    void broadcastState(io, managed);
  });

  io.use((socket, next) => {
    void authenticateSocket(socket.handshake.headers)
      .then((user) => {
        if (!user) {
          next(new Error("Нужно войти в аккаунт"));
          return;
        }
        socket.data.user = user;
        next();
      })
      .catch((error: unknown) => {
        console.error("[socket] аутентификация упала:", error);
        next(new Error("Сервер не смог проверить сессию"));
      });
  });

  io.on("connection", (socket) => {
    void onConnection(io, manager, socket);
  });

  return io;
}

async function onConnection(
  io: IOServer,
  manager: RoomManager,
  socket: Socket,
): Promise<void> {
  const user = socket.data.user as SocketUser | undefined;
  if (!user) {
    socket.disconnect(true);
    return;
  }

  const roomKey = GLOBAL_ROOM;
  const managed = await manager.join(user, roomKey);
  await socket.join(roomKey);

  socket.emit(SERVER_EVENT.chatHistory, managed.chat);
  socket.emit(SERVER_EVENT.state, buildState(managed, user.id));
  void broadcastState(io, managed);

  socket.on(CLIENT_EVENT.read, (...args: unknown[]) => {
    respond(args, () => {
      if (!actionLimiter.allow(user.id)) return tooFast();
      return managed.runner.run((room, now) => room.confirmRead(user.id, now));
    });
  });

  socket.on(CLIENT_EVENT.answer, (...args: unknown[]) => {
    respond(args, (payload) => {
      if (!actionLimiter.allow(user.id)) return tooFast();

      const bet = parseBet(readBet(payload));
      if (bet === null)
        return { accepted: false, reason: "Некорректная сумма" };

      return managed.runner.run((room, now) =>
        room.submitHostAnswer(user.id, bet, now),
      );
    });
  });

  socket.on(CLIENT_EVENT.bet, (...args: unknown[]) => {
    respond(args, (payload) => {
      if (!actionLimiter.allow(user.id)) return tooFast();

      const bet = parseBet(readBet(payload));
      if (bet === null)
        return { accepted: false, reason: "Некорректная сумма" };

      return managed.runner.run((room, now) =>
        room.placeBet(user.id, bet, now),
      );
    });
  });

  socket.on(CLIENT_EVENT.chat, (...args: unknown[]) => {
    respond(args, (payload) => {
      const text = readText(payload);
      if (!text) return { accepted: false, reason: "Пустое сообщение" };
      if (text.length > CHAT_MAX_LENGTH) {
        return { accepted: false, reason: "Сообщение слишком длинное" };
      }
      if (!chatLimiter.allow(user.id)) {
        return { accepted: false, reason: "Слишком часто, притормози" };
      }

      const message: ChatMessagePayload = {
        id: randomUUID(),
        playerId: user.id,
        nickname: user.nickname,
        avatarId: user.avatarId,
        text,
        at: Date.now(),
      };

      pushChat(managed, message);
      io.to(roomKey).emit(SERVER_EVENT.chatMessage, message);

      return { accepted: true };
    });
  });

  socket.on("disconnect", () => {
    manager.leave(user, roomKey);
    void broadcastState(io, managed);
  });
}

/** Состояние комнаты глазами конкретного игрока. */
export function buildState(
  managed: ManagedRoom,
  viewerId: string,
): RoomStatePayload {
  const view = managed.room.view();
  // В фазе READY вопрос знает только ведущий.
  const questionVisible = view.questionVisibleToAll || view.hostId === viewerId;
  const winners = new Set(view.reveal?.winners ?? []);

  return {
    roomKey: managed.key,
    phase: view.phase,
    deadline: view.deadline,
    phaseDurationMs: view.phaseDurationMs,
    serverTime: Date.now(),
    hostId: view.hostId,
    question: questionVisible ? (managed.question?.text ?? null) : null,
    questionAdult: questionVisible && (managed.question?.adult ?? false),
    players: view.players.map((player) => {
      const profile = managed.profiles.get(player.id);
      return {
        id: player.id,
        nickname: profile?.nickname ?? "Игрок",
        avatarId: profile?.avatarId ?? 0,
        score: player.score,
        roundsPlayed: player.roundsPlayed,
        hasBet: player.hasBet,
        isHost: player.isHost,
      };
    }),
    reveal: view.reveal
      ? {
          hostAnswer: view.reveal.hostAnswer,
          bets: view.reveal.bets.map((bet) => ({
            playerId: bet.playerId,
            bet: bet.bet,
            distance: view.reveal?.distances[bet.playerId] ?? null,
            won: winners.has(bet.playerId),
          })),
        }
      : null,
    pauseReason: view.pauseReason,
    youId: viewerId,
  };
}

/** Каждому своё состояние: вопрос в фазе READY виден только ведущему. */
async function broadcastState(io: IOServer, managed: ManagedRoom) {
  const sockets = await io.in(managed.key).fetchSockets();

  for (const socket of sockets) {
    const user = socket.data.user as SocketUser | undefined;
    if (!user) continue;
    socket.emit(SERVER_EVENT.state, buildState(managed, user.id));
  }
}

interface HandlerResult {
  accepted: boolean;
  reason?: string;
}

/** Разбирает необязательный колбэк подтверждения и отвечает автору действия. */
function respond(
  args: unknown[],
  handler: (payload: unknown) => HandlerResult,
): void {
  const ack = args.find(
    (arg): arg is (result: Ack) => void => typeof arg === "function",
  );
  const payload = args.find((arg) => typeof arg !== "function");

  let result: HandlerResult;
  try {
    result = handler(payload);
  } catch (error) {
    console.error("[socket] действие упало:", error);
    result = { accepted: false, reason: "Что-то сломалось на сервере" };
  }

  ack?.(
    result.accepted ? { ok: true } : { ok: false, error: result.reason ?? "" },
  );
}

function tooFast(): HandlerResult {
  return { accepted: false, reason: "Слишком много действий, притормози" };
}

function readBet(payload: unknown): unknown {
  if (typeof payload === "object" && payload !== null && "bet" in payload) {
    return (payload as { bet: unknown }).bet;
  }
  return payload;
}

function readText(payload: unknown): string | null {
  const raw =
    typeof payload === "object" && payload !== null && "text" in payload
      ? (payload as { text: unknown }).text
      : payload;

  return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null;
}
