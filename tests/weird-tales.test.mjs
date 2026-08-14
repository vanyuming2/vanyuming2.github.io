import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const root = new URL("../", import.meta.url);

const source = await readFile(new URL("app/remake/weird-tales.ts", root), "utf8");
const javaScript = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const tales = await import(`data:text/javascript;base64,${Buffer.from(javaScript).toString("base64")}`);

async function load(name) {
  return JSON.parse(await readFile(new URL(`public/remake-data/${name}.json`, root), "utf8"));
}

const [events, talents] = await Promise.all([load("events"), load("talents")]);

test("ships two complete ten-fragment weird-tale lines", () => {
  assert.equal(tales.WEIRD_TALE_LINES.length, 2);
  assert.deepEqual(tales.WEIRD_TALE_LINES.map(({ id }) => id), ["white-stone-pass", "seventh-pier"]);
  const allClueIds = [];
  const allSourceKeys = [];

  for (const line of tales.WEIRD_TALE_LINES) {
    assert.equal(line.clues.length, 10);
    assert.deepEqual(line.clues.map(({ order }) => order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert.ok(line.revealAfter > 0 && line.revealAfter < line.clues.length);
    assert.ok(line.ending.length > 20);
    for (const clue of line.clues) {
      allClueIds.push(clue.id);
      const length = Array.from(clue.body).length;
      assert.ok(length >= 80 && length <= 150, `${clue.id} should stay near one hundred Chinese characters, got ${length}`);
      for (const sourceEntry of clue.sources) {
        allSourceKeys.push(`${sourceEntry.type}:${sourceEntry.id}`);
        const collection = sourceEntry.type === "event" ? events : talents;
        assert.ok(collection[sourceEntry.id], `${sourceEntry.type} ${sourceEntry.id} should exist in original data`);
      }
    }
  }
  assert.equal(new Set(allClueIds).size, allClueIds.length);
  assert.equal(new Set(allSourceKeys).size, allSourceKeys.length);
});

test("maps the original mountain report to its hidden annotation", () => {
  const clue = tales.findWeirdTaleClue({ type: "event", id: "10422" });
  assert.equal(clue?.id, "mountain-film-set");
  assert.match(events[10422].event, /官方通报是在拍电视剧/);
});

test("maps the Cthulhu talent and corrupted original events to the seventh-pier archive", () => {
  assert.equal(talents[1128].name, "克苏鲁");
  assert.equal(tales.findWeirdTaleClue({ type: "talent", id: "1128" })?.id, "cthulhu-dead-radio");
  assert.equal(tales.findWeirdTaleClue({ type: "event", id: "11335" })?.id, "cthulhu-backward-footprints");
  assert.equal(tales.findWeirdTaleClue({ type: "event", id: "11348" })?.id, "cthulhu-already-home");
});

test("keeps clues discoverable out of order but gates the ambiguous ending", () => {
  const isolated = tales.discoveredWeirdTaleIds({ eventIds: ["10422"], talentIds: [] });
  assert.deepEqual([...isolated], ["mountain-film-set"]);

  const prematureEnding = tales.discoveredWeirdTaleIds({ eventIds: ["10361"], talentIds: [] });
  assert.equal(prematureEnding.has("unmailed-reply"), false);

  const completeEnough = tales.discoveredWeirdTaleIds({
    eventIds: ["10072", "10076", "10073", "10422", "20422", "10361"],
    talentIds: ["1065"],
  });
  assert.equal(completeEnough.has("unmailed-reply"), true);
});

test("keeps each line's ending gated by clues from that same line", () => {
  const unrelatedClues = tales.discoveredWeirdTaleIds({
    eventIds: ["10072", "10076", "10073", "10422", "20422", "10781", "11347"],
    talentIds: ["1065"],
  });
  assert.equal(unrelatedClues.has("cthulhu-already-home"), false);

  const cthulhuLine = tales.discoveredWeirdTaleIds({
    eventIds: ["11335", "11336", "11337", "11338", "11339", "11341", "11343", "11347"],
    talentIds: ["1128"],
  });
  assert.equal(cthulhuLine.has("cthulhu-already-home"), true);
});
