"use client";

import { useState } from "react";
import type { RoomStatePayload } from "@/shared/protocol";

/** Приглашение и правила партии — видно всем, кто в приватной комнате. */
export function RoomPanel({ state }: { state: RoomStatePayload }) {
  const [copied, setCopied] = useState(false);

  if (!state.roomCode) return null;

  const link =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/r/${state.roomCode}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-muted">Своя комната</h2>
        <span className="tabular text-sm font-bold tracking-widest text-crimson">
          {state.roomCode}
        </span>
      </div>

      <button
        type="button"
        onClick={() => void copy()}
        className="w-full rounded-lg border border-line bg-blush px-3 py-2 text-sm transition hover:border-crimson hover:text-crimson"
      >
        {copied ? "Ссылка скопирована" : "Скопировать приглашение"}
      </button>

      <p className="mt-3 text-xs text-muted">{rules(state)}</p>
    </div>
  );
}

function rules(state: RoomStatePayload): string {
  const parts: string[] = [];

  if (state.endMode === "rounds" && state.endValue) {
    parts.push(`до ${state.endValue} раундов (сыграно ${state.roundsPlayed})`);
  } else if (state.endMode === "points" && state.endValue) {
    parts.push(`до ${state.endValue} очков`);
  } else {
    parts.push("играем, пока не надоест");
  }

  parts.push("счёт наружу не уходит");

  return parts.join(" · ");
}
