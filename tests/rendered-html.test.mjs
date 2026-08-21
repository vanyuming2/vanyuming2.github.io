import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("exports the finished memorial page", async () => {
  const html = await readFile(new URL("dist/client/index.html", root), "utf8");

  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /万雨铭/);
  assert.match(html, /张锦/);
  assert.match(html, /偶尔更新/);
  assert.doesNotMatch(html, /class="names"/);
  assert.match(html, /<h1[^>]*>随便看看<\/h1>/);
  assert.match(html, /见面再说。/);
  assert.doesNotMatch(html, /离见面，又近了一天。/);
  assert.match(html, /<details class="privateArchive">/);
  assert.match(html, /这里留了一些东西 · 点击查看/);
  assert.match(html, /这部分显示有点问题，暂时隐藏内容。/);
  assert.match(html, /class="privateArchiveStored" hidden/);
  assert.doesNotMatch(html, /<details class="privateArchive" open/);
  assert.doesNotMatch(html, /<footer/);
  assert.doesNotMatch(html, /<span>万雨铭 &amp; 张锦<\/span>/);
  assert.match(html, /实验小学/);
  assert.match(html, /同桌/);
  assert.match(html, /班长/);
  assert.match(html, /早读/);
  assert.match(html, /2025\.09/);
  assert.match(html, /2026\.04\.29/);
  assert.match(html, /00:17/);
  assert.match(html, /八月见/);
  assert.match(html, /写给三个时期的你/);
  assert.match(html, /第一次认识你/);
  assert.match(html, /熟悉好像从来没有走远/);
  assert.match(html, /这一次，我想认真走近你/);
  assert.match(html, /https:\/\/vanyuming2\.github\.io\/og\.png/);
  assert.doesNotMatch(
    html,
    /天津财经大学|山东青年政治学院|西安电子科技大学|西安交通大学|MBA|软件方向|开始工作/,
  );
  assert.doesNotMatch(html, /恋爱笔记|顺便记一下|小册子|CHAPTER/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Starter Project/);
});

test("keeps the timer exact and accessible", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(page, /2026-04-29T00:17:00\+08:00/);
  assert.match(page, /Date\.now\(\)/);
  assert.match(page, /visibilitychange/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /name="memory-letters"/);
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.envelopeFlap/);
  assert.match(css, /@keyframes letterReveal/);
});

test("includes the GitHub Pages assets", async () => {
  const ogPath = new URL("dist/client/og.png", root);
  const noJekyllPath = new URL("dist/client/.nojekyll", root);

  await Promise.all([access(ogPath), access(noJekyllPath)]);
  assert.ok((await stat(ogPath)).size > 100_000);
});

test("keeps the memory icons replaceable and ships the mini game", async () => {
  const [html, moments, quest] = await Promise.all([
    readFile(new URL("dist/client/index.html", root), "utf8"),
    readFile(new URL("app/memory-moments.ts", root), "utf8"),
    readFile(new URL("app/MemoryQuest.tsx", root), "utf8"),
  ]);

  assert.match(html, /大白鹅/);
  assert.match(html, /海星/);
  assert.match(
    html,
    /class="memoryQuestProgress">找到 <strong>0<\/strong> \/ <!-- -->5/,
  );
  assert.match(moments, /imagePath:\s*"\/memory-moments\/white-goose\.png\?v=20260807"/);
  assert.match(moments, /imagePath:\s*"\/memory-moments\/starfish\.png\?v=20260807"/);
  assert.match(quest, /const MEMORY_GOAL = memoryMoments\.length/);
  assert.match(quest, /const GAME_TICK_MS = 270/);
  assert.match(quest, /const SNAKE_MOTION_MS = 230/);
  assert.match(quest, /function StarlightSnake/);
  assert.match(quest, /starlightSnakeCanvas/);
  assert.match(quest, /src=\{currentTarget\.imagePath\}/);
  assert.match(quest, /\{allMomentsCollected && \(/);
  assert.doesNotMatch(quest, /invitationReady/);
  assert.match(quest, /const smoothTaper = taper \* taper/);
  assert.match(quest, /最后一件事，留到我们见面以后再写。/);

  const iconFiles = [
    "white-goose.png",
    "starfish.png",
    "textbook.png",
    "chat-bubble.png",
    "moonlit-night.png",
  ];

  await Promise.all(
    iconFiles.map((name) =>
      access(new URL(`dist/client/memory-moments/${name}`, root)),
    ),
  );
});

test("exports the first low-poly memory garden", async () => {
  const [homeHtml, gardenHtml, scene, data, packageJson] = await Promise.all([
    readFile(new URL("dist/client/index.html", root), "utf8"),
    readFile(new URL("dist/client/garden/index.html", root), "utf8"),
    readFile(new URL("app/garden/GardenScene.tsx", root), "utf8"),
    readFile(new URL("app/garden/garden-data.ts", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
  ]);

  assert.match(homeHtml, /href="\/garden\/"/);
  assert.match(homeHtml, /去看看我们的第一块小花园/);
  assert.match(gardenHtml, /data-memory-garden="first-garden"/);
  assert.match(gardenHtml, /第一块小花园/);
  assert.match(gardenHtml, /回到那颗星星/);
  assert.match(gardenHtml, /池塘、白鹅、海星和那张课桌/);
  assert.match(scene, /new THREE\.OrthographicCamera/);
  assert.match(scene, /RoundedBoxGeometry/);
  assert.match(scene, /prefers-reduced-motion/);
  assert.match(scene, /ResizeObserver/);
  assert.match(data, /kind: "white-goose"/);
  assert.match(data, /kind: "starfish"/);
  assert.match(data, /kind: "school-desk"/);
  assert.match(packageJson, /"three":/);
});

test("exports the complete original-data life-remake loop", async () => {
  const [homeHtml, remakeHtml, game, engine, remakeCss, weirdTales, specialEndings, cultivation, notice, publishedNotice] = await Promise.all([
    readFile(new URL("dist/client/index.html", root), "utf8"),
    readFile(new URL("dist/client/remake/index.html", root), "utf8"),
    readFile(new URL("app/remake/LifeRestartGame.tsx", root), "utf8"),
    readFile(new URL("app/life/remake-engine.ts", root), "utf8"),
    readFile(new URL("app/remake/remake.module.css", root), "utf8"),
    readFile(new URL("app/remake/weird-tales.ts", root), "utf8"),
    readFile(new URL("app/remake/special-endings.ts", root), "utf8"),
    readFile(new URL("app/remake/cultivation-route.ts", root), "utf8"),
    readFile(new URL("THIRD_PARTY_NOTICES.md", root), "utf8"),
    readFile(new URL("dist/client/third-party-notices.txt", root), "utf8"),
  ]);

  assert.match(homeHtml, /href="\/remake\/"/);
  assert.match(homeHtml, /如果人生可以再写一次/);
  assert.match(remakeHtml, /data-life-remake="original-zh-cn-complete-loop"/);
  assert.match(remakeHtml, /要不要，再写一次人生/);
  assert.match(game, /每次重来，都会留下些东西。有些内容，要多走几段人生才会出现。/);
  assert.match(game, /下一次轮回里，藏着的东西也许比你想象得更多。等零散的痕迹彼此对上，你看到的，或许会是这个世界原本的样子。/);
  assert.doesNotMatch(remakeHtml, /中文内容与规则改编自|卡片按原版等级着色/);
  assert.match(game, /loadOriginalData/);
  assert.match(game, /1719 条原版中文经历/);
  assert.match(game, /selectedTalentIds\.length !== 3/);
  assert.match(game, /const TALENT_DRAW_COUNT = 30/);
  assert.match(game, /const MAX_TALENT_REFRESHES = 3/);
  assert.match(game, /BOOSTED_TALENT_RATES/);
  assert.match(game, /从三十张天赋里带走三张/);
  assert.match(game, /换一批 · 剩余/);
  assert.match(game, /normalizeIdArray\(value\.drawIds, talentIds, TALENT_DRAW_COUNT\)/);
  assert.match(game, /talentRefreshesUsed/);
  assert.match(game, /const RED_TALENT_DRAW_CHANCE = 0\.75/);
  assert.match(game, /const ALL_RED_TALENT_IDS = new Set<RemakeId>\(\[\.\.\.RED_TALENT_IDS, RED_PILL_TALENT_ID\]\)/);
  assert.match(game, /exclusiveTalentGroups: \[\[\.\.\.ALL_RED_TALENT_IDS\]\]/);
  assert.match(game, /includeTalentIds: includedTalentIds/);
  assert.match(game, /excludeTalentIds: \[\.\.\.RED_TALENT_IDS\]/);
  assert.match(game, /compatibleTalentIds\.filter\(\(id\) => !RED_TALENT_IDS\.has\(toId\(id\)\)\)/);
  assert.match(game, /1048: 4/);
  assert.match(game, /1065: 4/);
  assert.match(game, /1128: 4/);
  assert.match(game, /\[SHAMBHALA_TALENT_ID\]: 5/);
  assert.match(game, /\[GONGGONG_BLOODLINE_TALENT_ID\]: 5/);
  assert.match(game, /\[PENGLAI_TALENT_ID\]: 5/);
  assert.match(game, /\[DOUBLE_FISH_TALENT_ID\]: 5/);
  assert.match(game, /\[CTHULHU_CEMETERY_TALENT_ID\]: 5/);
  assert.match(game, /\[KUNLUN_BONES_TALENT_ID\]: 5/);
  assert.match(game, /每段人生最多出现 1 种红色天赋 · 常规开局出现概率 75%/);
  assert.match(game, /本世唯一/);
  assert.match(game, /talentMeta/);
  assert.match(game, /HIDDEN_ORIGINAL_EVENT_IDS: readonly RemakeId\[\] = \["10770"\]/);
  assert.match(game, /omitHiddenEventsFromSnapshot/);
  assert.match(game, /advanceLife/);
  assert.doesNotMatch(game, /mortalityChance/);
  assert.match(game, /prepareTalents/);
  assert.match(game, /inheritAndRestart/);
  assert.match(game, /totalYears: current\.totalYears \+ completedLifeYears\(run\)/);
  assert.match(game, /游戏已达成 · 完美结局/);
  assert.match(game, /世轮回、共/);
  assert.match(game, /终于走完月白仙章/);
  assert.match(game, /exportSave/);
  assert.match(game, /achievementIds/);
  assert.match(game, /openPanel\("tales",/);
  assert.match(game, /异闻录/);
  assert.match(game, /data-weird-tale/);
  assert.match(game, /special-ending/);
  assert.match(game, /无法回避的异闻/);
  assert.match(game, /首次发现/);
  assert.match(game, /这一年的记录，在这里断了一下/);
  assert.match(game, /进入异闻/);
  assert.match(game, /跳过观赏/);
  assert.match(game, /pendingSpecialEndingId/);
  assert.match(game, /entryMode === "optional"/);
  assert.match(game, /收录并结束此生/);
  assert.match(game, /收录并继续人生/);
  assert.match(game, /<figcaption>/);
  assert.match(game, /preview/);
  assert.match(game, /const REMAKE_DEVTOOLS_ENABLED = process\.env\.NODE_ENV !== "production"/);
  assert.match(game, /hostname === "localhost"/);
  assert.match(game, /hostname === "127\.0\.0\.1"/);
  assert.match(game, /hostname === "::1"/);
  assert.match(game, /devtoolsEnabled &&/);
  assert.match(game, /devtoolsEnabled && stage === "debug"/);
  assert.match(game, /开发人员调试台/);
  assert.match(game, /forcedEventIds/);
  assert.doesNotMatch(remakeHtml, /开发人员调试台|选择全部 184 个|调试人生已装载/);
  assert.match(engine, /export function checkCondition/);
  assert.match(engine, /NoRandom/);
  assert.match(engine, /event\.branches/);
  assert.match(engine, /runToEnd/);
  assert.match(engine, /probabilityPercent/);
  assert.match(engine, /talentWeights/);
  assert.match(remakeCss, /\[data-rarity="mythic"\]/);
  assert.match(remakeCss, /\[data-rarity="anomaly"\]/);
  assert.match(remakeCss, /\.weirdTalePanel/);
  assert.match(remakeCss, /\.storyViewer/);
  assert.match(remakeCss, /\.specialEndingCard/);
  assert.match(remakeCss, /\.pillChoiceCard/);
  assert.match(remakeCss, /\.trueEndingCard/);
  assert.match(weirdTales, /白石坳借年簿/);
  assert.match(weirdTales, /第七码头来电/);
  assert.match(weirdTales, /id: "10422"/);
  assert.match(weirdTales, /id: "1128"/);
  assert.match(weirdTales, /minimumPriorClues: 6/);
  assert.match(weirdTales, /minimumPriorClues: 7/);
  assert.match(specialEndings, /未加载的世界/);
  assert.match(specialEndings, /世界是假的，爱是真的/);
  assert.match(specialEndings, /sourceEventIds: \[UNLOADED_HOMETOWN_EVENT_ID\]/);
  assert.doesNotMatch(specialEndings, /"21307"/);
  assert.match(specialEndings, /\{ length: 25 \}/);
  assert.match(specialEndings, /index \+ 26/);
  assert.doesNotMatch(specialEndings, /返乡前的记录/);
  assert.match(game, /stage === "pill-choice"/);
  assert.match(game, /stage === "true-ending"/);
  assert.match(game, /preview === "pill-choice"/);
  assert.match(game, /preview === "true-ending"/);
  assert.match(game, /preview === "perfect-ending"/);
  assert.match(game, /scheduledSpecialEvents\(runTalentIds\)/);
  assert.doesNotMatch(game, /availableTruthEventAge/);
  assert.match(game, /RED_PILL_TALENT_ID/);
  assert.match(game, /MALE_INCOMPATIBLE_TALENT_IDS/);
  assert.match(game, /withoutMaleIncompatibleTalents/);
  assert.match(game, /visibleTalentDraw/);
  assert.match(game, /useState<RemakeId \| null>\(null\)/);
  assert.match(game, /不强制特殊事件/);
  assert.match(game, /仅以所选天赋开始/);
  assert.match(game, /没有强制指定特殊事件/);
  assert.match(game, /debugEventId === UNLOADED_HOMETOWN_EVENT_ID/);
  assert.match(game, /睁开眼睛/);
  assert.match(game, /窗外已经亮了/);
  assert.match(game, /游戏已达成 · 真结局/);
  assert.match(game, /合上这一页/);
  assert.doesNotMatch(game, /trueEndingWindow/);
  assert.doesNotMatch(game, /TRUE ENDING · 日光之下/);
  assert.doesNotMatch(game, /写在最后/);
  assert.match(cultivation, /我再一次站在阳光下，就像我儿时那样，我一无所有，一无所学，一无所知/);
  assert.match(cultivation, /所谓真结局，不是终于得到了所有答案/);
  assert.match(cultivation, /FIRST_CULTIVATION_EVENT_ID/);
  assert.match(cultivation, /只按自己摸索出的吐纳次序练气/);
  assert.match(cultivation, /PEVT\?\["\$\{FIRST_CULTIVATION_EVENT_ID\}"\]/);
  assert.match(engine, /property === "PEVT"/);
  assert.match(cultivation, /CULTIVATION_SIDE_EVENTS/);
  assert.match(cultivation, /你心情大好/);
  assert.match(specialEndings, /香巴拉世界/);
  assert.match(specialEndings, /SHAMBHALA_WORLD_ID/);
  assert.match(specialEndings, /EIGHTIES_ROOM_ID/);
  assert.match(specialEndings, /屋里七天/);
  assert.match(specialEndings, /EIGHTIES_GHOST_EVENT_ID/);
  assert.match(specialEndings, /GONGGONG_ZHURONG_ID/);
  assert.match(specialEndings, /PENGLAI_ROUTE_ID/);
  assert.match(specialEndings, /蓬莱航线/);
  assert.match(specialEndings, /罗布泊的第二次日落/);
  assert.match(specialEndings, /七千米深处的鲸骨走廊/);
  assert.match(specialEndings, /昆仑骸骨/);
  assert.match(specialEndings, /DOUBLE_FISH_JADE_ID/);
  assert.match(specialEndings, /CTHULHU_CEMETERY_ID/);
  assert.match(specialEndings, /KUNLUN_BONES_ID/);
  assert.match(specialEndings, /\/remake-tales\/penglai-route\//);
  assert.match(specialEndings, /共工与祝融/);
  assert.match(specialEndings, /triggerAgeRange/);
  assert.match(specialEndings, /这是！！！香巴拉吗？？/);
  await access(new URL("dist/client/remake-tales/unloaded-hometown/01.webp", root));
  await access(new URL("dist/client/remake-tales/unloaded-hometown/25.webp", root));
  await access(new URL("dist/client/remake-tales/unloaded-hometown/26.webp", root));
  await access(new URL("dist/client/remake-tales/unloaded-hometown/50.webp", root));
  await access(new URL("dist/client/remake-tales/shambhala-world/01.webp", root));
  await access(new URL("dist/client/remake-tales/shambhala-world/27.webp", root));
  await access(new URL("dist/client/remake-tales/eighties-room/01.webp", root));
  await access(new URL("dist/client/remake-tales/eighties-room/20.webp", root));
  await access(new URL("dist/client/remake-tales/gonggong-zhurong/01.webp", root));
  await access(new URL("dist/client/remake-tales/gonggong-zhurong/16.webp", root));
  await access(new URL("dist/client/remake-tales/penglai-route/01.webp", root));
  await access(new URL("dist/client/remake-tales/penglai-route/25.webp", root));
  await access(new URL("dist/client/remake-tales/double-fish-jade/01.webp", root));
  await access(new URL("dist/client/remake-tales/double-fish-jade/26.webp", root));
  await access(new URL("dist/client/remake-tales/cthulhu-cemetery/01.webp", root));
  await access(new URL("dist/client/remake-tales/cthulhu-cemetery/21.webp", root));
  await access(new URL("dist/client/remake-tales/kunlun-bones/01.webp", root));
  await access(new URL("dist/client/remake-tales/kunlun-bones/35.webp", root));
  assert.match(notice, /Simplified Chinese data/);
  assert.match(notice, /Copyright \(c\) 2021 神戸小鳥/);
  assert.match(notice, /MIT License/);
  assert.match(publishedNotice, /Copyright \(c\) 2021 神戸小鳥/);
  assert.match(publishedNotice, /MIT License/);
});
