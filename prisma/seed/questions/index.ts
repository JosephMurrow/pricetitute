import { adult01 } from "./adult-01";
import { daily01 } from "./daily-01";
import { daily02 } from "./daily-02";
import { daily03 } from "./daily-03";
import { social01 } from "./social-01";
import { social02 } from "./social-02";

export type SeedCategory = "DAILY" | "SOCIAL" | "ADULT";

export interface QuestionSeed {
  text: string;
  category: SeedCategory;
  adult: boolean;
}

function batch(texts: string[], category: SeedCategory): QuestionSeed[] {
  return texts.map((text) => ({
    text,
    category,
    adult: category === "ADULT",
  }));
}

/**
 * Стартовый пул. Пропорция задана в docs/ROADMAP.md: половина бытовых,
 * треть социально рискованных, пятая часть 18+.
 */
export const QUESTIONS: QuestionSeed[] = [
  ...batch(daily01, "DAILY"),
  ...batch(daily02, "DAILY"),
  ...batch(daily03, "DAILY"),
  ...batch(social01, "SOCIAL"),
  ...batch(social02, "SOCIAL"),
  ...batch(adult01, "ADULT"),
];
