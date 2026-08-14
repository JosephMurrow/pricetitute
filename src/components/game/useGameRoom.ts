"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { Bet } from "@/lib/game/bet";
import {
  CLIENT_EVENT,
  SERVER_EVENT,
  SOCKET_PATH,
  type Ack,
  type ChatMessagePayload,
  type RoomStatePayload,
} from "@/shared/protocol";

const ERROR_LIFETIME_MS = 4000;

export interface GameRoomHandle {
  state: RoomStatePayload | null;
  chat: ChatMessagePayload[];
  connected: boolean;
  /** Насколько часы сервера впереди клиентских, мс. */
  clockOffset: number;
  error: string | null;
  confirmRead: () => Promise<void>;
  submitAnswer: (bet: Bet) => Promise<void>;
  placeBet: (bet: Bet) => Promise<void>;
  sendChat: (text: string) => Promise<boolean>;
}

/**
 * Подключение к игровой комнате. Сервер шлёт полный снимок состояния, поэтому
 * хук ничего не досчитывает — только хранит последний снимок и поправку часов.
 */
export function useGameRoom(): GameRoomHandle {
  const [state, setState] = useState<RoomStatePayload | null>(null);
  const [chat, setChat] = useState<ChatMessagePayload[]>([]);
  const [connected, setConnected] = useState(false);
  const [clockOffset, setClockOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io({ path: SOCKET_PATH });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setError(null);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (reason: Error) => {
      setConnected(false);
      setError(reason.message);
    });

    socket.on(SERVER_EVENT.state, (payload: RoomStatePayload) => {
      setClockOffset(payload.serverTime - Date.now());
      setState(payload);
    });
    socket.on(SERVER_EVENT.chatHistory, (history: ChatMessagePayload[]) => {
      setChat(history);
    });
    socket.on(SERVER_EVENT.chatMessage, (message: ChatMessagePayload) => {
      setChat((previous) => [...previous, message].slice(-100));
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  // Ошибка действия — это подсказка на секунду, а не состояние экрана.
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), ERROR_LIFETIME_MS);
    return () => clearTimeout(timer);
  }, [error]);

  const emit = useCallback(
    (event: string, payload: unknown = {}): Promise<Ack> =>
      new Promise((resolve) => {
        const socket = socketRef.current;
        if (!socket) {
          resolve({ ok: false, error: "Нет соединения с сервером" });
          return;
        }
        socket.emit(event, payload, (ack: Ack) => resolve(ack));
      }),
    [],
  );

  const act = useCallback(
    async (event: string, payload?: unknown): Promise<boolean> => {
      const ack = await emit(event, payload);
      if (!ack.ok) setError(ack.error ?? "Действие отклонено");
      return ack.ok;
    },
    [emit],
  );

  const confirmRead = useCallback(async () => {
    await act(CLIENT_EVENT.read);
  }, [act]);

  const submitAnswer = useCallback(
    async (bet: Bet) => {
      await act(CLIENT_EVENT.answer, { bet });
    },
    [act],
  );

  const placeBet = useCallback(
    async (bet: Bet) => {
      await act(CLIENT_EVENT.bet, { bet });
    },
    [act],
  );

  const sendChat = useCallback(
    (text: string) => act(CLIENT_EVENT.chat, { text }),
    [act],
  );

  return {
    state,
    chat,
    connected,
    clockOffset,
    error,
    confirmRead,
    submitAnswer,
    placeBet,
    sendChat,
  };
}
