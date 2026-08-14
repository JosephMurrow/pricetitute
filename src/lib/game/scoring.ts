import { isNever, type Bet } from "./bet";

/**
 * Подсчёт очков раунда (см. docs/SPEC.md §5.2).
 *
 * Близость меряется по порядку величины: важно, во сколько раз игрок
 * промахнулся, а не на сколько рублей. При ответе ведущего 100 000 ₽ ставка
 * 300 000 ближе, чем 10 000, хотя по абсолютной разнице проигрывала бы.
 */

/** Допуск при сравнении расстояний: логарифмы редко совпадают бит в бит. */
const TIE_EPSILON = 1e-9;

export interface PlayerBet {
  playerId: string;
  bet: Bet;
}

export interface RoundOutcome {
  /** Кто получил очко. Пусто, если побеждать некому. */
  winners: string[];
  /**
   * Промах игрока по логарифмической шкале, для наглядной вскрышки.
   * null — ставка в этом раунде не участвует в сравнении.
   */
  distances: Record<string, number | null>;
}

/**
 * Насколько ставка далека от ответа ведущего.
 * null означает «не сравнимо»: игрок отказался, а ведущий назвал сумму.
 */
export function distance(bet: Bet, hostAnswer: Bet): number | null {
  if (isNever(hostAnswer)) {
    return isNever(bet) ? 0 : null;
  }
  if (isNever(bet)) return null;

  // «Бесплатно» приравнивается к рублю: логарифма от нуля не существует.
  return Math.abs(
    Math.log10(Math.max(bet, 1)) - Math.log10(Math.max(hostAnswer, 1)),
  );
}

export function resolveRound(
  hostAnswer: Bet,
  bets: readonly PlayerBet[],
): RoundOutcome {
  const scored = bets.map((entry) => ({
    playerId: entry.playerId,
    bet: entry.bet,
    distance: distance(entry.bet, hostAnswer),
  }));

  const distances: Record<string, number | null> = {};
  for (const entry of scored) {
    distances[entry.playerId] = entry.distance;
  }

  if (isNever(hostAnswer)) {
    const refused = scored
      .filter((entry) => isNever(entry.bet))
      .map((entry) => entry.playerId);

    if (refused.length > 0) {
      return { winners: refused, distances };
    }

    // Никто не угадал отказ — очко тому, кто назвал самую большую сумму.
    const numeric = scored.filter(
      (entry): entry is typeof entry & { bet: number } => !isNever(entry.bet),
    );
    if (numeric.length === 0) return { winners: [], distances };

    const highest = Math.max(...numeric.map((entry) => entry.bet));
    return {
      winners: numeric
        .filter((entry) => entry.bet === highest)
        .map((entry) => entry.playerId),
      distances,
    };
  }

  const comparable = scored.filter(
    (entry): entry is typeof entry & { distance: number } =>
      entry.distance !== null,
  );
  if (comparable.length === 0) return { winners: [], distances };

  const closest = Math.min(...comparable.map((entry) => entry.distance));

  return {
    winners: comparable
      .filter((entry) => entry.distance <= closest + TIE_EPSILON)
      .map((entry) => entry.playerId),
    distances,
  };
}
