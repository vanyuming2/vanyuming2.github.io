import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const root = new URL("../", import.meta.url);

const engineSource = await readFile(new URL("app/life/remake-engine.ts", root), "utf8");
const engineJavaScript = ts.transpileModule(engineSource, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const engineModule = await import(`data:text/javascript;base64,${Buffer.from(engineJavaScript).toString("base64")}`);

async function load(name) {
  return JSON.parse(await readFile(new URL(`public/remake-data/${name}.json`, root), "utf8"));
}

const originalData = {
  age: await load("age"),
  events: await load("events"),
  talents: await load("talents"),
  achievement: await load("achievement"),
  character: await load("character"),
};

test("evaluates the original condition language from left to right", () => {
  const properties = {
    AGE: 18,
    CHR: 7,
    TLT: [1001, 1003],
    EVT: [10000, 10110],
  };
  assert.equal(engineModule.checkCondition(properties, "AGE>=18"), true);
  assert.equal(engineModule.checkCondition(properties, "TLT?[1003,9999]"), true);
  assert.equal(engineModule.checkCondition(properties, "EVT![20000,20001]"), true);
  assert.equal(engineModule.checkCondition(properties, "(CHR>6)&(AGE<20)"), true);
  assert.equal(engineModule.checkCondition(properties, "CHR>8|AGE=18&CHR=7"), true);
  assert.equal(engineModule.checkCondition(properties, "CHR>8|(AGE=18&CHR<7)"), false);
});

test("keeps NoRandom events out of the pool but follows their branch targets", () => {
  const data = {
    age: { 0: { age: 0, event: ["1*999", 2] } },
    talents: {},
    events: {
      1: { id: 1, event: "不能直接抽到", NoRandom: 1 },
      2: { id: 2, event: "主事件", branch: ["CHR>0:3"] },
      3: { id: 3, event: "分支结局", NoRandom: 1, effect: { LIF: -1 } },
    },
  };
  const engine = engineModule.createRemakeEngine(data, { random: () => 0.5 });
  const session = engine.start({
    talentIds: [],
    allocation: { CHR: 5, INT: 5, STR: 5, MNY: 5 },
  });
  const year = session.next();
  assert.deepEqual(year.eventPool.map(({ id }) => id), ["2"]);
  assert.equal(year.selectedEvent.probability, 1);
  assert.deepEqual(year.content.map(({ id }) => id), ["2", "3"]);
  assert.equal(year.isEnd, true);
});

test("runs and restores a deterministic life with the complete original data", () => {
  const engine = engineModule.createRemakeEngine(originalData, { random: () => 0.371 });
  const prepared = engine.prepareTalents(["1001", "1002", "1003"]);
  const allocation = { CHR: 5, INT: 5, STR: 5, MNY: 5 };
  assert.equal(prepared.allocationPoints, 20);
  const session = engine.start({ talentIds: prepared.talentIds, allocation });
  for (let year = 0; year < 5 && !session.isEnd; year += 1) session.next();
  const restored = engine.restore(session.snapshot());
  if (!restored.isEnd) restored.next();
  const result = restored.isEnd
    ? { snapshot: restored.snapshot(), summary: restored.summary() }
    : restored.runToEnd(1_000);
  assert.equal(result.snapshot.ended, true);
  assert.ok(result.snapshot.history.length > 0);
  assert.ok(result.snapshot.eventIds.every((id) => originalData.events[id]));
  assert.equal(result.summary.score, Math.floor(
    (result.summary.highest.CHR + result.summary.highest.INT + result.summary.highest.STR
      + result.summary.highest.MNY + result.summary.highest.SPR) * 2
      + result.summary.highest.AGE / 2,
  ));
});

test("uses original weighted talent replacement and inherited draws", () => {
  const engine = engineModule.createRemakeEngine(originalData, { random: () => 0.42 });
  const prepared = engine.prepareTalents(["1142", "1001", "1002"]);
  assert.ok(prepared.replacements.length >= 1);
  assert.ok(prepared.talentIds.length > 3);
  const draw = engine.drawTalents({ includeTalentId: "1001" });
  assert.equal(draw.cards.length, 10);
  assert.equal(draw.cards[0].id, "1001");
  assert.equal(new Set(draw.cards.map(({ id }) => id)).size, 10);
  assert.equal(draw.cards.some(({ id }) => Boolean(Number(originalData.talents[id].exclusive))), false);
});

test("draws thirty unique talents with the site's boosted rarity rates", () => {
  const engine = engineModule.createRemakeEngine(originalData, {
    random: () => 0.42,
    talentRates: { 0: 45, 1: 30, 2: 18, 3: 7, total: 100 },
  });
  const draw = engine.drawTalents({ count: 30, includeTalentId: "1001" });
  assert.equal(draw.cards.length, 30);
  assert.equal(draw.cards[0].id, "1001");
  assert.equal(new Set(draw.cards.map(({ id }) => id)).size, 30);
  assert.equal(draw.cards.filter(({ id }) => id === "1001").length, 1);
  assert.equal(draw.cards.some(({ id }) => Boolean(Number(originalData.talents[id].exclusive))), false);
  assert.deepEqual(draw.gradeProbabilities, { 0: 0.45, 1: 0.3, 2: 0.18, 3: 0.07 });
});

test("applies per-talent draw weights to featured cards", () => {
  const data = {
    age: {},
    events: {},
    talents: {
      featured: { id: "featured", name: "红色天赋", description: "加权", grade: 0 },
      normalA: { id: "normalA", name: "普通甲", description: "普通", grade: 0 },
      normalB: { id: "normalB", name: "普通乙", description: "普通", grade: 0 },
    },
  };
  const regular = engineModule.createRemakeEngine(data, { random: () => 0 }).drawTalents({ count: 1 });
  const weighted = engineModule.createRemakeEngine(data, {
    random: () => 0,
    talentWeights: { featured: 4 },
  }).drawTalents({ count: 1 });
  assert.equal(regular.cards[0].id, "featured");
  assert.equal(regular.cards[0].probability, 1 / 3);
  assert.equal(weighted.cards[0].id, "featured");
  assert.equal(weighted.cards[0].probability, 4 / 6);
});

test("raises the actual draw probability of the Cthulhu red talent", () => {
  const randomValues = [0.8, 0.6];
  const engine = engineModule.createRemakeEngine(originalData, {
    random: () => randomValues.shift() ?? 0,
    talentRates: { 0: 45, 1: 30, 2: 18, 3: 7, total: 100 },
    talentWeights: { 1128: 4 },
  });
  const draw = engine.drawTalents({ count: 1 });
  const gradeTwoPoolSize = Object.values(originalData.talents).filter(
    (talent) => Number(talent.grade) === 2 && !Number(talent.exclusive),
  ).length;
  const baselineProbability = 0.18 / gradeTwoPoolSize;

  assert.equal(draw.cards[0].id, "1128");
  assert.equal(draw.cards[0].probability, 0.18 * 4 / (gradeTwoPoolSize - 1 + 4));
  assert.ok(draw.cards[0].probability > baselineProbability * 3);
});

test("starts at age zero and preserves a scheduled developer event across restore", () => {
  const data = {
    age: {
      0: { age: 0, event: ["ordinary"] },
      1: { age: 1, event: ["ordinary"] },
    },
    talents: {
      debug: { id: "debug", name: "调试天赋", description: "用于验证", grade: 3 },
    },
    events: {
      ordinary: { id: "ordinary", event: "普通事件" },
      forced: { id: "forced", event: "强制事件", NoRandom: 1, branch: ["INT>0:ending"] },
      ending: { id: "ending", event: "强制分支", NoRandom: 1 },
    },
  };
  const engine = engineModule.createRemakeEngine(data, { random: () => 0.5 });
  const session = engine.start({
    talentIds: ["debug"],
    allocation: { CHR: 10, INT: 10, STR: 10, MNY: 10 },
    presetAllocation: true,
    forcedEventIds: ["forced"],
    forcedEventAges: [1],
  });
  const ageZero = session.next();
  assert.equal(ageZero.age, 0);
  assert.equal(ageZero.selectedEvent.id, "ordinary");
  assert.deepEqual(session.snapshot().forcedEventIds, ["forced"]);
  assert.deepEqual(session.snapshot().forcedEventAges, [1]);

  const restored = engine.restore(session.snapshot());
  const scheduledYear = restored.next();
  assert.equal(scheduledYear.age, 1);
  assert.deepEqual(scheduledYear.content.filter(({ type }) => type === "event").map(({ id }) => id), ["forced", "ending"]);
  assert.equal(scheduledYear.selectedEvent.probability, 1);
  assert.deepEqual(restored.snapshot().forcedEventIds, []);
});
