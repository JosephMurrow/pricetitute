"use client";

import { Avatar } from "@/components/Avatar";
import { roomLeaders } from "@/lib/game/crowns";
import type { PlayerPayload, RoomStatePayload } from "@/shared/protocol";
import { Crown } from "./Crown";

export function PlayerList({
  state,
  onKick,
}: {
  state: RoomStatePayload;
  /** Выгнать игрока: доступно только хозяину приватной комнаты. */
  onKick?: (playerId: string) => void;
}) {
  const ranked = [...state.players].sort((a, b) => b.score - a.score);
  const leaders = roomLeaders(state.players);
  const youAreOwner =
    state.ownerId !== null && state.ownerId === state.youId && Boolean(onKick);

  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <h2 className="mb-3 text-sm font-semibold text-muted">
        Игроки · {state.players.length}
      </h2>

      <ul className="flex flex-col gap-2">
        {ranked.map((player) => (
          <li
            key={player.id}
            className={`group flex items-center gap-3 rounded-xl px-2 py-1.5 ${
              player.id === state.youId ? "bg-tint" : ""
            }`}
          >
            <Avatar id={player.avatarId} size={36} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {leaders.has(player.id) && (
                  <Crown title="Лидер комнаты" className="mr-1" />
                )}
                {player.nickname}
                {player.id === state.youId && (
                  <span className="ml-1 text-xs text-muted">· ты</span>
                )}
              </p>
              <p className="text-xs text-muted">{status(player, state)}</p>
            </div>

            {youAreOwner && player.id !== state.youId && (
              <button
                type="button"
                onClick={() => onKick?.(player.id)}
                title={`Выгнать ${player.nickname}`}
                aria-label={`Выгнать ${player.nickname}`}
                className="shrink-0 rounded-md px-1.5 py-0.5 text-xs text-muted opacity-0 transition hover:text-crimson focus:opacity-100 group-hover:opacity-100"
              >
                ✕
              </button>
            )}

            <span className="tabular shrink-0 text-sm font-semibold text-crimson">
              {player.score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function status(player: PlayerPayload, state: RoomStatePayload): string {
  if (player.id === state.ownerId) {
    return player.isHost ? "ведущий · хозяин" : "хозяин комнаты";
  }
  if (player.isHost) return "ведущий";

  if (state.phase === "betting") {
    return player.hasBet ? "поставил" : "думает";
  }

  return `раундов: ${player.roundsPlayed}`;
}
