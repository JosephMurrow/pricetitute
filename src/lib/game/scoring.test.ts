import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NEVER } from "./bet";
import { distance, resolveRound } from "./scoring";

describe("distance", () => {
  it("считает промах по порядку величины", () => {
    assert.equal(distance(1000, 100), 1);
    assert.equal(distance(100, 1000), 1);
    assert.equal(distance(500, 500), 0);
  });

  it("приравнивает «Бесплатно» к рублю", () => {
    assert.equal(distance(0, 1), 0);
    assert.equal(distance(0, 100), 2);
  });

  it("не сравнивает отказ с суммой", () => {
    assert.equal(distance(NEVER, 1000), null);
    assert.equal(distance(1000, NEVER), null);
  });

  it("считает отказ против отказа точным попаданием", () => {
    assert.equal(distance(NEVER, NEVER), 0);
  });
});

describe("resolveRound", () => {
  it("выбирает ближайшего по порядку величины, а не по разнице в рублях", () => {
    // Пример из спеки: 300 000 промахивается в 3 раза, 10 000 — в 10 раз,
    // хотя по абсолютной разнице 10 000 ближе.
    const outcome = resolveRound(100_000, [
      { playerId: "выше", bet: 300_000 },
      { playerId: "ниже", bet: 10_000 },
    ]);

    assert.deepEqual(outcome.winners, ["выше"]);
  });

  it("даёт очко всем при равном промахе", () => {
    const outcome = resolveRound(100, [
      { playerId: "меньше", bet: 10 },
      { playerId: "больше", bet: 1000 },
    ]);

    assert.deepEqual([...outcome.winners].sort(), ["больше", "меньше"]);
  });

  it("отдаёт очко за точное совпадение", () => {
    const outcome = resolveRound(50_000, [
      { playerId: "точно", bet: 50_000 },
      { playerId: "мимо", bet: 60_000 },
    ]);

    assert.deepEqual(outcome.winners, ["точно"]);
    assert.equal(outcome.distances["точно"], 0);
  });

  it("при отказе ведущего награждает всех, кто тоже отказался", () => {
    const outcome = resolveRound(NEVER, [
      { playerId: "первый", bet: NEVER },
      { playerId: "второй", bet: NEVER },
      { playerId: "третий", bet: 1_000_000 },
    ]);

    assert.deepEqual([...outcome.winners].sort(), ["второй", "первый"]);
  });

  it("при отказе ведущего без угадавших награждает максимальную ставку", () => {
    const outcome = resolveRound(NEVER, [
      { playerId: "скромный", bet: 1000 },
      { playerId: "щедрый", bet: 999_999 },
    ]);

    assert.deepEqual(outcome.winners, ["щедрый"]);
  });

  it("делит очко между одинаковыми максимальными ставками при отказе ведущего", () => {
    const outcome = resolveRound(NEVER, [
      { playerId: "первый", bet: 500_000 },
      { playerId: "второй", bet: 500_000 },
      { playerId: "третий", bet: 100 },
    ]);

    assert.deepEqual([...outcome.winners].sort(), ["второй", "первый"]);
  });

  it("не даёт отказавшемуся выиграть у числового ответа", () => {
    const outcome = resolveRound(1000, [
      { playerId: "отказ", bet: NEVER },
      { playerId: "мимо", bet: 1_000_000 },
    ]);

    assert.deepEqual(outcome.winners, ["мимо"]);
    assert.equal(outcome.distances["отказ"], null);
  });

  it("оставляет раунд без победителя, если все отказались, а ведущий назвал сумму", () => {
    const outcome = resolveRound(5000, [
      { playerId: "первый", bet: NEVER },
      { playerId: "второй", bet: NEVER },
    ]);

    assert.deepEqual(outcome.winners, []);
  });

  it("оставляет раунд без победителя, если ставок не было", () => {
    assert.deepEqual(resolveRound(1000, []).winners, []);
    assert.deepEqual(resolveRound(NEVER, []).winners, []);
  });

  it("сравнивает нули и единицы без деления на ноль", () => {
    const outcome = resolveRound(0, [
      { playerId: "даром", bet: 0 },
      { playerId: "рубль", bet: 1 },
      { playerId: "сотня", bet: 100 },
    ]);

    assert.deepEqual([...outcome.winners].sort(), ["даром", "рубль"]);
  });

  it("не теряет победителя из-за погрешности логарифмов", () => {
    // Симметричные ставки вокруг ответа: расстояния равны математически,
    // но в double могут разойтись в последнем бите.
    const outcome = resolveRound(1_000_000, [
      { playerId: "вниз", bet: 1000 },
      { playerId: "вверх", bet: 1_000_000_000 },
    ]);

    assert.deepEqual([...outcome.winners].sort(), ["вверх", "вниз"]);
  });
});
