import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { roomLeaders } from "./crowns";

const ids = (leaders: ReadonlySet<string>) => [...leaders].sort();

describe("Корона лидера комнаты", () => {
  it("достаётся тому, у кого больше всех", () => {
    const leaders = roomLeaders([
      { id: "а", score: 2 },
      { id: "б", score: 5 },
      { id: "в", score: 4 },
    ]);

    assert.deepEqual(ids(leaders), ["б"]);
  });

  it("при ничьей достаётся всем лидерам", () => {
    const leaders = roomLeaders([
      { id: "а", score: 5 },
      { id: "б", score: 5 },
      { id: "в", score: 1 },
    ]);

    assert.deepEqual(ids(leaders), ["а", "б"]);
  });

  it("не выдаётся, пока все на нуле", () => {
    const leaders = roomLeaders([
      { id: "а", score: 0 },
      { id: "б", score: 0 },
    ]);

    assert.equal(leaders.size, 0);
  });

  it("достаётся единственному, кто открыл счёт", () => {
    const leaders = roomLeaders([
      { id: "а", score: 1 },
      { id: "б", score: 0 },
    ]);

    assert.deepEqual(ids(leaders), ["а"]);
  });

  it("не спотыкается о пустую комнату", () => {
    assert.equal(roomLeaders([]).size, 0);
  });
});
