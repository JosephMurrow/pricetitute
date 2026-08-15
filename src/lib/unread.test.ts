import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { VISIBLE_MIN_PX, enoughVisible, unreadLabel } from "./unread";

describe("Видимость ленты чата", () => {
  it("лента целиком на экране — видна", () => {
    assert.equal(enoughVisible(256, 256), true);
  });

  it("лента целиком за экраном — не видна", () => {
    assert.equal(enoughVisible(256, 0), false);
  });

  it("край ленты выглядывает — этого мало", () => {
    assert.equal(enoughVisible(256, 40), false);
  });

  it("больше половины ленты на экране — видна", () => {
    // 60% от 256 — это 153,6, но потолок в 120 пикселей ниже.
    assert.equal(enoughVisible(256, 130), true);
  });

  it("у короткой ленты считает по доле, а не по потолку", () => {
    // 60% от 100 — это 60, и потолок в 120 тут не при делах.
    assert.equal(enoughVisible(100, 60), true);
    assert.equal(enoughVisible(100, 59), false);
  });

  it("лента выше окна всё равно может считаться видимой", () => {
    // Альбомная ориентация: лента 400, в окно влезло 200. Доли 60% не набрать
    // никогда, и без потолка облачко висело бы вечно.
    assert.equal(enoughVisible(400, 200), true);
    assert.equal(enoughVisible(400, VISIBLE_MIN_PX), true);
    assert.equal(enoughVisible(400, VISIBLE_MIN_PX - 1), false);
  });

  it("не спотыкается о ленту нулевой высоты", () => {
    assert.equal(enoughVisible(0, 0), false);
  });
});

describe("Подпись облачка", () => {
  it("про одно сообщение говорит в единственном числе", () => {
    assert.equal(unreadLabel(1, "Гена"), "Новое сообщение от «Гена»");
  });

  it("про несколько называет счёт и последнего", () => {
    assert.equal(
      unreadLabel(4, "Гена"),
      "Новых сообщений: 4, последнее от «Гена»",
    );
  });
});
