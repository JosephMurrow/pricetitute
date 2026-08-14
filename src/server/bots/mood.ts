import { randomInt } from "node:crypto";
import { BOT_PHRASES, BOT_TAUNT_PHRASES, BOT_WHINE_PHRASES } from "./roster";

/**
 * Настроение бота по текущему счёту: сильно отстал — ноет, сильно оторвался —
 * подкалывает, иначе просто болтает.
 */
export type BotMood = "taunt" | "whine" | "idle";

/** Разрыв в очках, с которого бот меняет тон. */
export const LEAD_GAP = 3;

export interface Standing {
  id: string;
  score: number;
}

export function moodOf(standings: readonly Standing[], botId: string): BotMood {
  const mine = standings.find((entry) => entry.id === botId)?.score ?? 0;
  const others = standings
    .filter((entry) => entry.id !== botId)
    .map((entry) => entry.score);

  // Один за столом — сравнивать не с кем.
  if (others.length === 0) return "idle";

  const best = Math.max(...others);
  if (mine - best >= LEAD_GAP) return "taunt";
  if (best - mine >= LEAD_GAP) return "whine";

  return "idle";
}

export function phraseFor(mood: BotMood): string {
  const pool =
    mood === "taunt"
      ? BOT_TAUNT_PHRASES
      : mood === "whine"
        ? BOT_WHINE_PHRASES
        : BOT_PHRASES;

  return pool[randomInt(pool.length)] ?? "…";
}
