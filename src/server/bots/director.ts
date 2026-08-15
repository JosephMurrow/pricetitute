import { randomInt, randomUUID } from "node:crypto";
import { NEVER, type Bet } from "../../lib/game/bet";
import { prisma } from "../../lib/prisma";
import { robotAvatarId } from "../../lib/robots";
import type { ChatMessagePayload } from "../../shared/protocol";
import type { GameEvent } from "../../lib/game/room";
import type { ManagedRoom, RoomManager } from "../rooms";
import { moodOf, poolFor } from "./mood";
import { PhraseMemory } from "./phrases";
import {
  BOT_HOST_ASLEEP_PHRASES,
  BOT_HOST_MUTE_PHRASES,
  BOT_ROSTER,
  BOT_VICTORY_PHRASES,
} from "./roster";

/**
 * Режим «Forever alone»: комната набивается ботами, чтобы играть одному.
 *
 * Боты — обычные игроки движка с настоящими записями в таблице пользователей
 * (иначе не сохранить раунд), но без пароля и без доступа к входу. Как только
 * в комнату заходит живой человек, боты прощаются и уходят.
 */

/** Сколько ботов приходит по кнопке. */
export const BOT_PARTY_SIZE = 10;

const TICK_MS = 1000;

/** Разброс пауз между репликами одного бота. */
const CHAT_MIN_MS = 30_000;
const CHAT_MAX_MS = 190_000;
/** Столько комната молчит после любой ботовской реплики. */
const CHAT_COOLDOWN_MS = 40_000;

/** Задержки перед игровыми действиями, чтобы бот не отвечал мгновенно. */
const READ_DELAY = [1500, 5000] as const;
const ANSWER_DELAY = [1500, 6000] as const;
const BET_DELAY = [2000, 15_000] as const;

interface Seat {
  userId: string;
  nickname: string;
  avatarId: number;
  farewell: string;
  /** Когда бот собирается заговорить. */
  nextChatAt: number;
  /** Когда бот собирается сделать игровой ход. */
  actAt: number;
  /** В какой фазе бот уже отыграл: чтобы не дублировать действие. */
  actedIn: string;
}

export interface BotDeps {
  /** Отправить реплику в чат комнаты. */
  sendChat: (roomKey: string, message: ChatMessagePayload) => void;
}

export class BotDirector {
  private readonly parties = new Map<string, Seat[]>();
  /** Когда в комнате последний раз говорил бот. */
  private readonly lastChatAt = new Map<string, number>();
  /** Вопрос последней вскрышки, которую уже отпраздновали. */
  private readonly celebrated = new Map<string, string>();
  /** Что в комнате уже звучало: одна фраза не повторяется пять минут. */
  private readonly said = new Map<string, PhraseMemory>();
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly manager: RoomManager,
    private readonly deps: BotDeps,
  ) {}

  start(): void {
    if (this.timer) return;
    this.manager.onEvents = (roomKey, events) => this.react(roomKey, events);
    this.timer = setInterval(() => this.tick(), TICK_MS);
    this.timer.unref?.();
  }

  /**
   * Реакция на сгоревший раунд. Подкалываем только живого ведущего: боты
   * успевают всегда, а издевательство над своим выглядело бы странно.
   */
  private react(roomKey: string, events: GameEvent[]): void {
    const seats = this.parties.get(roomKey);
    if (!seats || seats.length === 0) return;

    for (const event of events) {
      if (event.type !== "round_aborted") continue;
      if (event.reason === "host_left") continue;
      if (seats.some((seat) => seat.userId === event.hostId)) continue;

      const seat = seats[randomInt(seats.length)];
      if (!seat) continue;

      const pool =
        event.reason === "host_silent"
          ? BOT_HOST_ASLEEP_PHRASES
          : BOT_HOST_MUTE_PHRASES;

      this.deps.sendChat(roomKey, message(seat, this.say(roomKey, pool)));
      this.lastChatAt.set(roomKey, Date.now());
      return;
    }
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  hasParty(roomKey: string): boolean {
    return (this.parties.get(roomKey)?.length ?? 0) > 0;
  }

  /** Посадить в комнату компанию ботов. */
  async fill(roomKey: string): Promise<number> {
    const managed = this.manager.get(roomKey);
    if (!managed || this.hasParty(roomKey)) return 0;

    const profiles = pickMany(BOT_ROSTER, BOT_PARTY_SIZE);
    const now = Date.now();
    const seats: Seat[] = [];

    for (const [index, profile] of profiles.entries()) {
      const avatarId = robotAvatarId(index);
      const user = await prisma.user.upsert({
        where: { login: botLogin(profile.nickname) },
        create: {
          login: botLogin(profile.nickname),
          passwordHash: "-",
          nickname: profile.nickname,
          avatarId,
          isBot: true,
        },
        update: { nickname: profile.nickname, avatarId, isBot: true },
        select: { id: true },
      });

      seats.push({
        userId: user.id,
        nickname: profile.nickname,
        avatarId,
        farewell: profile.farewell,
        // Первая реплика — не сразу, чтобы вход не превратился в стену текста.
        nextChatAt: now + randomBetween(5_000, CHAT_MAX_MS),
        actAt: 0,
        actedIn: "",
      });
    }

    this.parties.set(roomKey, seats);

    for (const seat of seats) {
      managed.profiles.set(seat.userId, {
        id: seat.userId,
        nickname: seat.nickname,
        avatarId: seat.avatarId,
      });
      managed.runner.run((room, at) => room.join(seat.userId, at));
    }

    return seats.length;
  }

  /** Боты прощаются и выходят: в комнату пришёл живой игрок. */
  farewell(roomKey: string): void {
    const seats = this.parties.get(roomKey);
    const managed = this.manager.get(roomKey);
    if (!seats || !managed) return;

    this.parties.delete(roomKey);
    this.lastChatAt.delete(roomKey);
    this.celebrated.delete(roomKey);
    this.said.delete(roomKey);

    for (const seat of seats) {
      this.deps.sendChat(roomKey, message(seat, seat.farewell));
      managed.profiles.delete(seat.userId);
      managed.runner.run((room, at) => room.leave(seat.userId, at));
    }
  }

  /** Убрать ботов молча: комната закрывается. */
  dismiss(roomKey: string): void {
    this.parties.delete(roomKey);
    this.lastChatAt.delete(roomKey);
    this.celebrated.delete(roomKey);
    this.said.delete(roomKey);
  }

  private tick(): void {
    const now = Date.now();

    for (const [roomKey, seats] of [...this.parties]) {
      const managed = this.manager.get(roomKey);
      if (!managed) {
        this.dismiss(roomKey);
        continue;
      }

      // Живой человек в комнате не один — ботам пора прощаться.
      if (managed.connections.size > 1) {
        this.farewell(roomKey);
        continue;
      }

      this.play(managed, seats, now);
      this.celebrate(managed, seats, now);
      this.chatter(managed, seats, now);
    }
  }

  /** Игровые ходы: прочитать вопрос, назвать сумму, поставить. */
  private play(managed: ManagedRoom, seats: Seat[], now: number): void {
    const view = managed.room.view();
    const phaseTag = `${view.phase}:${view.questionId ?? ""}`;

    for (const seat of seats) {
      if (seat.actedIn === phaseTag) continue;

      const isHost = view.hostId === seat.userId;
      const player = view.players.find((entry) => entry.id === seat.userId);

      const planned = plan(view.phase, isHost, player?.hasBet ?? false);
      if (!planned) continue;

      // Первый заход в фазу: назначаем момент действия и ждём его.
      if (seat.actAt === 0 || seat.actAt < now - 60_000) {
        seat.actAt = now + randomBetween(planned.delay[0], planned.delay[1]);
      }
      if (now < seat.actAt) continue;

      seat.actedIn = phaseTag;
      seat.actAt = 0;

      if (planned.action === "read") {
        managed.runner.run((room, at) => room.confirmRead(seat.userId, at));
      } else if (planned.action === "answer") {
        const bet = randomBet();
        managed.runner.run((room, at) =>
          room.submitHostAnswer(seat.userId, bet, at),
        );
      } else {
        const bet = randomBet();
        managed.runner.run((room, at) => room.placeBet(seat.userId, bet, at));
      }
    }
  }

  /**
   * Победная реплика на вскрышке. Идёт в обход общей паузы: она привязана к
   * моменту, а не к таймеру, иначе половина побед осталась бы без реакции.
   */
  private celebrate(managed: ManagedRoom, seats: Seat[], now: number): void {
    const view = managed.room.view();
    if (view.phase !== "reveal" || !view.questionId) return;

    // Один раунд празднуем один раз, даже если тик пришёл десять раз подряд.
    if (this.celebrated.get(managed.key) === view.questionId) return;
    this.celebrated.set(managed.key, view.questionId);

    const winners = new Set(view.reveal?.winners ?? []);
    const lucky = seats.filter((seat) => winners.has(seat.userId));
    if (lucky.length === 0) return;

    // Даже если победило несколько ботов, говорит один: хор из десяти
    // одинаковых поздравлений — это не веселье, а стена текста.
    const seat = lucky[randomInt(lucky.length)];
    if (!seat) return;

    this.deps.sendChat(
      managed.key,
      message(seat, this.say(managed.key, BOT_VICTORY_PHRASES)),
    );
    this.lastChatAt.set(managed.key, now);
  }

  /**
   * Реплика из набора с оглядкой на то, что в комнате уже звучало. Память
   * общая на все наборы: победная фраза и подколка ведущему считаются одинаково.
   */
  private say(roomKey: string, pool: readonly string[]): string {
    let memory = this.said.get(roomKey);
    if (!memory) {
      memory = new PhraseMemory();
      this.said.set(roomKey, memory);
    }

    return memory.pick(pool) ?? "…";
  }

  private chatter(managed: ManagedRoom, seats: Seat[], now: number): void {
    const roomKey = managed.key;
    const quietUntil = (this.lastChatAt.get(roomKey) ?? 0) + CHAT_COOLDOWN_MS;
    if (now < quietUntil) return;

    const ready = seats.filter((seat) => now >= seat.nextChatAt);
    if (ready.length === 0) return;

    const seat = ready[randomInt(ready.length)];
    if (!seat) return;

    const standings = managed.room
      .view()
      .players.map((player) => ({ id: player.id, score: player.score }));
    const mood = moodOf(standings, seat.userId);

    this.deps.sendChat(
      roomKey,
      message(seat, this.say(roomKey, poolFor(mood))),
    );

    this.lastChatAt.set(roomKey, now);
    seat.nextChatAt = now + randomBetween(CHAT_MIN_MS, CHAT_MAX_MS);
  }
}

interface Plan {
  action: "read" | "answer" | "bet";
  delay: readonly [number, number];
}

function plan(phase: string, isHost: boolean, hasBet: boolean): Plan | null {
  if (isHost && phase === "ready") return { action: "read", delay: READ_DELAY };
  if (isHost && phase === "host_answer") {
    return { action: "answer", delay: ANSWER_DELAY };
  }
  if (!isHost && phase === "betting" && !hasBet) {
    return { action: "bet", delay: BET_DELAY };
  }
  return null;
}

/**
 * Случайная сумма по логарифмической шкале: так суммы выглядят живыми —
 * и сотни, и миллионы попадаются одинаково часто. Изредка бот отказывается
 * или соглашается даром.
 */
function randomBet(): Bet {
  const roll = randomInt(100);
  if (roll < 6) return NEVER;
  if (roll < 10) return 0;

  const exponent = 2 + Math.random() * 5; // от сотни до десяти миллионов
  return Math.round(Math.pow(10, exponent));
}

function randomBetween(min: number, max: number): number {
  return min + randomInt(Math.max(1, max - min));
}

function pickMany<T>(source: readonly T[], count: number): T[] {
  const pool = [...source];
  const picked: T[] = [];

  while (picked.length < count && pool.length > 0) {
    const [item] = pool.splice(randomInt(pool.length), 1);
    if (item !== undefined) picked.push(item);
  }

  return picked;
}

function message(seat: Seat, text: string): ChatMessagePayload {
  return {
    id: randomUUID(),
    playerId: seat.userId,
    nickname: seat.nickname,
    avatarId: seat.avatarId,
    text,
    at: Date.now(),
  };
}

/** Логин бота: он никогда не входит, логин нужен только для уникальности. */
function botLogin(nickname: string): string {
  const hash = [...nickname].reduce(
    (acc, char) => (acc * 31 + char.codePointAt(0)!) % 1_000_000_007,
    7,
  );
  return `__bot_${hash.toString(36)}`;
}
