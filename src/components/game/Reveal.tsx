import { Avatar } from "@/components/Avatar";
import { formatBet, isNever } from "@/lib/game/bet";
import type { RoomStatePayload } from "@/shared/protocol";

/**
 * Вскрышка: ответ ведущего и все ставки разом. Длина полоски — насколько
 * игрок промахнулся по порядку величины.
 */
export function Reveal({ state }: { state: RoomStatePayload }) {
  const reveal = state.reveal;
  if (!reveal) return null;

  const players = new Map(state.players.map((player) => [player.id, player]));

  const sorted = [...reveal.bets].sort((a, b) => {
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-crimson/30 bg-tint p-5 text-center">
        <p className="text-sm text-muted">Ведущий согласился бы за</p>
        <p
          className={`mt-1 text-3xl font-bold text-crimson ${
            isNever(reveal.hostAnswer) ? "" : "tabular"
          }`}
        >
          {formatBet(reveal.hostAnswer)}
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-center text-sm text-muted">
          В этом раунде никто не успел поставить
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((bet, index) => {
            const player = players.get(bet.playerId);
            const share = accuracy(bet.distance, bet.won);

            return (
              <li
                key={bet.playerId}
                className={`reveal-row rounded-xl border p-3 ${
                  bet.won ? "border-gold bg-gold/10" : "border-line bg-paper"
                }`}
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              >
                <div className="flex items-center gap-3">
                  <Avatar id={player?.avatarId ?? 0} size={32} />

                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {player?.nickname ?? "Игрок"}
                  </span>

                  <span
                    className={`text-sm font-semibold ${
                      isNever(bet.bet) ? "" : "tabular"
                    }`}
                  >
                    {formatBet(bet.bet)}
                  </span>

                  {bet.won && (
                    <span className="rounded-md bg-gold px-1.5 py-0.5 text-xs font-bold text-paper">
                      +1
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-tint">
                    <div
                      className={`h-full rounded-full ${
                        bet.won ? "bg-gold" : "bg-rose/60"
                      }`}
                      style={{ width: `${share * 100}%` }}
                    />
                  </div>
                  <span className="w-28 shrink-0 text-right text-xs text-muted">
                    {miss(bet.distance, bet.won)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Длина полоски — точность, а не промах: у самого близкого она самая длинная.
 * Шкала абсолютная, промах в сто раз обнуляет полоску. Так строка не пляшет
 * от того, насколько плохо угадали остальные.
 */
const ZERO_AT = 2;

function accuracy(distance: number | null, won: boolean): number {
  // Когда ведущий отказался, а угадавших не нашлось, очко берёт самая большая
  // ставка: сравнивать её не с чем, но полоска должна быть полной.
  if (distance === null) return won ? 1 : 0;
  return Math.max(0, 1 - distance / ZERO_AT);
}

/** Промах словами: во сколько раз мимо. */
function miss(distance: number | null, won: boolean): string {
  if (distance === null) return won ? "самая большая ставка" : "вне сравнения";
  if (distance === 0) return "точно в цель";

  const times = Math.pow(10, distance);
  if (times < 10) return `мимо в ${times.toFixed(1)} раза`;
  return `мимо в ${Math.round(times).toLocaleString("ru-RU")} раз`;
}
