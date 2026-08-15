/**
 * Кто в комнате носит корону.
 *
 * Корона — за первое место по очкам прямо сейчас. При ничьей носят все:
 * отбирать её по какому-нибудь скрытому признаку вроде порядка входа было бы
 * враньём, никто из лидеров не хуже другого.
 */

export interface Scored {
  id: string;
  score: number;
}

export function roomLeaders(players: readonly Scored[]): ReadonlySet<string> {
  const best = players.reduce((top, player) => Math.max(top, player.score), 0);

  // В начале партии все на нуле — короновать некого. Нулевой лидер выглядел бы
  // насмешкой, да и корона на всех сразу ничего не сообщает.
  if (best <= 0) return new Set();

  return new Set(
    players
      .filter((player) => player.score === best)
      .map((player) => player.id),
  );
}
