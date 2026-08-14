import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LEAD_GAP, moodOf, phraseFor } from "./mood";
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

describe("Выбор реплики по настроению", () => {
  it("берёт фразу из своего набора", () => {
    assert.ok(BOT_TAUNT_PHRASES.includes(phraseFor("taunt")));
    assert.ok(BOT_WHINE_PHRASES.includes(phraseFor("whine")));
    assert.ok(BOT_PHRASES.includes(phraseFor("idle")));
  });

  it("наборы не пересекаются между собой", () => {
    const all = [...BOT_TAUNT_PHRASES, ...BOT_WHINE_PHRASES, ...BOT_PHRASES];
    assert.equal(new Set(all).size, all.length, "фраза попала в два набора");
  });
});
