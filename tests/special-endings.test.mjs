import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const source = await readFile(new URL("app/remake/special-endings.ts", root), "utf8");
const overridesSource = await readFile(new URL("app/remake/site-event-overrides.ts", root), "utf8");
const cultivationSource = await readFile(new URL("app/remake/cultivation-route.ts", root), "utf8");
const javaScript = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText.replace(
  /^import\s*\{[\s\S]*?\}\s*from\s*"\.\/site-event-overrides";\s*/m,
  'const CTHULHU_CEMETERY_EVENT_ID = "site-cthulhu-cemetery-dive"; const CTHULHU_CEMETERY_MAX_AGE = 32; const CTHULHU_CEMETERY_MIN_AGE = 24; const CTHULHU_CEMETERY_TALENT_ID = "site-cthulhu-cemetery"; const DOUBLE_FISH_EVENT_AGE = 21; const DOUBLE_FISH_EVENT_ID = "site-double-fish-jade-crossing"; const DOUBLE_FISH_TALENT_ID = "site-double-fish-aerial-negative"; const EIGHTIES_GHOST_EVENT_ID = "site-eighties-ghost-file"; const EIGHT_FOOT_WOMAN_EVENT_ID = "site-eight-foot-woman-return"; const EIGHT_FOOT_WOMAN_MAX_AGE = 23; const EIGHT_FOOT_WOMAN_MIN_AGE = 19; const EIGHT_FOOT_WOMAN_TALENT_ID = "site-eight-foot-woman-sensitivity"; const GONGGONG_BLOODLINE_TALENT_ID = "site-gonggong-bloodline"; const GONGGONG_ZHURONG_EVENT_ID = "site-gonggong-zhurong-crossing"; const GONGGONG_ZHURONG_MAX_AGE = 25; const GONGGONG_ZHURONG_MIN_AGE = 18; const KUNLUN_BONES_EVENT_ID = "site-kunlun-bones-expedition"; const KUNLUN_BONES_MAX_AGE = 36; const KUNLUN_BONES_MIN_AGE = 26; const KUNLUN_BONES_TALENT_ID = "site-kunlun-bone-compass"; const MALE_BIRTH_EVENT_ID = "10001"; const PENGLAI_EVENT_ID = "site-penglai-route-crossing"; const PENGLAI_MAX_AGE = 35; const PENGLAI_MIN_AGE = 20; const PENGLAI_TALENT_ID = "site-penglai-sea-fog"; const SAND_SEA_EVENT_ID = "site-sand-sea-beneath"; const SAND_SEA_MAX_AGE = 38; const SAND_SEA_MIN_AGE = 28; const SAND_SEA_TALENT_ID = "site-sand-sea-stone-seal"; const SHAMBHALA_EVENT_AGE = 20; const SHAMBHALA_EVENT_ID = "site-shambhala-entry"; const SHAMBHALA_TALENT_ID = "site-shambhala-manuscript"; const SPECIAL_PROLOGUE_EVENT_IDS = { shambhala:["site-prologue-shambhala-family","site-prologue-shambhala-study"], gonggong:["site-prologue-gonggong-dream","site-prologue-gonggong-flood-record"], penglai:["site-prologue-penglai-course","site-prologue-penglai-invitation"], doubleFish:["site-prologue-double-fish-major","site-prologue-double-fish-archive"], cthulhuCemetery:["site-prologue-cthulhu-major","site-prologue-cthulhu-project"], kunlunBones:["site-prologue-kunlun-reporter","site-prologue-kunlun-parcel"], sandSea:["site-prologue-sand-sea-major","site-prologue-sand-sea-drive"], eightFootWoman:["site-prologue-eight-foot-childhood","site-prologue-eight-foot-return"] }; const SPECIAL_RUMOR_EVENT_IDS = { unloadedHometown:"site-rumor-unloaded-hometown", shambhala:"site-rumor-shambhala", eightiesRoom:"site-rumor-eighties-room", gonggong:"site-rumor-gonggong", penglai:"site-rumor-penglai", doubleFish:"site-rumor-double-fish", cthulhuCemetery:"site-rumor-cthulhu-cemetery", kunlunBones:"site-rumor-kunlun-bones", sandSea:"site-rumor-sand-sea", eightFootWoman:"site-rumor-eight-foot-woman" };\n',
);
const endings = await import(`data:text/javascript;base64,${Buffer.from(javaScript).toString("base64")}`);
const cultivationJavaScript = ts.transpileModule(cultivationSource, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const cultivation = await import(`data:text/javascript;base64,${Buffer.from(cultivationJavaScript).toString("base64")}`);
const cultivationBindings = {
  CULTIVATION_CHAPTER_WEIGHT: cultivation.CULTIVATION_CHAPTER_WEIGHT,
  CULTIVATION_ROUTE_CHAPTERS: cultivation.CULTIVATION_ROUTE_CHAPTERS,
  IMMORTAL_BOOK_EVENT_WEIGHT: cultivation.IMMORTAL_BOOK_EVENT_WEIGHT,
  IMMORTAL_BOOK_MAX_AGE: cultivation.IMMORTAL_BOOK_MAX_AGE,
  IMMORTAL_BOOK_MIN_AGE: cultivation.IMMORTAL_BOOK_MIN_AGE,
  IMMORTAL_BOOK_OPPORTUNITY_EVENT: cultivation.IMMORTAL_BOOK_OPPORTUNITY_EVENT,
  IMMORTAL_BOOK_OPPORTUNITY_EVENT_ID: cultivation.IMMORTAL_BOOK_OPPORTUNITY_EVENT_ID,
  RED_PILL_TALENT: cultivation.RED_PILL_TALENT,
  RED_PILL_TALENT_ID: cultivation.RED_PILL_TALENT_ID,
  SITE_ACHIEVEMENTS: cultivation.SITE_ACHIEVEMENTS,
};
const overridesJavaScript = ts.transpileModule(overridesSource, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText.replace(
  /^import\s*\{[\s\S]*?\}\s*from\s*"\.\/cultivation-route";\s*/m,
  `const { CULTIVATION_CHAPTER_WEIGHT, CULTIVATION_ROUTE_CHAPTERS, IMMORTAL_BOOK_EVENT_WEIGHT, IMMORTAL_BOOK_MAX_AGE, IMMORTAL_BOOK_MIN_AGE, IMMORTAL_BOOK_OPPORTUNITY_EVENT, IMMORTAL_BOOK_OPPORTUNITY_EVENT_ID, RED_PILL_TALENT, RED_PILL_TALENT_ID, SITE_ACHIEVEMENTS } = ${JSON.stringify(cultivationBindings)};\n`,
);
const overrides = await import(`data:text/javascript;base64,${Buffer.from(overridesJavaScript).toString("base64")}`);
const ages = JSON.parse(await readFile(new URL("public/remake-data/age.json", root), "utf8"));
const events = JSON.parse(await readFile(new URL("public/remake-data/events.json", root), "utf8"));

test("ships the complete fifty-page virtual-world ending with its prequel", async () => {
  assert.equal(endings.SPECIAL_ENDINGS.length, 10);
  const ending = endings.UNLOADED_HOMETOWN;
  assert.equal(ending.id, "unloaded-hometown");
  assert.equal(ending.title, "未加载的世界");
  assert.equal(ending.kicker, "真结局 · 日光之外");
  assert.equal(ending.pages.length, 50);
  assert.equal(ending.ending, "世界是假的，爱是真的。");
  assert.equal(ending.entryMode, "forced");
  assert.equal(ending.outcome, "end-life");
  assert.equal(ending.entryLabel, "揭开帷幕");
  assert.equal(
    ending.triggerPremise,
    "第二次人生里，你仍旧像普通人一样长大。大学毕业前，一段感情结束了。你在宿舍躺了几天，最后拖着行李回了老家。",
  );
  assert.equal(
    ending.triggerLead,
    "你终于下定决心，颤抖着掀开了隐藏帷幕的一角。刹那间，周围的世界如雪花般无声消融。",
  );
  assert.equal(new Set(ending.pages.map(({ image }) => image)).size, 50);
  assert.equal(ending.pages[0].image, "/remake-tales/unloaded-hometown/01.webp");
  assert.equal(ending.pages[24].image, "/remake-tales/unloaded-hometown/25.webp");
  assert.equal(ending.pages[25].image, "/remake-tales/unloaded-hometown/26.webp");
  assert.equal(ending.pages[49].image, "/remake-tales/unloaded-hometown/50.webp");
  assert.equal(ending.pages[49].text, "世界是假的，但爱是真的。");
  assert.ok(ending.pages.slice(0, 25).every(({ text }) => text === ""));
  assert.deepEqual(ending.sourceEventIds, ["21305", "21306", "21307", "21308"]);
  for (const eventId of ending.sourceEventIds) assert.ok(events[eventId]);
  assert.match(events[21305].event, /虚拟世界/);

  await Promise.all(ending.pages.map(({ image }) => {
    const relativePath = image.replace(/^\//, "public/");
    return access(new URL(relativePath, root));
  }));
});

test("ships the 27-page Shambhala route with visible-caption data", async () => {
  const ending = endings.SHAMBHALA_WORLD;
  assert.equal(ending.id, "shambhala-world");
  assert.equal(ending.pages.length, 27);
  assert.equal(ending.entryMode, "forced");
  assert.equal(ending.outcome, "resume");
  assert.equal(ending.requiredTalentId, "site-shambhala-manuscript");
  assert.equal(ending.triggerAge, 20);
  assert.deepEqual(ending.sourceEventIds, ["site-shambhala-entry"]);
  assert.equal(ending.pages[0].text, "我今年20多，在国内读个双非本科。");
  assert.equal(ending.pages[16].text, "");
  assert.equal(ending.pages[19].text, "");
  assert.equal(ending.pages[22].text, "");
  assert.equal(ending.pages[23].text, "");
  assert.equal(ending.pages[26].text, "这是！！！香巴拉吗？？");
  assert.equal(new Set(ending.pages.map(({ image }) => image)).size, 27);
  assert.deepEqual(endings.scheduledSpecialEndings(["site-shambhala-manuscript"]), [ending]);
  assert.deepEqual(endings.scheduledSpecialEndings(["1128"]), []);
  assert.equal(endings.findSpecialEndingBySource(["site-shambhala-entry"]), ending);

  await Promise.all(ending.pages.map(({ image }) => {
    const relativePath = image.replace(/^\//, "public/");
    return access(new URL(relativePath, root));
  }));
});

test("ships the optional twenty-page eighties ghost archive", async () => {
  const ending = endings.EIGHTIES_ROOM;
  assert.equal(ending.id, "eighties-room");
  assert.equal(ending.pages.length, 20);
  assert.equal(ending.entryMode, "optional");
  assert.equal(ending.outcome, "resume");
  assert.equal(ending.triggerAge, undefined);
  assert.equal(ending.requiredTalentId, undefined);
  assert.deepEqual(ending.sourceEventIds, ["site-eighties-ghost-file"]);
  assert.match(ending.triggerPremise, /八十年代的借阅簿/);
  assert.match(ending.triggerLead, /被撬开的地砖/);
  assert.equal(ending.pages[0].image, "/remake-tales/eighties-room/01.webp");
  assert.equal(ending.pages[19].image, "/remake-tales/eighties-room/20.webp");
  assert.match(ending.pages[19].text, /肉块/);
  assert.equal(endings.findSpecialEndingBySource(["site-eighties-ghost-file"]), ending);
  assert.equal(endings.hasSpecialEndingSource(["site-eighties-ghost-file"]), true);

  await Promise.all(ending.pages.map(({ image }) => {
    const relativePath = image.replace(/^\//, "public/");
    return access(new URL(relativePath, root));
  }));
});

test("ships all sixteen pages of the forced Gonggong and Zhurong crossing", async () => {
  const ending = endings.GONGGONG_ZHURONG;
  assert.equal(ending.id, "gonggong-zhurong");
  assert.equal(ending.pages.length, 16);
  assert.equal(ending.entryMode, "forced");
  assert.equal(ending.outcome, "resume");
  assert.equal(ending.requiredTalentId, "site-gonggong-bloodline");
  assert.deepEqual(ending.triggerAgeRange, [18, 25]);
  assert.deepEqual(ending.sourceEventIds, ["site-gonggong-zhurong-crossing"]);
  assert.equal(ending.pages[0].image, "/remake-tales/gonggong-zhurong/01.webp");
  assert.equal(ending.pages[15].image, "/remake-tales/gonggong-zhurong/16.webp");
  assert.match(ending.pages[4].text, /两个太阳/);
  assert.match(ending.pages[15].text, /山，消失了/);
  assert.equal(endings.specialEndingTriggerAge(ending, () => 0), 18);
  assert.equal(endings.specialEndingTriggerAge(ending, () => 0.5), 22);
  assert.equal(endings.specialEndingTriggerAge(ending, () => 0.999999), 25);
  assert.deepEqual(endings.scheduledSpecialEndings(["site-gonggong-bloodline"]), [ending]);
  assert.deepEqual(endings.scheduledSpecialEvents(["site-gonggong-bloodline"], () => 0.5), [
    { id: "10001", age: 0 },
    { id: "site-rumor-double-fish", age: 15 },
    { id: "site-prologue-gonggong-dream", age: 16 },
    { id: "site-prologue-gonggong-flood-record", age: 20 },
    { id: "site-gonggong-zhurong-crossing", age: 22 },
    { id: "site-rumor-cthulhu-cemetery", age: 32 },
  ]);

  await Promise.all(ending.pages.map(({ image }) => {
    const relativePath = image.replace(/^\//, "public/");
    return access(new URL(relativePath, root));
  }));
});

test("ships the forced male Penglai route and resumes the same life", async () => {
  const ending = endings.PENGLAI_ROUTE;
  assert.equal(ending.id, "penglai-route");
  assert.equal(ending.pages.length, 25);
  assert.equal(ending.entryMode, "forced");
  assert.equal(ending.outcome, "resume");
  assert.equal(ending.requiredTalentId, "site-penglai-sea-fog");
  assert.deepEqual(ending.triggerAgeRange, [20, 35]);
  assert.deepEqual(ending.sourceEventIds, ["site-penglai-route-crossing"]);
  assert.equal(ending.pages[0].image, "/remake-tales/penglai-route/01.webp");
  assert.equal(ending.pages[24].image, "/remake-tales/penglai-route/25.webp");
  assert.match(ending.pages[13].text, /徐市/);
  assert.match(ending.pages[24].text, /木牌/);
  assert.equal(ending.mirrorChapter.id, "penglai-route-reverse");
  assert.equal(ending.mirrorChapter.title, "蓬莱航线·海雾另一侧");
  assert.equal(ending.mirrorChapter.pages.length, 29);
  assert.equal(ending.mirrorChapter.pages[0].image, "/remake-tales/penglai-route-reverse/01.webp");
  assert.equal(ending.mirrorChapter.pages[28].image, "/remake-tales/penglai-route-reverse/29.webp");
  assert.match(ending.mirrorChapter.pages[0].text, /石生/);
  assert.match(ending.mirrorChapter.pages[25].text, /我真的存在过/);
  assert.match(ending.mirrorChapter.pages[28].text, /蓬莱/);
  assert.match(ending.mirrorChapter.transition, /翻过木牌/);
  assert.equal(endings.specialEndingTriggerAge(ending, () => 0), 20);
  assert.equal(endings.specialEndingTriggerAge(ending, () => 0.5), 28);
  assert.equal(endings.specialEndingTriggerAge(ending, () => 0.999999), 35);
  assert.deepEqual(endings.scheduledSpecialEvents(["site-penglai-sea-fog"], () => 0.5), [
    { id: "10001", age: 0 },
    { id: "site-rumor-double-fish", age: 15 },
    { id: "site-prologue-penglai-course", age: 22 },
    { id: "site-prologue-penglai-invitation", age: 26 },
    { id: "site-penglai-route-crossing", age: 28 },
    { id: "site-rumor-cthulhu-cemetery", age: 32 },
  ]);

  await Promise.all(ending.pages.map(({ image }) => {
    const relativePath = image.replace(/^\//, "public/");
    return access(new URL(relativePath, root));
  }));
  await Promise.all(ending.mirrorChapter.pages.map(({ image }) => {
    const relativePath = image.replace(/^\//, "public/");
    return access(new URL(relativePath, root));
  }));
});

test("ships all three new forced-male picture routes with complete assets", async () => {
  const cases = [
    {
      ending: endings.DOUBLE_FISH_JADE,
      id: "double-fish-jade",
      talent: "site-double-fish-aerial-negative",
      event: "site-double-fish-jade-crossing",
      count: 26,
      last: "26.webp",
      age: 21,
    },
    {
      ending: endings.CTHULHU_CEMETERY,
      id: "cthulhu-cemetery",
      talent: "site-cthulhu-cemetery",
      event: "site-cthulhu-cemetery-dive",
      count: 21,
      last: "21.webp",
      range: [24, 32],
    },
    {
      ending: endings.KUNLUN_BONES,
      id: "kunlun-bones",
      talent: "site-kunlun-bone-compass",
      event: "site-kunlun-bones-expedition",
      count: 35,
      last: "35.webp",
      range: [26, 36],
    },
  ];

  for (const item of cases) {
    assert.equal(item.ending.id, item.id);
    assert.equal(item.ending.entryMode, "forced");
    assert.equal(item.ending.outcome, "resume");
    assert.equal(item.ending.requiredTalentId, item.talent);
    assert.deepEqual(item.ending.sourceEventIds, [item.event]);
    assert.equal(item.ending.pages.length, item.count);
    assert.match(item.ending.pages.at(-1).image, new RegExp(`${item.last}$`));
    assert.equal(new Set(item.ending.pages.map(({ image }) => image)).size, item.count);
    if (item.age) assert.equal(item.ending.triggerAge, item.age);
    if (item.range) assert.deepEqual(item.ending.triggerAgeRange, item.range);
    await Promise.all(item.ending.pages.map(({ image }) => access(new URL(image.replace(/^\//, "public/"), root))));

    const scheduled = endings.scheduledSpecialEvents([item.talent], () => 0.5);
    assert.deepEqual(scheduled[0], { id: "10001", age: 0 });
    const mainEvent = scheduled.find(({ id }) => id === item.event);
    assert.ok(mainEvent);
    assert.deepEqual(
      scheduled.filter(({ id }) => item.ending.prologueEventIds.includes(id)).map(({ id }) => id),
      [...item.ending.prologueEventIds],
    );
    assert.ok(scheduled.filter(({ id }) => String(id).startsWith("site-rumor-")).length >= 2);
    assert.ok(item.ending.prologueEventIds.every((id) => scheduled.find((entry) => entry.id === id).age < mainEvent.age));
  }
});

test("ships the complete three-part Sand Sea route as one continuing life", async () => {
  const ending = endings.SAND_SEA;
  assert.equal(ending.id, "sand-sea-beneath");
  assert.equal(ending.title, "沙海之下");
  assert.equal(ending.entryMode, "forced");
  assert.equal(ending.outcome, "resume");
  assert.equal(ending.requiredTalentId, "site-sand-sea-stone-seal");
  assert.deepEqual(ending.triggerAgeRange, [28, 38]);
  assert.deepEqual(ending.sourceEventIds, ["site-sand-sea-beneath"]);
  assert.equal(ending.pages.length, 93);
  assert.equal(ending.pages[0].image, "/remake-tales/sand-sea/episode-1/01.webp");
  assert.equal(ending.pages[29].image, "/remake-tales/sand-sea/episode-1/30.webp");
  assert.equal(ending.pages[30].image, "/remake-tales/sand-sea/episode-2/01.webp");
  assert.equal(ending.pages[57].image, "/remake-tales/sand-sea/episode-2/28.webp");
  assert.equal(ending.pages[58].image, "/remake-tales/sand-sea/episode-3/01.webp");
  assert.equal(ending.pages[92].image, "/remake-tales/sand-sea/episode-3/35.webp");
  assert.match(ending.pages[26].text, /手持雷达/);
  assert.match(ending.pages[56].text, /自然会回来/);
  assert.match(ending.pages[92].text, /云团/);
  assert.equal(endings.specialEndingTriggerAge(ending, () => 0), 28);
  assert.equal(endings.specialEndingTriggerAge(ending, () => 0.5), 33);
  assert.equal(endings.specialEndingTriggerAge(ending, () => 0.999999), 38);
  const scheduled = endings.scheduledSpecialEvents(["site-sand-sea-stone-seal"], () => 0.5);
  assert.deepEqual(scheduled[0], { id: "10001", age: 0 });
  assert.ok(scheduled.some(({ id, age }) => id === "site-prologue-sand-sea-major" && age === 27));
  assert.ok(scheduled.some(({ id, age }) => id === "site-prologue-sand-sea-drive" && age === 31));
  assert.ok(scheduled.some(({ id, age }) => id === "site-sand-sea-beneath" && age === 33));

  await Promise.all(ending.pages.map(({ image }) => access(new URL(image.replace(/^\//, "public/"), root))));
});

test("ships the complete purple Eight-Foot Woman horror route", async () => {
  const ending = endings.EIGHT_FOOT_WOMAN;
  assert.equal(ending.id, "eight-foot-woman");
  assert.equal(ending.kicker, "紫色恐怖事件 · 招阴体质");
  assert.equal(ending.entryMode, "forced");
  assert.equal(ending.outcome, "end-life");
  assert.equal(ending.requiredTalentId, "site-eight-foot-woman-sensitivity");
  assert.deepEqual(ending.triggerAgeRange, [19, 23]);
  assert.deepEqual(ending.sourceEventIds, ["site-eight-foot-woman-return"]);
  assert.equal(ending.pages.length, 25);
  assert.equal(ending.pages[0].image, "/remake-tales/eight-foot-woman/01.webp");
  assert.equal(ending.pages[24].image, "/remake-tales/eight-foot-woman/25.webp");
  assert.match(ending.pages[3].text, /黑衣/);
  assert.match(ending.pages[24].text, /外衣/);
  assert.equal(endings.specialEndingTriggerAge(ending, () => 0), 19);
  assert.equal(endings.specialEndingTriggerAge(ending, () => 0.5), 21);
  assert.equal(endings.specialEndingTriggerAge(ending, () => 0.999999), 23);

  const scheduled = endings.scheduledSpecialEvents(["site-eight-foot-woman-sensitivity"], () => 0.5);
  assert.deepEqual(scheduled[0], { id: "10001", age: 0 });
  assert.ok(scheduled.some(({ id, age }) => id === "site-prologue-eight-foot-childhood" && age === 15));
  assert.ok(scheduled.some(({ id, age }) => id === "site-prologue-eight-foot-return" && age === 19));
  assert.ok(scheduled.some(({ id, age }) => id === "site-eight-foot-woman-return" && age === 21));

  await Promise.all(ending.pages.map(({ image }) => access(new URL(image.replace(/^\//, "public/"), root))));
});

test("gives ordinary lives two restrained rumors without forcing a special route", () => {
  const scheduled = endings.scheduledSpecialEvents([], () => 0.5);
  assert.deepEqual(scheduled, [
    { id: "site-rumor-double-fish", age: 15 },
    { id: "site-rumor-penglai", age: 32 },
  ]);
});

test("recognizes the original virtual-world defense route only", () => {
  assert.equal(endings.hasSpecialEndingSource(["21305"]), true);
  assert.equal(endings.hasSpecialEndingSource(["10000", "11348"]), false);
});

test("adds site event windows without mutating upstream entries", () => {
  const original = { age: ages, events, talents: {} };
  const changed = overrides.applySiteEventOverrides(original);
  const idOf = (value) => String(value).split("*")[0];

  assert.notEqual(changed, original);
  assert.equal(events["21305"].include, "EVT?[21304]");
  assert.equal(changed.events["21305"].include, 'AGE>=20&AGE<=32&TLT?["site-red-pill"]');
  assert.equal(changed.talents["site-red-pill"].exclusive, 1);
  assert.deepEqual(changed.talents["site-red-pill"].effect, { LIF: 10 });
  assert.equal(changed.talents["site-shambhala-manuscript"].name, "香巴拉世界手稿");
  assert.equal(changed.talents["site-shambhala-manuscript"].grade, 3);
  assert.equal(changed.events["site-shambhala-entry"].NoRandom, 1);
  assert.equal(changed.events["site-shambhala-entry"].include, 'AGE=20&TLT?["site-shambhala-manuscript"]');
  assert.equal(changed.events["site-eighties-ghost-file"].include, "AGE>=18&AGE<=25");
  assert.equal(changed.events["site-eighties-ghost-file"].grade, 3);
  assert.equal(changed.talents["site-gonggong-bloodline"].grade, 3);
  assert.equal(changed.talents["site-gonggong-bloodline"].status, 8);
  assert.deepEqual(changed.talents["site-gonggong-bloodline"].effect, { STR: 15, INT: 5, SPR: 2 });
  assert.deepEqual(changed.talents["site-gonggong-bloodline"].exclude, [1004, 1024, 1025, 1113]);
  assert.equal(changed.events["site-gonggong-zhurong-crossing"].NoRandom, 1);
  assert.equal(changed.events["site-gonggong-zhurong-crossing"].include, 'AGE>=18&AGE<=25&TLT?["site-gonggong-bloodline"]');
  assert.equal(changed.talents["site-penglai-sea-fog"].name, "海雾来客");
  assert.equal(changed.talents["site-penglai-sea-fog"].grade, 3);
  assert.deepEqual(changed.talents["site-penglai-sea-fog"].effect, { INT: 4, STR: 3, SPR: 1 });
  assert.deepEqual(changed.talents["site-penglai-sea-fog"].exclude, [1004, 1024, 1025, 1113]);
  assert.equal(changed.events["site-penglai-route-crossing"].NoRandom, 1);
  assert.equal(changed.events["site-penglai-route-crossing"].include, 'AGE>=20&AGE<=35&TLT?["site-penglai-sea-fog"]');
  assert.equal(changed.talents["site-double-fish-aerial-negative"].name, "罗布泊旧航片");
  assert.equal(changed.events["site-double-fish-jade-crossing"].include, 'AGE=21&TLT?["site-double-fish-aerial-negative"]');
  assert.equal(changed.talents["site-cthulhu-cemetery"].name, "七千米深潜母带");
  assert.equal(changed.events["site-cthulhu-cemetery-dive"].include, 'AGE>=24&AGE<=32&TLT?["site-cthulhu-cemetery"]');
  assert.equal(changed.talents["site-kunlun-bone-compass"].name, "无编号旧磁带");
  assert.equal(changed.events["site-kunlun-bones-expedition"].include, 'AGE>=26&AGE<=36&TLT?["site-kunlun-bone-compass"]');
  assert.equal(changed.talents["site-sand-sea-stone-seal"].name, "沙海石印");
  assert.equal(changed.talents["site-sand-sea-stone-seal"].status, 6);
  assert.deepEqual(changed.talents["site-sand-sea-stone-seal"].effect, { INT: 9, STR: 5, MNY: 2 });
  assert.equal(changed.events["site-sand-sea-beneath"].include, 'AGE>=28&AGE<=38&TLT?["site-sand-sea-stone-seal"]');
  assert.equal(changed.talents["site-eight-foot-woman-sensitivity"].name, "招阴体质");
  assert.equal(changed.talents["site-eight-foot-woman-sensitivity"].grade, 2);
  assert.equal(changed.talents["site-eight-foot-woman-sensitivity"].status, 2);
  assert.deepEqual(changed.talents["site-eight-foot-woman-sensitivity"].effect, { INT: 3, STR: 2, SPR: -1 });
  assert.equal(changed.events["site-eight-foot-woman-return"].grade, 2);
  assert.equal(changed.events["site-eight-foot-woman-return"].include, 'AGE>=19&AGE<=23&TLT?["site-eight-foot-woman-sensitivity"]');
  assert.equal(changed.events["site-small-box-immortal-book"].include, "TLT?[1048]");
  assert.deepEqual(changed.events["site-small-box-immortal-book"].branch, ["TLT?[1048]:20461"]);
  assert.ok(cultivation.IMMORTAL_BOOK_EVENT_WEIGHT > 1_000_000_000);
  assert.equal(changed.achievement["site-achievement-first-special"].name, "初识冰山一角");
  assert.equal(changed.achievement["site-achievement-perfect-cultivation"].condition, "EVT?[40050]");
  assert.equal(changed.achievement["site-achievement-true-ending"].name, "真结局");
  assert.equal(cultivation.CULTIVATION_ROUTE_CHAPTERS.length, 14);
  assert.equal(changed.events["site-cultivation-01"].include, "TLT?[1048]&EVT?[40001]");
  assert.deepEqual(changed.events["site-cultivation-14"].branch, ["TLT?[1048]:40050"]);

  const prologueIds = Object.values(overrides.SPECIAL_PROLOGUE_EVENT_IDS).flat();
  const rumorIds = Object.values(overrides.SPECIAL_RUMOR_EVENT_IDS);
  assert.equal(prologueIds.length, 16);
  assert.equal(rumorIds.length, 10);
  for (const id of [...prologueIds, ...rumorIds]) {
    assert.equal(changed.events[id].NoRandom, 1, `${id} must stay out of the random event pool`);
    assert.equal(changed.events[id].grade, 0);
    assert.ok(changed.events[id].event.length > 20);
  }
  assert.match(changed.events["site-prologue-double-fish-major"].event, /地理信息科学/);
  assert.match(changed.events["site-prologue-cthulhu-major"].event, /海洋地质/);
  assert.match(changed.events["site-prologue-kunlun-reporter"].event, /调查报道/);
  assert.match(changed.events["site-rumor-unloaded-hometown"].event, /隔壁市/);

  for (let age = 0; age <= 500; age += 1) {
    const before = Array.isArray(ages[age].event) ? ages[age].event : [ages[age].event];
    const after = Array.isArray(changed.age[age].event) ? changed.age[age].event : [changed.age[age].event];
    const siteIds = new Set([
      "21305",
      "site-eighties-ghost-file",
      "site-small-box-immortal-book",
      ...cultivation.CULTIVATION_ROUTE_CHAPTERS.map(({ id }) => id),
    ]);
    const beforeUnrelated = before.filter((value) => !siteIds.has(idOf(value)));
    const afterUnrelated = after.filter((value) => !siteIds.has(idOf(value)));
    assert.deepEqual(afterUnrelated, beforeUnrelated, `unrelated events changed at age ${age}`);
    assert.equal(
      after.filter((value) => idOf(value) === "21305").length,
      age >= 20 && age <= 32 ? 1 : 0,
      `unexpected 21305 entry at age ${age}`,
    );
    assert.equal(
      after.filter((value) => idOf(value) === "site-eighties-ghost-file").length,
      age >= 18 && age <= 25 ? 1 : 0,
      `unexpected eighties ghost entry at age ${age}`,
    );
    assert.equal(
      after.filter((value) => idOf(value) === "site-small-box-immortal-book").length,
      age >= 26 && age <= 59 ? 1 : 0,
      `unexpected immortal book entry at age ${age}`,
    );
    for (const cultivationChapter of cultivation.CULTIVATION_ROUTE_CHAPTERS) {
      assert.equal(
        after.filter((value) => idOf(value) === cultivationChapter.id).length,
        age >= cultivationChapter.minAge && age <= cultivationChapter.maxAge ? 1 : 0,
        `unexpected ${cultivationChapter.id} entry at age ${age}`,
      );
    }
  }
});

test("keeps the original cultivation route and makes the small-box book encounter overwhelmingly likely", () => {
  assert.equal(cultivation.SMALL_BOX_TALENT_ID, "1048");
  assert.equal(cultivation.IMMORTAL_BOOK_EVENT_ID, "20461");
  assert.equal(cultivation.PERFECT_CULTIVATION_EVENT_ID, "40050");
  assert.equal(cultivation.isCultivationEventId("20461"), true);
  assert.equal(cultivation.isCultivationEventId("40001"), true);
  assert.equal(cultivation.isCultivationEventId("40050"), true);
  assert.equal(cultivation.isCultivationEventId("40051"), false);
  assert.equal(cultivation.isCultivationEventId("site-cultivation-07"), true);
  assert.match(cultivation.IMMORTAL_BOOK_OPPORTUNITY_EVENT.event, /《仙脉图录》/);
  assert.equal(cultivation.IMMORTAL_BOOK_EVENT_WEIGHT, 1e100);
  assert.equal(cultivation.CULTIVATION_CHAPTER_WEIGHT, 1e90);
  assert.equal(cultivation.shouldOfferTruthChoice(true, false, false), true);
  assert.equal(cultivation.shouldOfferTruthChoice(false, true, false), true);
  assert.equal(cultivation.shouldOfferTruthChoice(true, true, true), false);
  assert.equal(cultivation.isTruthRun(["1001", "site-red-pill"]), true);
  assert.equal(cultivation.isTruthRun(["1048", "20461"]), false);
  assert.deepEqual(cultivation.RED_PILL_TALENT.exclude.map(String), ["1004", "1024", "1025", "1113"]);
  assert.deepEqual(endings.scheduledSpecialEvents(["site-red-pill"], () => 0.5)[0], { id: "10001", age: 0 });
  assert.equal(cultivation.TRUE_ENDING_QUOTE, "我再一次站在阳光下，就像我儿时那样，我一无所有，一无所学，一无所知。");
  assert.equal(cultivation.TRUE_ENDING_REFLECTION.length, 2);
  assert.deepEqual(
    cultivation.CULTIVATION_ROUTE_CHAPTERS.map(({ minAge, maxAge }) => [minAge, maxAge]),
    [[101, 109], [110, 129], [130, 159], [160, 199], [200, 239], [240, 279], [280, 319], [320, 359], [360, 399], [400, 439], [440, 469], [470, 484], [485, 498], [499, 499]],
  );
  cultivation.CULTIVATION_ROUTE_CHAPTERS.forEach((entry, index) => {
    const previousId = index === 0 ? "40001" : cultivation.CULTIVATION_ROUTE_CHAPTERS[index - 1].id;
    assert.ok(entry.event.include.includes(previousId));
  });
});

test("chooses the special event year across the complete 20 through 32 range", () => {
  assert.equal(overrides.randomUnloadedHometownAge(() => 0), 20);
  assert.equal(overrides.randomUnloadedHometownAge(() => 0.5), 26);
  assert.equal(overrides.randomUnloadedHometownAge(() => 0.999999), 32);
});
