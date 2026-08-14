import { Room, type GameEvent } from "../lib/game/room";
import { RoomRunner } from "../lib/game/runner";
import { loadScores, persistRound } from "../lib/game/store";
import type { QuestionQueue } from "../lib/questions/queue";
import {
  getQuestionCard,
  loadQuestionQueue,
  saveQuestionQueue,
  type QuestionCard,
  type QuestionPoolOptions,
} from "../lib/questions/store";
import type { ChatMessagePayload } from "../shared/protocol";
import { CHAT_HISTORY_SIZE } from "../shared/protocol";
import type { SocketUser } from "./auth";

export interface ManagedRoom {
  key: string;
  room: Room;
  runner: RoomRunner;
  queue: QuestionQueue;
  options: QuestionPoolOptions;
  /** Текст текущего вопроса, чтобы не ходить в базу на каждую рассылку. */
  question: QuestionCard | null;
  chat: ChatMessagePayload[];
  /** Ники и аватары игроков комнаты. */
  profiles: Map<string, SocketUser>;
  /** Сколько вкладок открыто у каждого игрока. */
  connections: Map<string, number>;
  /** Очередь побочных эффектов: записи в базу не должны обгонять друг друга. */
  tail: Promise<void>;
}

export type Broadcast = (room: ManagedRoom) => void;

/**
 * Живые комнаты процесса. Состояние игры держится в памяти, в базу уходят
 * только итоги раундов и порядок очереди вопросов.
 */
export class RoomManager {
  private readonly rooms = new Map<string, ManagedRoom>();
  private readonly opening = new Map<string, Promise<ManagedRoom>>();

  constructor(private readonly broadcast: Broadcast) {}

  /** Игрок подключился. Первая вкладка сажает его за стол. */
  async join(
    user: SocketUser,
    key: string,
    options: QuestionPoolOptions = { includeAdult: true },
  ): Promise<ManagedRoom> {
    const managed = await this.acquire(key, options);

    managed.profiles.set(user.id, user);
    const tabs = (managed.connections.get(user.id) ?? 0) + 1;
    managed.connections.set(user.id, tabs);

    if (tabs === 1) {
      managed.runner.run((room, now) => room.join(user.id, now));
    }

    return managed;
  }

  /** Игрок отключился. Уходит из-за стола, только когда закрыл все вкладки. */
  leave(user: SocketUser, key: string): void {
    const managed = this.rooms.get(key);
    if (!managed) return;

    const tabs = (managed.connections.get(user.id) ?? 1) - 1;

    if (tabs > 0) {
      managed.connections.set(user.id, tabs);
      return;
    }

    managed.connections.delete(user.id);
    managed.runner.run((room, now) => room.leave(user.id, now));
  }

  get(key: string): ManagedRoom | undefined {
    return this.rooms.get(key);
  }

  /** Погасить комнату: приватную после удаления, все — при остановке сервера. */
  close(key: string): void {
    const managed = this.rooms.get(key);
    if (!managed) return;

    managed.runner.stop();
    this.rooms.delete(key);
  }

  closeAll(): void {
    for (const key of [...this.rooms.keys()]) this.close(key);
  }

  private async acquire(
    key: string,
    options: QuestionPoolOptions,
  ): Promise<ManagedRoom> {
    const existing = this.rooms.get(key);
    if (existing) return existing;

    // Два одновременных подключения не должны поднять комнату дважды.
    const opening = this.opening.get(key);
    if (opening) return opening;

    const promise = this.open(key, options).finally(() => {
      this.opening.delete(key);
    });
    this.opening.set(key, promise);

    return promise;
  }

  private async open(
    key: string,
    options: QuestionPoolOptions,
  ): Promise<ManagedRoom> {
    const queue = await loadQuestionQueue(key, options);
    const scores = await loadScores(key);

    // QuestionQueue структурно подходит под QuestionSource движка.
    const room = new Room(key, queue);
    for (const [playerId, stats] of scores) room.setStats(playerId, stats);

    // Раннер ищет комнату по ключу, а не держит ссылку: иначе объект и раннер
    // ссылались бы друг на друга и один из них пришлось бы досоздавать.
    const runner = new RoomRunner(room, (events) => {
      const current = this.rooms.get(key);
      if (current) this.enqueue(current, events);
    });

    const managed: ManagedRoom = {
      key,
      room,
      runner,
      queue,
      options,
      question: null,
      chat: [],
      profiles: new Map(),
      connections: new Map(),
      tail: Promise.resolve(),
    };

    this.rooms.set(key, managed);
    runner.start();

    return managed;
  }

  /**
   * Побочные эффекты одной цепочкой: запись раунда, обновление очереди и
   * рассылка идут строго по порядку, даже если события пришли пачкой.
   */
  private enqueue(managed: ManagedRoom, events: GameEvent[]): void {
    managed.tail = managed.tail
      .then(() => this.applyEvents(managed, events))
      .catch((error: unknown) => {
        console.error(`[room ${managed.key}] обработка событий упала:`, error);
      })
      .then(() => {
        this.broadcast(managed);
      });
  }

  private async applyEvents(
    managed: ManagedRoom,
    events: GameEvent[],
  ): Promise<void> {
    let queueTouched = false;

    for (const event of events) {
      switch (event.type) {
        case "round_started":
          managed.question = await getQuestionCard(event.questionId);
          queueTouched = true;
          break;

        case "round_resolved":
          await persistRound(managed.key, event.record);
          break;

        case "round_aborted":
          managed.question = null;
          queueTouched = true;
          break;

        case "paused":
          managed.question = null;
          queueTouched = true;
          break;
      }
    }

    if (queueTouched) {
      await saveQuestionQueue(managed.key, managed.queue, managed.options);
    }
  }
}

/** Добавить сообщение в кольцевой буфер чата комнаты. */
export function pushChat(
  managed: ManagedRoom,
  message: ChatMessagePayload,
): void {
  managed.chat.push(message);
  if (managed.chat.length > CHAT_HISTORY_SIZE) {
    managed.chat.splice(0, managed.chat.length - CHAT_HISTORY_SIZE);
  }
}
