import type { Bet } from "@/lib/game/bet";
import type { PauseReason, Phase } from "@/lib/game/room";

/**
 * Контракт сокетов: типы делят клиент и сервер, поэтому здесь не должно быть
 * ничего серверного — только описания сообщений.
 */

export const GLOBAL_ROOM = "global";

/** Путь, по которому Socket.IO принимает подключения. */
export const SOCKET_PATH = "/socket.io";

export const SERVER_EVENT = {
  /** Полный снимок комнаты: он же и есть восстановление после реконнекта. */
  state: "room:state",
  chatHistory: "chat:history",
  chatMessage: "chat:message",
  /** Причина принудительного отключения. */
  kicked: "room:kicked",
} as const;

export const CLIENT_EVENT = {
  read: "round:read",
  answer: "round:answer",
  bet: "round:bet",
  chat: "chat:send",
} as const;

export interface PlayerPayload {
  id: string;
  nickname: string;
  avatarId: number;
  score: number;
  roundsPlayed: number;
  /** Поставил ли в текущем раунде. Сама ставка до вскрышки не приходит. */
  hasBet: boolean;
  isHost: boolean;
}

export interface RevealBetPayload {
  playerId: string;
  bet: Bet;
  /** Промах по логарифмической шкале; null — ставка не участвовала. */
  distance: number | null;
  won: boolean;
}

export interface RevealPayload {
  hostAnswer: Bet;
  bets: RevealBetPayload[];
}

export interface RoomStatePayload {
  roomKey: string;
  phase: Phase;
  /** Абсолютное время конца фазы, unix ms. */
  deadline: number | null;
  /** Полная длительность фазы: по ней рисуется шкала обратного отсчёта. */
  phaseDurationMs: number | null;
  /**
   * Время сервера в момент отправки. Часы клиента врут, поэтому обратный
   * отсчёт считается как deadline − serverTime, а не по локальному времени.
   */
  serverTime: number;
  hostId: string | null;
  /**
   * Текст вопроса. В фазе READY приходит только ведущему — остальные видят
   * null до того, как он нажмёт «Прочитал».
   */
  question: string | null;
  questionAdult: boolean;
  players: PlayerPayload[];
  /** Заполнено только в фазе вскрышки. */
  reveal: RevealPayload | null;
  /** Почему комната стоит: только в фазе ожидания. */
  pauseReason: PauseReason | null;
  /** Идентификатор получателя — клиенту удобнее не гадать, кто из игроков он. */
  youId: string;
}

export interface ChatMessagePayload {
  id: string;
  playerId: string;
  nickname: string;
  avatarId: number;
  text: string;
  at: number;
}

/** Ответ на действие игрока. */
export interface Ack {
  ok: boolean;
  error?: string;
}

export const CHAT_MAX_LENGTH = 300;
export const CHAT_HISTORY_SIZE = 100;
