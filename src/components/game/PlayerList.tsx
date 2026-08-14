import { Avatar } from "@/components/Avatar";
import type { PlayerPayload, RoomStatePayload } from "@/shared/protocol";

export function PlayerList({ state }: { state: RoomStatePayload }) {
  const ranked = [...state.players].sort((a, b) => b.score - a.score);

  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <h2 className="mb-3 text-sm font-semibold text-muted">
        Игроки · {state.players.length}
      </h2>

      <ul className="flex flex-col gap-2">
        {ranked.map((player) => (
          <li
            key={player.id}
            className={`flex items-center gap-3 rounded-xl px-2 py-1.5 ${
              player.id === state.youId ? "bg-tint" : ""
            }`}
          >
            <Avatar id={player.avatarId} size={36} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {player.nickname}
                {player.id === state.youId && (
                  <span className="ml-1 text-xs text-muted">· ты</span>
                )}
              </p>
              <p className="text-xs text-muted">{status(player, state)}</p>
            </div>

            <span className="tabular text-sm font-semibold text-crimson">
              {player.score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function status(player: PlayerPayload, state: RoomStatePayload): string {
  if (player.isHost) return "ведущий";

  if (state.phase === "betting") {
    return player.hasBet ? "поставил" : "думает";
  }

  return `раундов: ${player.roundsPlayed}`;
}
