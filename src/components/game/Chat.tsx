"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { CHAT_MAX_LENGTH, type ChatMessagePayload } from "@/shared/protocol";

export function Chat({
  messages,
  youId,
  onSend,
}: {
  messages: ChatMessagePayload[];
  youId: string;
  onSend: (text: string) => Promise<boolean>;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function submit() {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setBusy(true);
    const sent = await onSend(trimmed);
    setBusy(false);
    if (sent) setText("");
  }

  return (
    <div className="flex min-h-0 flex-col rounded-2xl border border-line bg-paper">
      <h2 className="border-b border-line px-4 py-3 text-sm font-semibold text-muted">
        Чат
      </h2>

      <div className="flex max-h-64 min-h-24 flex-1 flex-col gap-2 overflow-y-auto p-3 lg:max-h-none">
        {messages.length === 0 && (
          <p className="py-4 text-center text-xs text-muted">
            Пока тихо. Скажи что-нибудь.
          </p>
        )}

        {messages.map((message) => (
          <div key={message.id} className="flex items-start gap-2">
            <Avatar id={message.avatarId} size={24} className="mt-0.5" />
            <p className="min-w-0 flex-1 break-words text-sm">
              <span
                className={`mr-1 font-medium ${
                  message.playerId === youId ? "text-crimson" : "text-muted"
                }`}
              >
                {message.nickname}
              </span>
              {message.text}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-line p-3">
        <input
          value={text}
          maxLength={CHAT_MAX_LENGTH}
          placeholder="Сообщение"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void submit();
          }}
          className="min-w-0 flex-1 rounded-lg border border-line bg-blush px-3 py-2 text-sm outline-none transition focus:border-crimson"
        />
        <button
          type="button"
          disabled={busy || text.trim() === ""}
          onClick={() => void submit()}
          className="rounded-lg bg-crimson px-3 py-2 text-sm font-semibold text-paper transition hover:bg-deep disabled:opacity-50"
        >
          Отправить
        </button>
      </div>
    </div>
  );
}
