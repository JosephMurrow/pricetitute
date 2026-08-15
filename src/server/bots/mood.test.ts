import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LEAD_GAP, moodOf, poolFor } from "./mood";
import { BOT_PHRASES, BOT_TAUNT_PHRASES, BOT_WHINE_PHRASES } from "./roster";

const BOT = "бот";

function standings(mine: number, ...others: number[]) {
  return [
    { id: BOT, score: mine },
    ...others.map((score, index) => ({ id: `игрок-${index}`, score })),
  ];
}

describe("Настроение бота", () => {
  it("молчит про счёт, пока разрыв меньше порога", () => {
    assert.equal(moodOf(standings(0, 0), BOT), "idle");
    assert.equal(moodOf(standings(5, 3), BOT), "idle");
    assert.equal(moodOf(standings(3, 5), BOT), "idle");
  });

  it("подкалывает, когда оторвался ровно на порог", () => {
    assert.equal(moodOf(standings(LEAD_GAP, 0), BOT), "taunt");
    assert.equal(moodOf(standings(9, 6, 2), BOT), "taunt");
  });

  it("ноет, когда отстал ровно на порог", () => {
    assert.equal(moodOf(standings(0, LEAD_GAP), BOT), "whine");
    assert.equal(moodOf(standings(1, 4, 0), BOT), "whine");
  });

  it("сравнивает с лучшим из остальных, а не с худшим", () => {
    // Бот впереди худшего на пять, но отстаёт от лидера на четыре.
    assert.equal(moodOf(standings(5, 9, 0), BOT), "whine");
  });

  it("не считает разрыв, если бот за столом один", () => {
    assert.equal(moodOf(standings(7), BOT), "idle");
  });

  it("не спотыкается о неизвестного бота", () => {
    assert.equal(moodOf(standings(0, 9), "чужой"), "whine");
  });
});

describe("Выбор набора по настроению", () => {
  it("отдаёт набор под настроение", () => {
    assert.equal(poolFor("taunt"), BOT_TAUNT_PHRASES);
    assert.equal(poolFor("whine"), BOT_WHINE_PHRASES);
    assert.equal(poolFor("idle"), BOT_PHRASES);
  });

  it("наборы не пересекаются между собой", () => {
    const all = [...BOT_TAUNT_PHRASES, ...BOT_WHINE_PHRASES, ...BOT_PHRASES];
    assert.equal(new Set(all).size, all.length, "фраза попала в два набора");
  });
});
