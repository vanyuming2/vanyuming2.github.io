"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
} from "react";

import {
  checkCondition,
  createRemakeEngine,
  type ConditionProperties,
  type RemakeAllocation,
  type RemakeCharacterRecord,
  type RemakeContent,
  type RemakeData,
  type RemakeEffect,
  type RemakeGrade,
  type RemakeId,
  type RemakeEngine,
  type RemakeSession,
  type RemakeSnapshot,
  type RemakeStats,
  type RemakeStatKey,
  type RemakeTalentCard,
} from "../life/remake-engine";
import {
  WEIRD_TALE_LINES,
  discoveredWeirdTaleIds,
  findWeirdTaleClue,
  type WeirdTaleClue,
} from "./weird-tales";
import {
  FIRST_SPECIAL_ACHIEVEMENT_ID,
  PERFECT_CULTIVATION_ACHIEVEMENT_ID,
  PERFECT_CULTIVATION_EVENT_ID,
  RED_PILL_TALENT_ID,
  SMALL_BOX_TALENT_ID,
  TRUE_ENDING_ATTRIBUTION,
  TRUE_ENDING_ACHIEVEMENT_ID,
  TRUE_ENDING_QUOTE,
  TRUE_ENDING_REFLECTION,
  isCultivationEventId,
  isTruthRun,
  shouldOfferTruthChoice,
} from "./cultivation-route";
import {
  SPECIAL_ENDINGS,
  UNLOADED_HOMETOWN,
  UNLOADED_HOMETOWN_ID,
  findSpecialEndingBySource,
  hasSpecialEndingSource,
  scheduledSpecialEvents,
  specialEndingTriggerAge,
  type SpecialEnding,
} from "./special-endings";
import {
  CTHULHU_CEMETERY_TALENT_ID,
  DOUBLE_FISH_TALENT_ID,
  EIGHT_FOOT_WOMAN_TALENT_ID,
  GONGGONG_BLOODLINE_TALENT_ID,
  KUNLUN_BONES_TALENT_ID,
  PENGLAI_TALENT_ID,
  SAND_SEA_TALENT_ID,
  SHAMBHALA_TALENT_ID,
  UNLOADED_HOMETOWN_EVENT_ID,
  UNLOADED_HOMETOWN_MAX_AGE,
  UNLOADED_HOMETOWN_MIN_AGE,
  applySiteEventOverrides,
  randomUnloadedHometownAge,
} from "./site-event-overrides";
import styles from "./remake.module.css";

type Stage =
  | "home"
  | "mode"
  | "talents"
  | "characters"
  | "debug"
  | "allocate"
  | "running"
  | "special-ending"
  | "summary"
  | "pill-choice"
  | "true-ending";

type Panel = "achievements" | "archive" | "tales" | "save";

type MetaProgress = {
  runs: number;
  totalYears: number;
  maxAge: number;
  inheritedTalentId: RemakeId | null;
  unlockedTalentIds: RemakeId[];
  unlockedEventIds: RemakeId[];
  achievementIds: RemakeId[];
  specialEndingIds: string[];
  truthChoiceAvailable: boolean;
  truthRunArmed: boolean;
};

type StoredGame = {
  version: 2;
  stage: Stage;
  drawIds: RemakeId[];
  talentRefreshesUsed: number;
  selectedTalentIds: RemakeId[];
  preparedTalentIds: RemakeId[];
  characterDrawIds: RemakeId[];
  allocation: RemakeAllocation;
  run: RemakeSnapshot | null;
  progress: MetaProgress;
  pendingSpecialEndingId: string | null;
};

type TimelineItem = {
  age: number;
  content: RemakeContent;
  weirdTale?: WeirdTaleClue;
};

const STORAGE_KEY = "wm-zj-life-remake:v2";
const LEGACY_STORAGE_KEY = "wm-zj-life-remake:v1";
const TALENT_DRAW_COUNT = 30;
const MAX_TALENT_REFRESHES = 3;
const RED_TALENT_DRAW_CHANCE = 0.75;
const REMAKE_DEVTOOLS_ENABLED = process.env.NODE_ENV !== "production";

function mobileStoryImagePath(path: string) {
  return path.replace(/\.webp$/, ".mobile.webp");
}

const BOOSTED_TALENT_RATES = {
  0: 45,
  1: 30,
  2: 18,
  3: 7,
  total: 100,
} satisfies Partial<Record<RemakeGrade, number>> & { total: number };
const RED_TALENT_WEIGHTS: Partial<Record<RemakeId, number>> = {
  1048: 4,
  1065: 4,
  1128: 4,
  [SHAMBHALA_TALENT_ID]: 5,
  [GONGGONG_BLOODLINE_TALENT_ID]: 5,
  [PENGLAI_TALENT_ID]: 5,
  [DOUBLE_FISH_TALENT_ID]: 5,
  [CTHULHU_CEMETERY_TALENT_ID]: 5,
  [KUNLUN_BONES_TALENT_ID]: 5,
  [SAND_SEA_TALENT_ID]: 5,
};
const RED_TALENT_IDS = new Set<RemakeId>(Object.keys(RED_TALENT_WEIGHTS));
const ALL_RED_TALENT_IDS = new Set<RemakeId>([...RED_TALENT_IDS, RED_PILL_TALENT_ID]);
const MALE_INCOMPATIBLE_TALENT_IDS = new Set<RemakeId>(["1004", "1024", "1025", "1113"]);
const MALE_REQUIRED_TALENT_IDS = new Set<RemakeId>([
  RED_PILL_TALENT_ID,
  GONGGONG_BLOODLINE_TALENT_ID,
  PENGLAI_TALENT_ID,
  DOUBLE_FISH_TALENT_ID,
  CTHULHU_CEMETERY_TALENT_ID,
  KUNLUN_BONES_TALENT_ID,
  SAND_SEA_TALENT_ID,
  EIGHT_FOOT_WOMAN_TALENT_ID,
]);
const HIDDEN_ORIGINAL_EVENT_IDS: readonly RemakeId[] = ["10770"];
const ALLOCATABLE_STATS = ["CHR", "INT", "STR", "MNY"] as const;
const ALL_STATS = ["CHR", "INT", "STR", "MNY", "SPR"] as const;

function subscribeToDevtoolsHost() {
  return () => undefined;
}

function localDevtoolsSnapshot() {
  const hostname = window.location.hostname;
  return REMAKE_DEVTOOLS_ENABLED
    || hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname === "::1";
}
const VALID_STAGES = new Set<Stage>([
  "home",
  "mode",
  "talents",
  "characters",
  "debug",
  "allocate",
  "running",
  "special-ending",
  "summary",
  "pill-choice",
  "true-ending",
]);

const STAT_META: Record<RemakeStatKey, { label: string; glyph: string }> = {
  CHR: { label: "颜值", glyph: "✦" },
  INT: { label: "智力", glyph: "◇" },
  STR: { label: "体质", glyph: "♧" },
  MNY: { label: "家境", glyph: "◌" },
  SPR: { label: "快乐", glyph: "☀" },
};

const GRADE_META: Record<RemakeGrade, { label: string; rarity: string; glyph: string }> = {
  0: { label: "普通", rarity: "common", glyph: "○" },
  1: { label: "稀有", rarity: "rare", glyph: "◇" },
  2: { label: "史诗", rarity: "epic", glyph: "✦" },
  3: { label: "传说", rarity: "legendary", glyph: "★" },
};

const RED_TALENT_META = { label: "红色天赋", rarity: "mythic", glyph: "◆" } as const;
const CULTIVATION_META = { label: "月白仙章", rarity: "immortal", glyph: "✧" } as const;
const FIRST_SPECIAL_META = { label: "冰山一角", rarity: "horizon", glyph: "◒" } as const;
const PERFECT_ENDING_META = { label: "完美结局", rarity: "immortal", glyph: "✧" } as const;
const TRUE_ENDING_META = { label: "真结局", rarity: "truth", glyph: "☼" } as const;

function talentMeta(talentId: RemakeId, grade: RemakeGrade) {
  return RED_TALENT_IDS.has(toId(talentId)) ? RED_TALENT_META : GRADE_META[grade];
}

function achievementMeta(achievementId: RemakeId, grade: RemakeGrade) {
  if (toId(achievementId) === FIRST_SPECIAL_ACHIEVEMENT_ID) return FIRST_SPECIAL_META;
  if (toId(achievementId) === PERFECT_CULTIVATION_ACHIEVEMENT_ID) return PERFECT_ENDING_META;
  if (toId(achievementId) === TRUE_ENDING_ACHIEVEMENT_ID) return TRUE_ENDING_META;
  return GRADE_META[grade];
}

const EMPTY_PROGRESS: MetaProgress = {
  runs: 0,
  totalYears: 0,
  maxAge: 0,
  inheritedTalentId: null,
  unlockedTalentIds: [],
  unlockedEventIds: [],
  achievementIds: [],
  specialEndingIds: [],
  truthChoiceAvailable: false,
  truthRunArmed: false,
};

const DEFAULT_ALLOCATION: RemakeAllocation = {
  CHR: 5,
  INT: 5,
  STR: 5,
  MNY: 5,
};

function createSiteEngine(data: RemakeData, progress: MetaProgress) {
  return createRemakeEngine(data, {
    talentRates: BOOSTED_TALENT_RATES,
    talentWeights: RED_TALENT_WEIGHTS,
    exclusiveTalentGroups: [[...ALL_RED_TALENT_IDS]],
    persistent: {
      times: progress.runs,
      achievedEvents: progress.unlockedEventIds,
      achievedTalents: progress.unlockedTalentIds,
    },
  });
}

function chooseLifeRedTalent(
  data: RemakeData,
  engine: RemakeEngine,
  inheritedTalentId: RemakeId | null,
  random = Math.random,
) {
  const inheritedId = inheritedTalentId === null ? null : toId(inheritedTalentId);
  if (inheritedId && RED_TALENT_IDS.has(inheritedId)) return inheritedId;
  if (random() >= RED_TALENT_DRAW_CHANCE) return null;

  const candidates = Object.entries(RED_TALENT_WEIGHTS)
    .map(([id, weight]) => ({ id: toId(id), weight: Math.max(0, numberValue(weight)) }))
    .filter(({ id, weight }) => (
      weight > 0
      && Boolean(data.talents[id])
      && !numberValue(data.talents[id].exclusive)
      && (!inheritedId || !engine.findTalentConflict([inheritedId], id))
    ));
  const totalWeight = candidates.reduce((total, candidate) => total + candidate.weight, 0);
  if (totalWeight <= 0) return null;

  let cursor = Math.min(Math.max(random(), 0), 1 - Number.EPSILON) * totalWeight;
  for (const candidate of candidates) {
    cursor -= candidate.weight;
    if (cursor < 0) return candidate.id;
  }
  return candidates.at(-1)?.id ?? null;
}

function drawLifeTalentCards(
  engine: RemakeEngine,
  inheritedTalentId: RemakeId | null,
  lifeRedTalentId: RemakeId | null,
  maleLocked: boolean,
) {
  const inheritedId = inheritedTalentId === null ? null : toId(inheritedTalentId);
  const visibleInheritedTalentId = maleLocked && inheritedId && RED_TALENT_IDS.has(inheritedId)
    ? null
    : inheritedTalentId;
  const includedTalentIds = mergeUnique(
    visibleInheritedTalentId === null ? [] : [visibleInheritedTalentId],
    lifeRedTalentId === null ? [] : [lifeRedTalentId],
  );
  const result = engine.drawTalents({
    count: TALENT_DRAW_COUNT + (maleLocked ? MALE_INCOMPATIBLE_TALENT_IDS.size : 0),
    includeTalentIds: includedTalentIds,
    excludeTalentIds: [...RED_TALENT_IDS],
  });
  return maleLocked
    ? result.cards.filter(({ id }) => !MALE_INCOMPATIBLE_TALENT_IDS.has(toId(id))).slice(0, TALENT_DRAW_COUNT)
    : result.cards;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toId(value: unknown): RemakeId {
  return String(value);
}

function numberValue(value: unknown, fallback = 0): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function gradeValue(value: unknown): RemakeGrade {
  const grade = Math.trunc(numberValue(value));
  return grade === 1 || grade === 2 || grade === 3 ? grade : 0;
}

function mergeUnique(first: readonly RemakeId[], second: readonly RemakeId[]) {
  return [...new Set([...first.map(toId), ...second.map(toId)])];
}

function requiresMaleLead(talentIds: readonly RemakeId[]) {
  return talentIds.some((id) => MALE_REQUIRED_TALENT_IDS.has(toId(id)));
}

function withoutMaleIncompatibleTalents(talentIds: readonly RemakeId[]) {
  return talentIds.filter((id) => !MALE_INCOMPATIBLE_TALENT_IDS.has(toId(id)));
}

function findSpecialEndingStory(id: string | null) {
  if (!id) return null;
  const ending = SPECIAL_ENDINGS.find((item) => item.id === id);
  if (ending) return { story: ending, parent: ending, isMirror: false };
  for (const parent of SPECIAL_ENDINGS) {
    if (parent.mirrorChapter?.id !== id) continue;
    return {
      story: {
        ...parent,
        ...parent.mirrorChapter,
        mirrorChapter: undefined,
      } satisfies SpecialEnding,
      parent,
      isMirror: true,
    };
  }
  return null;
}

function balancedAllocation(total: number): RemakeAllocation {
  const next: RemakeAllocation = { CHR: 0, INT: 0, STR: 0, MNY: 0 };
  let remaining = Math.max(0, Math.min(40, Math.trunc(total)));
  let cursor = 0;
  while (remaining > 0) {
    const key = ALLOCATABLE_STATS[cursor % ALLOCATABLE_STATS.length];
    if (next[key] < 10) {
      next[key] += 1;
      remaining -= 1;
    }
    cursor += 1;
  }
  return next;
}

function formatProbability(probability: number) {
  const percent = probability * 100;
  if (percent > 0 && percent < 0.01) return "<0.01%";
  if (percent < 0.1) return `${percent.toFixed(2)}%`;
  if (percent < 10) return `${percent.toFixed(1)}%`;
  return `${percent.toFixed(0)}%`;
}

function formatEffect(effect?: RemakeEffect) {
  if (!effect) return "";
  const labels: Record<string, string> = {
    ...Object.fromEntries(Object.entries(STAT_META).map(([key, value]) => [key, value.label])),
    AGE: "年龄",
    LIF: "生命",
    RDM: "随机属性",
  };
  return Object.entries(effect)
    .filter(([, raw]) => numberValue(raw) !== 0)
    .map(([key, raw]) => {
      const amount = numberValue(raw);
      return `${labels[key] ?? key}${amount > 0 ? "+" : ""}${amount}`;
    })
    .join(" · ");
}

function scoreFromSnapshot(run: RemakeSnapshot) {
  return Math.floor(
    (run.highest.CHR + run.highest.INT + run.highest.STR + run.highest.MNY + run.highest.SPR) * 2
      + run.highest.AGE / 2,
  );
}

function completedLifeYears(run: RemakeSnapshot) {
  return Math.max(0, Math.trunc(Math.max(run.age, run.highest.AGE)));
}

function perfectEndingPreviewSnapshot(): RemakeSnapshot {
  const stats: RemakeStats = { CHR: 18, INT: 2600, STR: 4200, MNY: 16, SPR: 24, LIF: 0 };
  return {
    version: 1,
    age: 500,
    stats,
    talentIds: [SMALL_BOX_TALENT_ID],
    eventIds: [PERFECT_CULTIVATION_EVENT_ID],
    triggerCounts: {},
    highest: { AGE: 500, CHR: 18, INT: 2600, STR: 4200, MNY: 16, SPR: 24 },
    lowest: { AGE: -1, CHR: 10, INT: 10, STR: 10, MNY: 10, SPR: 5 },
    ended: true,
    initialContent: [],
    history: [],
  };
}

function timelineFromSnapshot(run: RemakeSnapshot, visibleClueIds: ReadonlySet<string>): TimelineItem[] {
  const baseTimeline = [
    ...run.initialContent.map((content) => ({ age: -1, content })),
    ...run.history.flatMap((year) => year.content.map((content) => ({ age: year.age, content }))),
  ];
  const appendedClues = new Set<string>();
  return baseTimeline.flatMap((item): TimelineItem[] => {
    const clue = findWeirdTaleClue({ type: item.content.type, id: item.content.id });
    if (!clue || !visibleClueIds.has(clue.id) || appendedClues.has(clue.id)) return [item];
    appendedClues.add(clue.id);
    return [
      item,
      {
        age: item.age,
        weirdTale: clue,
        content: {
          type: "event",
          id: `weird-tale-${clue.id}`,
          grade: 3,
          name: clue.title,
          description: clue.body,
        },
      },
    ];
  });
}

function omitHiddenEventsFromSnapshot(run: RemakeSnapshot): RemakeSnapshot {
  const hidden = new Set(HIDDEN_ORIGINAL_EVENT_IDS);
  return {
    ...run,
    eventIds: run.eventIds.filter((id) => !hidden.has(toId(id))),
    initialContent: run.initialContent.filter((content) => !hidden.has(toId(content.id))),
    history: run.history.map((year) => ({
      ...year,
      content: year.content.filter((content) => !hidden.has(toId(content.id))),
    })),
  };
}

function achievementEntries(data: RemakeData) {
  return Object.entries(data.achievement ?? {}).map(([key, achievement]) => ({
    ...achievement,
    id: toId(achievement.id ?? key),
    grade: gradeValue(achievement.grade),
  }));
}

function achievementProperties(progress: MetaProgress, run: RemakeSnapshot): ConditionProperties {
  const score = scoreFromSnapshot(run);
  return {
    AGE: run.age,
    CHR: run.stats.CHR,
    INT: run.stats.INT,
    STR: run.stats.STR,
    MNY: run.stats.MNY,
    SPR: run.stats.SPR,
    LIF: run.stats.LIF,
    HAGE: run.highest.AGE,
    HCHR: run.highest.CHR,
    HINT: run.highest.INT,
    HSTR: run.highest.STR,
    HMNY: run.highest.MNY,
    HSPR: run.highest.SPR,
    LAGE: run.lowest.AGE,
    LCHR: run.lowest.CHR,
    LINT: run.lowest.INT,
    LSTR: run.lowest.STR,
    LMNY: run.lowest.MNY,
    LSPR: run.lowest.SPR,
    SUM: score,
    TMS: progress.runs,
    TLT: run.talentIds,
    EVT: run.eventIds,
    ATLT: progress.unlockedTalentIds,
    AEVT: progress.unlockedEventIds,
    ACHV: progress.achievementIds,
  };
}

function progressAfter(
  current: MetaProgress,
  run: RemakeSnapshot,
  data: RemakeData,
  opportunities: readonly string[],
): MetaProgress {
  const next: MetaProgress = {
    ...current,
    maxAge: Math.max(current.maxAge, run.highest.AGE),
    unlockedTalentIds: mergeUnique(current.unlockedTalentIds, run.talentIds),
    unlockedEventIds: mergeUnique(current.unlockedEventIds, run.eventIds),
  };
  const unlocked = new Set(next.achievementIds);
  for (const achievement of achievementEntries(data)) {
    if (unlocked.has(achievement.id)) continue;
    if (!opportunities.includes(String(achievement.opportunity ?? ""))) continue;
    const properties = achievementProperties({ ...next, achievementIds: [...unlocked] }, run);
    if (checkCondition(properties, achievement.condition)) unlocked.add(achievement.id);
  }
  return { ...next, achievementIds: [...unlocked] };
}

async function fetchDataFile<T>(name: string): Promise<T> {
  const response = await fetch(`/remake-data/${name}.json`);
  if (!response.ok) throw new Error(`Failed to load ${name}.json`);
  return response.json() as Promise<T>;
}

async function loadOriginalData(): Promise<RemakeData> {
  const [age, events, talents, achievement, character] = await Promise.all([
    fetchDataFile<RemakeData["age"]>("age"),
    fetchDataFile<RemakeData["events"]>("events"),
    fetchDataFile<RemakeData["talents"]>("talents"),
    fetchDataFile<NonNullable<RemakeData["achievement"]>>("achievement"),
    fetchDataFile<NonNullable<RemakeData["character"]>>("character"),
  ]);
  if (
    Object.keys(age).length !== 501
    || Object.keys(events).length !== 1719
    || Object.keys(talents).length !== 184
    || Object.keys(achievement).length !== 165
    || Object.keys(character).length !== 100
  ) {
    throw new Error("The original data package is incomplete.");
  }
  return applySiteEventOverrides({ age, events, talents, achievement, character });
}

function normalizeIdArray(value: unknown, allowed: Set<string>, maximum = 10_000) {
  if (!Array.isArray(value) || value.length > maximum) return [];
  return value.map(toId).filter((id) => allowed.has(id));
}

function normalizeProgress(value: unknown, data: RemakeData): MetaProgress {
  if (!isRecord(value)) return { ...EMPTY_PROGRESS };
  const talents = new Set(Object.keys(data.talents));
  const events = new Set(Object.keys(data.events));
  const achievements = new Set(Object.keys(data.achievement ?? {}));
  const specialEndings = new Set(SPECIAL_ENDINGS.map(({ id }) => id));
  const inherited = value.inheritedTalentId == null ? null : toId(value.inheritedTalentId);
  const achievementIds = normalizeIdArray(value.achievementIds, achievements);
  const trueEndingReached = achievementIds.includes(TRUE_ENDING_ACHIEVEMENT_ID);
  const perfectEndingReached = achievementIds.includes(PERFECT_CULTIVATION_ACHIEVEMENT_ID);
  return {
    runs: Math.max(0, Math.trunc(numberValue(value.runs))),
    totalYears: Math.max(0, Math.trunc(numberValue(value.totalYears))),
    maxAge: Math.max(0, numberValue(value.maxAge)),
    inheritedTalentId: inherited && talents.has(inherited) ? inherited : null,
    unlockedTalentIds: normalizeIdArray(value.unlockedTalentIds, talents),
    unlockedEventIds: normalizeIdArray(value.unlockedEventIds, events),
    achievementIds,
    specialEndingIds: normalizeIdArray(value.specialEndingIds, specialEndings, SPECIAL_ENDINGS.length),
    truthChoiceAvailable: !trueEndingReached
      && (Boolean(value.truthChoiceAvailable) || perfectEndingReached),
    truthRunArmed: !trueEndingReached && Boolean(value.truthRunArmed),
  };
}

function normalizeAllocation(value: unknown): RemakeAllocation {
  if (!isRecord(value)) return { ...DEFAULT_ALLOCATION };
  return {
    CHR: Math.max(0, Math.min(10, numberValue(value.CHR, 5))),
    INT: Math.max(0, Math.min(10, numberValue(value.INT, 5))),
    STR: Math.max(0, Math.min(10, numberValue(value.STR, 5))),
    MNY: Math.max(0, Math.min(10, numberValue(value.MNY, 5))),
  };
}

function restoreStoredGame(value: unknown, data: RemakeData, devtoolsEnabled = false): StoredGame | null {
  if (!isRecord(value) || value.version !== 2) return null;
  const stage = typeof value.stage === "string" && VALID_STAGES.has(value.stage as Stage)
    ? value.stage as Stage
    : "home";
  const talentIds = new Set(Object.keys(data.talents));
  const characterIds = new Set(Object.keys(data.character ?? {}));
  const specialEndings = new Set(SPECIAL_ENDINGS.map(({ id }) => id));
  const progress = normalizeProgress(value.progress, data);
  const drawIds = normalizeIdArray(value.drawIds, talentIds, TALENT_DRAW_COUNT);
  const talentRefreshesUsed = Math.max(
    0,
    Math.min(MAX_TALENT_REFRESHES, Math.trunc(numberValue(value.talentRefreshesUsed))),
  );
  const selectedTalentIds = normalizeIdArray(value.selectedTalentIds, talentIds, 3);
  const preparedTalentIds = normalizeIdArray(value.preparedTalentIds, talentIds, 20);
  const characterDrawIds = normalizeIdArray(value.characterDrawIds, characterIds, 3);
  let run: RemakeSnapshot | null = null;
  if (value.run !== null && value.run !== undefined) {
    try {
      const engine = createSiteEngine(data, progress);
      run = omitHiddenEventsFromSnapshot(engine.restore(value.run as RemakeSnapshot).snapshot());
    } catch {
      return null;
    }
  }
  const restoredStage = stage === "debug" && !devtoolsEnabled ? "home" : stage;
  const safeStage = (restoredStage === "running" || restoredStage === "summary") && !run ? "home" : restoredStage;
  const pendingSpecialEndingId = value.pendingSpecialEndingId == null
    ? null
    : toId(value.pendingSpecialEndingId);
  return {
    version: 2,
    stage: safeStage,
    drawIds,
    talentRefreshesUsed,
    selectedTalentIds,
    preparedTalentIds,
    characterDrawIds,
    allocation: normalizeAllocation(value.allocation),
    run,
    progress,
    pendingSpecialEndingId: pendingSpecialEndingId && specialEndings.has(pendingSpecialEndingId)
      ? pendingSpecialEndingId
      : null,
  };
}

function randomSelection(values: readonly string[], count: number) {
  const pool = [...values];
  const selected: string[] = [];
  while (selected.length < count && pool.length) {
    const index = Math.floor(Math.random() * pool.length);
    selected.push(pool.splice(index, 1)[0]);
  }
  return selected;
}

function naturalAgeForEvent(data: RemakeData, eventId: RemakeId) {
  const directAges = new Map<RemakeId, number>();
  for (const [ageKey, record] of Object.entries(data.age)) {
    const age = Math.max(0, Math.trunc(numberValue(record.age, numberValue(ageKey))));
    const values = Array.isArray(record.event) ? record.event : [record.event];
    for (const value of values) {
      if (value === undefined || value === null || value === "") continue;
      const id = String(value).split("*")[0];
      directAges.set(id, Math.min(directAges.get(id) ?? Number.POSITIVE_INFINITY, age));
    }
  }
  if (directAges.has(eventId)) return directAges.get(eventId) ?? 0;

  const parents = new Map<RemakeId, RemakeId[]>();
  for (const [parentId, event] of Object.entries(data.events)) {
    const branches = Array.isArray(event.branch) ? event.branch : event.branch ? [event.branch] : [];
    for (const branch of branches) {
      const separator = String(branch).lastIndexOf(":");
      if (separator < 0) continue;
      const childId = String(branch).slice(separator + 1).trim();
      parents.set(childId, [...(parents.get(childId) ?? []), parentId]);
    }
  }

  const queue = [eventId];
  const visited = new Set<RemakeId>();
  let earliest = Number.POSITIVE_INFINITY;
  while (queue.length) {
    const current = queue.shift() as RemakeId;
    if (visited.has(current)) continue;
    visited.add(current);
    const directAge = directAges.get(current);
    if (directAge !== undefined) earliest = Math.min(earliest, directAge);
    for (const parent of parents.get(current) ?? []) queue.push(parent);
  }
  return Number.isFinite(earliest) ? earliest : 0;
}

export default function LifeRestartGame() {
  const [data, setData] = useState<RemakeData | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const devtoolsEnabled = useSyncExternalStore(
    subscribeToDevtoolsHost,
    localDevtoolsSnapshot,
    () => REMAKE_DEVTOOLS_ENABLED,
  );
  const [stage, setStage] = useState<Stage>("home");
  const [draw, setDraw] = useState<RemakeTalentCard[]>([]);
  const [talentRefreshesUsed, setTalentRefreshesUsed] = useState(0);
  const [selectedTalentIds, setSelectedTalentIds] = useState<RemakeId[]>([]);
  const [preparedTalentIds, setPreparedTalentIds] = useState<RemakeId[]>([]);
  const [characterDrawIds, setCharacterDrawIds] = useState<RemakeId[]>([]);
  const [allocation, setAllocation] = useState<RemakeAllocation>(DEFAULT_ALLOCATION);
  const [run, setRun] = useState<RemakeSnapshot | null>(null);
  const [progress, setProgress] = useState<MetaProgress>(EMPTY_PROGRESS);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [message, setMessage] = useState("");
  const [autoPlay, setAutoPlay] = useState(false);
  const [clearArmed, setClearArmed] = useState(false);
  const [storyEndingId, setStoryEndingId] = useState<string | null>(null);
  const [storyPage, setStoryPage] = useState(0);
  const [loadedStoryImagePath, setLoadedStoryImagePath] = useState<string | null>(null);
  const [storyFromEncounter, setStoryFromEncounter] = useState(false);
  const [encounterWasCollected, setEncounterWasCollected] = useState(false);
  const [pendingSpecialEndingId, setPendingSpecialEndingId] = useState<string | null>(null);
  const [debugTalentIds, setDebugTalentIds] = useState<RemakeId[]>([]);
  const [debugEventId, setDebugEventId] = useState<RemakeId | null>(null);
  const [debugTalentQuery, setDebugTalentQuery] = useState("");
  const [debugEventQuery, setDebugEventQuery] = useState("");
  const sessionRef = useRef<RemakeSession | null>(null);
  const previewHandledRef = useRef(false);
  const standalonePreviewRef = useRef(false);
  const timelineEndRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const panelTriggerRef = useRef<HTMLButtonElement>(null);

  const engine = useMemo(() => {
    if (!data) return null;
    return createSiteEngine(data, progress);
  }, [data, progress]);

  const pointTotal = useMemo(
    () => preparedTalentIds.length && engine ? engine.getAllocationPoints(preparedTalentIds) : 20,
    [engine, preparedTalentIds],
  );
  const allocatedPoints = ALLOCATABLE_STATS.reduce((total, key) => total + allocation[key], 0);
  const pointsLeft = pointTotal - allocatedPoints;
  const unfinishedRun = Boolean(run && !run.ended && run.history.length > 0);
  const achievements = useMemo(() => data ? achievementEntries(data) : [], [data]);
  const discoveredTales = useMemo(() => discoveredWeirdTaleIds({
    eventIds: mergeUnique(progress.unlockedEventIds, run?.eventIds ?? []),
    talentIds: mergeUnique(progress.unlockedTalentIds, run?.talentIds ?? []),
  }), [progress.unlockedEventIds, progress.unlockedTalentIds, run?.eventIds, run?.talentIds]);
  const timeline = useMemo(
    () => run ? timelineFromSnapshot(run, discoveredTales) : [],
    [discoveredTales, run],
  );
  const perfectEndingReached = Boolean(run?.eventIds.some((id) => toId(id) === PERFECT_CULTIVATION_EVENT_ID));
  const trueEndingReached = progress.achievementIds.includes(TRUE_ENDING_ACHIEVEMENT_ID);
  const truthRunActive = Boolean(run && isTruthRun(run.talentIds));
  const activeStoryRecord = useMemo(
    () => findSpecialEndingStory(storyEndingId),
    [storyEndingId],
  );
  const activeStory = activeStoryRecord?.story ?? null;
  const activeStoryPage = activeStory?.pages[storyPage] ?? null;
  const storyImageLoaded = Boolean(activeStoryPage && loadedStoryImagePath === activeStoryPage.image);
  const activeStoryIsTruthEnding = Boolean(
    activeStory?.id === UNLOADED_HOMETOWN_ID && truthRunActive && storyFromEncounter,
  );
  const pendingSpecialEnding = useMemo(
    () => SPECIAL_ENDINGS.find(({ id }) => id === pendingSpecialEndingId) ?? null,
    [pendingSpecialEndingId],
  );
  const encounterEnding = pendingSpecialEnding ?? UNLOADED_HOMETOWN;
  const visibleTalentDraw = useMemo(() => {
    const maleLeadSelected = progress.truthRunArmed || requiresMaleLead(selectedTalentIds);
    if (maleLeadSelected) {
      return draw.filter(({ id }) => !MALE_INCOMPATIBLE_TALENT_IDS.has(toId(id)));
    }
    const incompatibleSelected = selectedTalentIds.some((id) => MALE_INCOMPATIBLE_TALENT_IDS.has(toId(id)));
    if (incompatibleSelected) {
      return draw.filter(({ id }) => !MALE_REQUIRED_TALENT_IDS.has(toId(id)));
    }
    return draw;
  }, [draw, progress.truthRunArmed, selectedTalentIds]);
  const debugTalents = useMemo(() => {
    if (!data) return [];
    const query = debugTalentQuery.trim().toLocaleLowerCase("zh-CN");
    return Object.entries(data.talents)
      .filter(([id, talent]) => !query || id.includes(query) || talent.name.toLocaleLowerCase("zh-CN").includes(query))
      .sort(([, left], [, right]) => numberValue(right.grade) - numberValue(left.grade));
  }, [data, debugTalentQuery]);
  const debugEvents = useMemo(() => {
    if (!data) return [];
    const query = debugEventQuery.trim().toLocaleLowerCase("zh-CN");
    return Object.entries(data.events)
      .filter(([id, event]) => numberValue(event.grade) === 3 || hasSpecialEndingSource([id]))
      .filter(([id, event]) => !query || id.includes(query) || event.event.toLocaleLowerCase("zh-CN").includes(query))
      .sort(([leftId], [rightId]) => Number(leftId) - Number(rightId));
  }, [data, debugEventQuery]);
  const debugEventAge = useMemo(
    () => data && debugEventId ? naturalAgeForEvent(data, debugEventId) : 0,
    [data, debugEventId],
  );
  const debugSpecialEnding = useMemo(
    () => debugEventId ? findSpecialEndingBySource([debugEventId]) : null,
    [debugEventId],
  );
  const debugRequiresMaleLead = debugEventId === UNLOADED_HOMETOWN_EVENT_ID
    || Boolean(debugSpecialEnding?.requiredTalentId && MALE_REQUIRED_TALENT_IDS.has(toId(debugSpecialEnding.requiredTalentId)));
  const visibleDebugTalents = useMemo(
    () => debugRequiresMaleLead
      ? debugTalents.filter(([id]) => !MALE_INCOMPATIBLE_TALENT_IDS.has(toId(id)))
      : debugTalents,
    [debugRequiresMaleLead, debugTalents],
  );
  const debugEventAgeLabel = !debugEventId
    ? "不强制事件"
    : debugEventId === UNLOADED_HOMETOWN_EVENT_ID
    ? `${UNLOADED_HOMETOWN_MIN_AGE}—${UNLOADED_HOMETOWN_MAX_AGE} 岁随机事件`
    : debugSpecialEnding?.triggerAge !== undefined
    ? `${debugSpecialEnding.triggerAge} 岁必触发事件`
    : debugSpecialEnding?.triggerAgeRange
    ? `${debugSpecialEnding.triggerAgeRange[0]}—${debugSpecialEnding.triggerAgeRange[1]} 岁必触发事件`
    : `${debugEventAge} 岁事件`;

  useEffect(() => {
    let cancelled = false;
    loadOriginalData()
      .then((loadedData) => {
        if (cancelled) return;
        let restored: StoredGame | null = null;
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          restored = raw ? restoreStoredGame(JSON.parse(raw) as unknown, loadedData, devtoolsEnabled) : null;
        } catch {
          restored = null;
        }

        if (restored) {
          const restoredEngine = createSiteEngine(loadedData, restored.progress);
          const restoredDraw = restored.drawIds
            .map((id) => restoredEngine.getTalent(id))
            .filter((talent): talent is RemakeTalentCard => Boolean(talent));
          const restoredRedTalentIds = restoredDraw
            .filter(({ id }) => RED_TALENT_IDS.has(toId(id)))
            .map(({ id }) => toId(id));
          const shouldRefreshLegacyDraw = restored.stage === "talents"
            && (restoredDraw.length !== TALENT_DRAW_COUNT || restoredRedTalentIds.length > 1);
          setStage(restored.stage);
          setDraw(shouldRefreshLegacyDraw
            ? drawLifeTalentCards(
              restoredEngine,
              restored.progress.inheritedTalentId,
              restoredRedTalentIds[0] ?? (
                restored.progress.inheritedTalentId !== null
                && RED_TALENT_IDS.has(toId(restored.progress.inheritedTalentId))
                  ? toId(restored.progress.inheritedTalentId)
                  : null
              ),
              restored.progress.truthRunArmed,
            )
            : restoredDraw);
          setTalentRefreshesUsed(shouldRefreshLegacyDraw ? 0 : restored.talentRefreshesUsed);
          setSelectedTalentIds(shouldRefreshLegacyDraw ? [] : restored.selectedTalentIds);
          setPreparedTalentIds(restored.preparedTalentIds);
          setCharacterDrawIds(restored.characterDrawIds);
          setAllocation(restored.allocation);
          setRun(restored.run);
          setProgress(restored.progress);
          setPendingSpecialEndingId(restored.pendingSpecialEndingId);
          if (restored.run) sessionRef.current = restoredEngine.restore(restored.run);
        } else if (window.localStorage.getItem(LEGACY_STORAGE_KEY)) {
          setMessage("已经换成原版事件库；之前的试玩存档仍单独留在浏览器里，没有被覆盖。");
        }
        setData(loadedData);
        setHydrated(true);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
        setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [devtoolsEnabled, loadAttempt]);

  useEffect(() => {
    if (!hydrated || !data || previewHandledRef.current) return;
    previewHandledRef.current = true;
    const preview = new URLSearchParams(window.location.search).get("preview");
    if (devtoolsEnabled && preview === "perfect-ending") {
      standalonePreviewRef.current = true;
      const timer = window.setTimeout(() => {
        setMessage("");
        setRun((current) => ({
          ...(current ?? perfectEndingPreviewSnapshot()),
          ended: true,
          eventIds: mergeUnique(current?.eventIds ?? [], [PERFECT_CULTIVATION_EVENT_ID]),
        }));
        setStage("summary");
      }, 0);
      return () => window.clearTimeout(timer);
    }
    if (devtoolsEnabled && (preview === "pill-choice" || preview === "true-ending")) {
      standalonePreviewRef.current = true;
      const timer = window.setTimeout(() => {
        setMessage("");
        setStage(preview);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    const previewRecord = findSpecialEndingStory(preview);
    if (!previewRecord) return;
    const { story: previewEnding, parent: previewParent, isMirror } = previewRecord;
    standalonePreviewRef.current = true;
    const wasCollected = progress.specialEndingIds.includes(previewParent.id);
    const timer = window.setTimeout(() => {
      setEncounterWasCollected(wasCollected);
      setProgress((current) => ({
        ...current,
        specialEndingIds: mergeUnique(current.specialEndingIds, [previewParent.id]),
      }));
      if (isMirror) {
        setStage("home");
        setStoryPage(0);
        setStoryEndingId(previewEnding.id);
        setStoryFromEncounter(false);
        return;
      }
      setStage("special-ending");
      setPendingSpecialEndingId(previewEnding.id);
      setStoryPage(0);
      setStoryEndingId(null);
      setStoryFromEncounter(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [data, devtoolsEnabled, hydrated, progress.specialEndingIds]);

  useEffect(() => {
    if (!activeStory) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleStoryKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape" && (!storyFromEncounter || activeStory.entryMode === "optional")) {
        setStoryEndingId(null);
      }
      if (event.key === "ArrowLeft") setStoryPage((page) => Math.max(0, page - 1));
      if (event.key === "ArrowRight") setStoryPage((page) => Math.min(activeStory.pages.length - 1, page + 1));
    };
    document.addEventListener("keydown", handleStoryKeyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleStoryKeyboard);
    };
  }, [activeStory, storyFromEncounter]);

  useEffect(() => {
    if (!activeStory) return;
    const useMobileImages = window.matchMedia("(max-width: 720px)").matches;
    activeStory.pages.slice(storyPage + 1, storyPage + 3).forEach((page) => {
      const image = new Image();
      image.decoding = "async";
      image.src = useMobileImages ? mobileStoryImagePath(page.image) : page.image;
    });
  }, [activeStory, storyPage]);

  useEffect(() => {
    if (!hydrated || !data) return;
    const payload: StoredGame = {
      version: 2,
      stage,
      drawIds: draw.map(({ id }) => id),
      talentRefreshesUsed,
      selectedTalentIds,
      preparedTalentIds,
      characterDrawIds,
      allocation,
      run,
      progress,
      pendingSpecialEndingId,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [allocation, characterDrawIds, data, draw, hydrated, pendingSpecialEndingId, preparedTalentIds, progress, run, selectedTalentIds, stage, talentRefreshesUsed]);

  const revealSpecialEnding = useCallback((snapshot: RemakeSnapshot, ending: SpecialEnding) => {
    if (!data) return;
    setEncounterWasCollected(progress.specialEndingIds.includes(ending.id));
    setAutoPlay(false);
    setRun(snapshot);
    setProgress((current) => {
      const recorded = progressAfter(current, snapshot, data, ["TRAJECTORY", "SUMMARY"]);
      return {
        ...recorded,
        specialEndingIds: mergeUnique(recorded.specialEndingIds, [ending.id]),
      };
    });
    setMessage("这一年的记录在这里停住了。下面还有一页，不属于原来的人生。");
    setStage("running");
    setPendingSpecialEndingId(ending.id);
    setStoryPage(0);
    setStoryEndingId(null);
    setStoryFromEncounter(false);
  }, [data, progress.specialEndingIds]);

  const openSpecialEnding = (ending: SpecialEnding, fromEncounter = false) => {
    setStoryPage(0);
    setStoryFromEncounter(fromEncounter);
    setStoryEndingId(ending.id);
  };

  const openMirrorChapter = (ending: SpecialEnding) => {
    if (!ending.mirrorChapter) return;
    setStoryPage(0);
    setStoryEndingId(ending.mirrorChapter.id);
  };

  const enterPendingSpecialEncounter = () => {
    if (!pendingSpecialEnding) return;
    setStoryEndingId(null);
    setStoryFromEncounter(false);
    setStage("special-ending");
  };

  const skipPendingSpecialEncounter = () => {
    if (!pendingSpecialEnding) return;
    setPendingSpecialEndingId(null);
    if (pendingSpecialEnding.outcome === "end-life") {
      completeSpecialEnding(pendingSpecialEnding);
    } else {
      setStage("running");
      setMessage("你没有翻开那一页。异闻已经收录，人生仍从这里继续。");
    }
  };

  const leaveSpecialEncounter = (ending?: SpecialEnding) => {
    setStoryEndingId(null);
    setStoryFromEncounter(false);
    if (standalonePreviewRef.current && ending?.outcome === "resume") {
      setPendingSpecialEndingId(ending.id);
      setStage("special-ending");
      setMessage("当前是独立预览。正式人生中读完这一页后，会从触发年份继续。 ");
      return;
    }
    setPendingSpecialEndingId(null);
    setStage(run ? run.ended ? "summary" : "running" : "home");
    setMessage(run
      ? run.ended
        ? "这段异闻已经收录。此前的人生已经走完，可以查看总结。"
        : ending?.resumeMessage ?? "这段异闻已经收录。人生仍从刚才那一页继续。"
      : "这段异闻已经收录，可以从异闻录再次查看。");
  };

  const completeSpecialEnding = (ending: SpecialEnding) => {
    setStoryEndingId(null);
    setStoryFromEncounter(false);
    setPendingSpecialEndingId(null);
    if (data && run) {
      setProgress((current) => progressAfter({
        ...current,
        runs: current.runs + 1,
        totalYears: current.totalYears + completedLifeYears(run),
        inheritedTalentId: null,
        specialEndingIds: mergeUnique(current.specialEndingIds, [ending.id]),
      }, run, data, ["END"]));
    }
    setRun(null);
    setPendingSpecialEndingId(null);
    sessionRef.current = null;
    setDraw([]);
    setTalentRefreshesUsed(0);
    setSelectedTalentIds([]);
    setPreparedTalentIds([]);
    setStage("home");
    setMessage(`“${ending.title}”已经收录进异闻录。下一段人生仍会从头开始。`);
  };

  const completeTrueEnding = () => {
    setStoryEndingId(null);
    setStoryFromEncounter(false);
    setPendingSpecialEndingId(null);
    if (data && run) {
      setProgress((current) => {
        const recorded = progressAfter({
          ...current,
          runs: current.runs + 1,
          totalYears: current.totalYears + completedLifeYears(run),
          inheritedTalentId: null,
          truthChoiceAvailable: false,
          truthRunArmed: false,
          specialEndingIds: mergeUnique(current.specialEndingIds, [UNLOADED_HOMETOWN_ID]),
        }, run, data, ["END"]);
        return {
          ...recorded,
          achievementIds: mergeUnique(recorded.achievementIds, [
            FIRST_SPECIAL_ACHIEVEMENT_ID,
            TRUE_ENDING_ACHIEVEMENT_ID,
          ]),
        };
      });
    }
    setRun(null);
    sessionRef.current = null;
    setDraw([]);
    setTalentRefreshesUsed(0);
    setSelectedTalentIds([]);
    setPreparedTalentIds([]);
    setMessage("");
    setStage("true-ending");
  };

  const finishActiveStory = () => {
    if (!activeStory || !storyFromEncounter) {
      setStoryEndingId(null);
      setStoryFromEncounter(false);
      return;
    }
    if (activeStoryIsTruthEnding) {
      completeTrueEnding();
      return;
    }
    setProgress((current) => ({
      ...current,
      achievementIds: mergeUnique(current.achievementIds, [FIRST_SPECIAL_ACHIEVEMENT_ID]),
    }));
    if (activeStory.outcome === "end-life") {
      completeSpecialEnding(activeStory);
    } else {
      leaveSpecialEncounter(activeStory);
    }
  };

  const advanceLife = useCallback(() => {
    if (!data || !sessionRef.current) return;
    try {
      const result = sessionRef.current.next();
      const snapshot = sessionRef.current.snapshot();
      setRun(snapshot);
      setPendingSpecialEndingId(null);
      const encounteredEnding = findSpecialEndingBySource(result.content.map(({ id }) => id));
      if (encounteredEnding) {
        revealSpecialEnding(snapshot, encounteredEnding);
        return;
      }
      if (result.isEnd) {
        setAutoPlay(false);
        setProgress((current) => progressAfter(current, snapshot, data, ["TRAJECTORY", "SUMMARY"]));
        if (result.content.some(({ id }) => toId(id) === PERFECT_CULTIVATION_EVENT_ID)) {
          setMessage("漫长的修行终于写完。你抵达了完美结局。小盒子里，还留着一个没有解释的圆形空位。");
        }
        setStage("summary");
      }
    } catch {
      setAutoPlay(false);
      setMessage("这段人生遇到了一页无法读取的原始数据，存档仍然保留，可以重新开始。");
    }
  }, [data, revealSpecialEnding]);

  useEffect(() => {
    if (!autoPlay || stage !== "running" || run?.ended) return;
    const timer = window.setInterval(advanceLife, 520);
    return () => window.clearInterval(timer);
  }, [advanceLife, autoPlay, run?.ended, stage]);

  useEffect(() => {
    if (stage === "running") {
      timelineEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [run?.history.length, stage]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setAutoPlay(false);
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  useEffect(() => {
    if (!panel) return;
    const focusTimer = window.setTimeout(() => modalCloseRef.current?.focus(), 0);
    const handleModalKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setClearArmed(false);
        setPanel(null);
        window.setTimeout(() => panelTriggerRef.current?.focus(), 0);
        return;
      }
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleModalKeyboard);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleModalKeyboard);
    };
  }, [panel]);

  const drawClassicTalentCards = (lifeRedTalentId: RemakeId | null) => {
    if (!engine) return [];
    return drawLifeTalentCards(
      engine,
      progress.inheritedTalentId,
      lifeRedTalentId,
      progress.truthRunArmed,
    );
  };

  const beginClassic = () => {
    if (!engine || !data) return;
    const lifeRedTalentId = progress.truthRunArmed
      ? null
      : chooseLifeRedTalent(data, engine, progress.inheritedTalentId);
    const cards = drawClassicTalentCards(lifeRedTalentId);
    setDraw(cards);
    setTalentRefreshesUsed(0);
    setSelectedTalentIds([]);
    setPreparedTalentIds([]);
    setAllocation(DEFAULT_ALLOCATION);
    setRun(null);
    sessionRef.current = null;
    setMessage(progress.inheritedTalentId && cards.some(({ id }) => toId(id) === toId(progress.inheritedTalentId))
      ? "上一段人生留下的天赋，已经放在第一张；这一轮还可以刷新三次。"
      : "从三十张天赋里选三张，这一轮还可以刷新三次。");
    setStage("talents");
  };

  const openDebugTools = () => {
    if (!devtoolsEnabled || !data) return;
    setAutoPlay(false);
    setDebugTalentIds([]);
    setDebugEventId(null);
    setDebugTalentQuery("");
    setDebugEventQuery("");
    setMessage("调试开局不会改变普通模式的抽卡规则。可以只测试天赋，也可以另外指定一个强制事件。");
    setStage("debug");
  };

  const toggleDebugTalent = (id: RemakeId) => {
    setDebugTalentIds((current) => current.includes(id)
      ? current.filter((talentId) => talentId !== id)
      : [...current, id]);
  };

  const chooseDebugEvent = (id: RemakeId) => {
    const ending = findSpecialEndingBySource([id]);
    const maleLead = toId(id) === UNLOADED_HOMETOWN_EVENT_ID
      || Boolean(ending?.requiredTalentId && MALE_REQUIRED_TALENT_IDS.has(toId(ending.requiredTalentId)));
    setDebugEventId(id);
    if (maleLead) setDebugTalentIds((current) => withoutMaleIncompatibleTalents(current));
  };

  const startDebugRun = () => {
    if (!devtoolsEnabled || !data) return;
    try {
      const nextEngine = createSiteEngine(data, progress);
      const requiredTalentId = debugEventId === UNLOADED_HOMETOWN_EVENT_ID
        ? RED_PILL_TALENT_ID
        : debugSpecialEnding?.requiredTalentId;
      const debugRunTalentIds = requiredTalentId
        ? [
            requiredTalentId,
            ...debugTalentIds.filter((id) => (
              String(id) !== String(requiredTalentId)
              && !nextEngine.findTalentConflict([requiredTalentId], id)
            )),
          ]
        : debugTalentIds;
      const targetAge = !debugEventId
        ? null
        : debugEventId === UNLOADED_HOMETOWN_EVENT_ID
        ? randomUnloadedHometownAge()
        : debugSpecialEnding
        ? specialEndingTriggerAge(debugSpecialEnding)
        : debugEventAge;
      const scheduled = scheduledSpecialEvents(debugRunTalentIds);
      const forcedEvents = [
        ...scheduled,
        ...(debugEventId && targetAge !== null ? [{ id: debugEventId, age: targetAge }] : []),
      ]
        .filter((entry, index, entries) => entries.findIndex(({ id }) => id === entry.id) === index)
        .sort((left, right) => left.age - right.age);
      const session = nextEngine.start({
        talentIds: debugRunTalentIds,
        allocation: { CHR: 10, INT: 10, STR: 10, MNY: 10 },
        presetAllocation: true,
        forcedEventIds: forcedEvents.map(({ id }) => id),
        forcedEventAges: forcedEvents.map(({ age }) => age),
      });
      const snapshot = session.snapshot();
      sessionRef.current = session;
      setPreparedTalentIds([...debugRunTalentIds]);
      setRun(snapshot);
      setPendingSpecialEndingId(null);
      setAutoPlay(false);
      setProgress((current) => progressAfter(current, snapshot, data, ["START"]));
      setMessage(debugEventId && targetAge !== null
        ? `调试人生已从 0 岁开始，并装载 ${debugRunTalentIds.length} 个天赋；事件 ${debugEventId} 已预约在 ${targetAge} 岁。`
        : `调试人生已从 0 岁开始，并装载 ${debugRunTalentIds.length} 个天赋；没有强制指定特殊事件。`);
      setStage("running");
    } catch (error) {
      setMessage(error instanceof Error ? `调试开局失败：${error.message}` : "调试开局失败，请重新选择。");
    }
  };

  const refreshTalents = () => {
    if (!engine || talentRefreshesUsed >= MAX_TALENT_REFRESHES) return;
    const nextUsed = talentRefreshesUsed + 1;
    const lifeRedTalentId = draw.find(({ id }) => RED_TALENT_IDS.has(toId(id)))?.id ?? null;
    setDraw(drawClassicTalentCards(lifeRedTalentId));
    setSelectedTalentIds([]);
    setPreparedTalentIds([]);
    setTalentRefreshesUsed(nextUsed);
    setMessage(nextUsed === MAX_TALENT_REFRESHES
      ? "这是最后一批天赋，已经没有刷新次数了。"
      : `新的一批天赋到了，还能刷新 ${MAX_TALENT_REFRESHES - nextUsed} 次。`);
  };

  const toggleTalent = (talent: RemakeTalentCard) => {
    if (!engine) return;
    setMessage("");
    if (selectedTalentIds.includes(talent.id)) {
      setSelectedTalentIds(selectedTalentIds.filter((id) => id !== talent.id));
      return;
    }
    if (selectedTalentIds.length >= 3) {
      setMessage("这一生只能带走三种天赋。");
      return;
    }
    const conflict = engine.findTalentConflict(selectedTalentIds, talent.id);
    if (conflict) {
      setMessage(`“${talent.name}”与“${engine.getTalent(conflict)?.name ?? conflict}”不能同时出现。`);
      return;
    }
    setSelectedTalentIds([...selectedTalentIds, talent.id]);
  };

  const prepareClassic = () => {
    if (!engine || selectedTalentIds.length !== 3) return;
    try {
      const prepared = engine.prepareTalents(selectedTalentIds);
      setPreparedTalentIds(prepared.talentIds);
      setAllocation(balancedAllocation(prepared.allocationPoints));
      setMessage(prepared.replacements.map(({ source, target }) => `“${source.name}”转化为“${target.name}”。`).join(" "));
      setStage("allocate");
    } catch {
      setMessage("这组三张天赋无法同时生效，请重新选择。");
    }
  };

  const openCharacters = () => {
    if (!data?.character) return;
    setCharacterDrawIds(randomSelection(Object.keys(data.character), 3));
    setStage("characters");
  };

  const adjustAllocation = (key: keyof RemakeAllocation, amount: number) => {
    setAllocation((current) => {
      const next = current[key] + amount;
      if (next < 0 || next > 10) return current;
      if (amount > 0 && Object.values(current).reduce((sum, value) => sum + value, 0) >= pointTotal) return current;
      return { ...current, [key]: next };
    });
  };

  const randomAllocation = () => {
    const next: RemakeAllocation = { CHR: 0, INT: 0, STR: 0, MNY: 0 };
    let remaining = pointTotal;
    while (remaining > 0) {
      const available = ALLOCATABLE_STATS.filter((key) => next[key] < 10);
      if (!available.length) break;
      const key = available[Math.floor(Math.random() * available.length)];
      next[key] += 1;
      remaining -= 1;
    }
    setAllocation(next);
  };

  const startPreparedRun = (
    talentIds: readonly RemakeId[],
    initialAllocation: RemakeAllocation,
    presetAllocation = false,
    replacementMessage = message,
  ) => {
    if (!data) return;
    try {
      const nextEngine = createSiteEngine(data, progress);
      const truthRun = progress.truthRunArmed;
      const compatibleTalentIds = truthRun || requiresMaleLead(talentIds)
        ? withoutMaleIncompatibleTalents(talentIds)
        : [...talentIds];
      const runTalentIds = truthRun
        ? mergeUnique(
          compatibleTalentIds.filter((id) => !RED_TALENT_IDS.has(toId(id))),
          [RED_PILL_TALENT_ID],
        )
        : compatibleTalentIds;
      const scheduledEvents = scheduledSpecialEvents(runTalentIds);
      const session = nextEngine.start({
        talentIds: runTalentIds,
        allocation: initialAllocation,
        presetAllocation,
        forcedEventIds: scheduledEvents.map(({ id }) => id),
        forcedEventAges: scheduledEvents.map(({ age }) => age),
      });
      const snapshot = session.snapshot();
      sessionRef.current = session;
      setPreparedTalentIds(runTalentIds);
      setRun(snapshot);
      setPendingSpecialEndingId(null);
      setAutoPlay(false);
      setProgress((current) => progressAfter({
        ...current,
        truthRunArmed: false,
        truthChoiceAvailable: truthRun ? false : current.truthChoiceAvailable,
      }, snapshot, data, ["START"]));
      setMessage(truthRun
        ? "你吞下了红色药丸。人生仍从零岁开始；有些记忆，会晚一些回来。"
        : replacementMessage);
      setStage("running");
    } catch {
      setMessage("初始属性与天赋没有正确对应，请返回上一步重新分配。");
    }
  };

  const chooseCharacter = (character: RemakeCharacterRecord, characterId: string) => {
    if (!engine) return;
    try {
      const selected = (Array.isArray(character.talent) ? character.talent : [character.talent])
        .filter((id): id is string | number => id !== undefined && id !== null)
        .map(toId);
      const prepared = engine.prepareTalents(selected);
      const fixed: RemakeAllocation = {
        CHR: numberValue(character.property?.CHR),
        INT: numberValue(character.property?.INT),
        STR: numberValue(character.property?.STR),
        MNY: numberValue(character.property?.MNY),
      };
      setSelectedTalentIds(selected);
      const notices = prepared.replacements.map(({ source, target }) => `“${source.name}”转化为“${target.name}”。`).join(" ");
      startPreparedRun(prepared.talentIds, fixed, true, notices || `借用了“${character.name || characterId}”的开局。`);
    } catch {
      setMessage("这个预设人物的开局暂时无法读取，请换一个试试。");
    }
  };

  const finishLife = () => {
    if (!data || !sessionRef.current) return;
    setAutoPlay(false);
    try {
      const existingEventIds = new Set(sessionRef.current.snapshot().eventIds.map(toId));
      const result = sessionRef.current.runToEnd(2_000);
      const encounteredEnding = findSpecialEndingBySource(
        result.snapshot.eventIds.filter((id) => !existingEventIds.has(toId(id))),
      );
      if (encounteredEnding) {
        revealSpecialEnding(result.snapshot, encounteredEnding);
        return;
      }
      setRun(result.snapshot);
      setProgress((current) => progressAfter(current, result.snapshot, data, ["TRAJECTORY", "SUMMARY"]));
      setStage("summary");
    } catch {
      setMessage("这一条特殊路线还没有在安全步数内结束，已为你停在当前页。");
      setRun(sessionRef.current.snapshot());
    }
  };

  const inheritAndRestart = (talentId: RemakeId | null) => {
    if (!data || !run) return;
    const offerTruthChoice = shouldOfferTruthChoice(
      perfectEndingReached,
      progress.truthChoiceAvailable,
      trueEndingReached,
    );
    setProgress((current) => {
      const advanced = {
        ...current,
        runs: current.runs + 1,
        totalYears: current.totalYears + completedLifeYears(run),
        inheritedTalentId: talentId,
        truthChoiceAvailable: offerTruthChoice,
        truthRunArmed: false,
      };
      return progressAfter(advanced, run, data, ["END"]);
    });
    setRun(null);
    setPendingSpecialEndingId(null);
    sessionRef.current = null;
    setDraw([]);
    setTalentRefreshesUsed(0);
    setSelectedTalentIds([]);
    setPreparedTalentIds([]);
    setStage(offerTruthChoice ? "pill-choice" : "home");
    const talent = talentId ? engine?.getTalent(talentId) : null;
    setMessage(offerTruthChoice
      ? "小盒子已经消失。你闭上眼时，掌心却多了两枚药丸。"
      : talent ? `“${talent.name}”会跟你去下一段人生。` : "没有继承也没关系，下一段人生仍会开始。");
  };

  const chooseRedPill = () => {
    setProgress((current) => ({
      ...current,
      truthChoiceAvailable: false,
      truthRunArmed: true,
    }));
    setMessage("你选择了红色药丸。下一段人生仍将从零岁开始。 ");
    setStage("mode");
  };

  const chooseBluePill = () => {
    setProgress((current) => ({ ...current, truthRunArmed: false }));
    setMessage("你选择暂时忘记。那枚红色药丸仍留在盒底，之后还可以回来。 ");
    setStage("home");
  };

  const exportSave = () => {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? "{}";
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `人生重开存档-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("存档已经导出。它只包含游戏进度，不包含任何账号信息。");
  };

  const importSave = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !data) return;
    try {
      const restored = restoreStoredGame(JSON.parse(await file.text()) as unknown, data, devtoolsEnabled);
      if (!restored) throw new Error("invalid save");
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
      window.location.reload();
    } catch {
      setMessage("这个文件不是可用的原版事件库存档，没有覆盖现在的记录。");
    }
  };

  const clearSave = () => {
    if (!clearArmed) {
      setClearArmed(true);
      setMessage("再按一次“确认清空”，才会真正删除这台设备上的游戏记录。");
      return;
    }
    window.localStorage.removeItem(STORAGE_KEY);
    sessionRef.current = null;
    setProgress(EMPTY_PROGRESS);
    setRun(null);
    setPendingSpecialEndingId(null);
    setDraw([]);
    setTalentRefreshesUsed(0);
    setSelectedTalentIds([]);
    setPreparedTalentIds([]);
    setCharacterDrawIds([]);
    setAllocation(DEFAULT_ALLOCATION);
    setPanel(null);
    setStage("home");
    setClearArmed(false);
    setMessage("这份记录已经清空，可以从第一页重新开始。");
  };

  const openPanel = (nextPanel: Panel, trigger: HTMLButtonElement) => {
    panelTriggerRef.current = trigger;
    setClearArmed(false);
    setPanel(nextPanel);
  };

  const closePanel = () => {
    const trigger = panelTriggerRef.current;
    setClearArmed(false);
    setPanel(null);
    window.setTimeout(() => trigger?.focus(), 0);
  };

  if (!data || !hydrated) {
    return (
      <section className={styles.homeCard} aria-labelledby="life-loading-title">
        <span className={styles.homeStar} aria-hidden="true">✦</span>
        <p>原版中文事件库</p>
        <h1 id="life-loading-title">要不要，再写一次人生？</h1>
        <span>{loadError ? "事件库没有打开，请再试一次。" : "正在翻开 1719 条人生经历……"}</span>
        {loadError && (
          <button className={styles.primaryButton} type="button" onClick={() => {
            setLoadError(false);
            setHydrated(false);
            setLoadAttempt((value) => value + 1);
          }}>
            重新读取
          </button>
        )}
      </section>
    );
  }

  return (
    <div className={styles.gameShell} data-stage={stage} data-original-events={Object.keys(data.events).length}>
      <div className={styles.topline}>
        <div>
          <span>第 {progress.runs + 1} 次重开</span>
          <i aria-hidden="true" />
          <span>最长 {Math.floor(progress.maxAge)} 岁</span>
        </div>
        <nav aria-label="游戏记录">
          <button type="button" onClick={(event) => openPanel("tales", event.currentTarget)}>
            异闻{discoveredTales.size + progress.specialEndingIds.length
              ? ` · ${discoveredTales.size + progress.specialEndingIds.length}`
              : ""}
          </button>
          <button type="button" onClick={(event) => openPanel("achievements", event.currentTarget)}>成就</button>
          <button type="button" onClick={(event) => openPanel("archive", event.currentTarget)}>图鉴</button>
          <button type="button" onClick={(event) => openPanel("save", event.currentTarget)}>存档</button>
          {devtoolsEnabled && (
            <button className={styles.debugNavButton} type="button" onClick={openDebugTools}>调试</button>
          )}
        </nav>
      </div>

      {message && <p className={styles.message} role="status">{message}</p>}

      {stage === "home" && (
        <section className={styles.homeCard} aria-labelledby="life-home-title">
          <span className={styles.homeStar} aria-hidden="true">✦</span>
          <p>1719 条人生经历</p>
          <h1 id="life-home-title">要不要，再写一次人生？</h1>
          <span>从三十张增强天赋池里选三张，分配最初的二十点，然后看看这一页会走到哪里。</span>
          <p className={styles.reincarnationHint}>
            每次重来，都会留下些东西。有些内容，要多走几段人生才会出现。
            <span>下一次轮回里，藏着的东西也许比你想象得更多。等零散的痕迹彼此对上，你看到的，或许会是这个世界原本的样子。</span>
          </p>
          <div className={styles.primaryActions}>
            {progress.truthChoiceAvailable && !trueEndingReached && (
              <button className={styles.truthButton} type="button" onClick={() => setStage("pill-choice")}>
                回到盒底留下的选择
              </button>
            )}
            {unfinishedRun && (
              <button className={styles.primaryButton} type="button" onClick={() => setStage("running")}>
                继续这一段人生
              </button>
            )}
            <button className={unfinishedRun ? styles.secondaryButton : styles.primaryButton} type="button" onClick={() => setStage("mode")}>
              开始新人生
            </button>
          </div>
          <p className={styles.localNote}>进度只保存在当前浏览器，不会上传到任何地方。</p>
        </section>
      )}

      {stage === "pill-choice" && (
        <section className={styles.pillChoiceCard} aria-labelledby="pill-choice-title">
          <div className={styles.pillChoiceCopy}>
            <p>飞升以后 · 盒底之物</p>
            <h1 id="pill-choice-title">盒底留下的选择</h1>
            <span>
              修行的最后，小盒子底部曾有一个圆形空位。现在，两枚药丸安静地躺在那里。
              它们没有属性，也不解释来历。
            </span>
          </div>
          <div className={styles.pillChoices}>
            <button type="button" data-pill="red" onClick={chooseRedPill}>
              <i aria-hidden="true" />
              <strong>红色药丸</strong>
              <small>不再回避那些不连贯的地方。下一段人生仍会从零岁开始。</small>
            </button>
            <button type="button" data-pill="blue" onClick={chooseBluePill}>
              <i aria-hidden="true" />
              <strong>蓝色药丸</strong>
              <small>暂时把一切当作一场梦。红色的那枚仍会留在这里。</small>
            </button>
          </div>
        </section>
      )}

      {stage === "true-ending" && (
        <section className={styles.trueEndingCard} aria-labelledby="true-ending-title">
          <span className={styles.trueEndingDawn} aria-hidden="true" />
          <div className={styles.trueEndingContent}>
            <p className={styles.trueEndingKicker}>窗外已经亮了</p>
            <h1 id="true-ending-title">你醒了</h1>
            <p className={styles.trueEndingReached}>游戏已达成 · 真结局</p>
            <div className={styles.trueEndingBody}>
              <p>
                消毒水的气味先回来，随后是窗外的车声。父亲在床边睡着了，手里还攥着那副没来得及拆封的眼镜。
              </p>
              <p>
                五百年的修行、海雾后的旧船、沙下的城和那条没有尽头的灰白道路，都没有留下可以证明的东西。
                你摊开手，掌心里什么也没有。
              </p>
              <blockquote>
                “{TRUE_ENDING_QUOTE}”
                <cite>——{TRUE_ENDING_ATTRIBUTION}</cite>
              </blockquote>
              <div className={styles.trueEndingNote}>
                {TRUE_ENDING_REFLECTION.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
            <button className={styles.trueEndingExit} type="button" onClick={() => {
              setMessage("故事已经结束。日子仍会继续。 ");
              setStage("home");
            }}>
              合上这一页 <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      )}

      {stage === "mode" && (
        <section className={styles.stepCard} aria-labelledby="mode-title">
          <StepHeading step="01" title="从哪一种可能开始" id="mode-title" />
          <div className={styles.modeGrid}>
            <button type="button" onClick={beginClassic}>
              <span aria-hidden="true">◎</span>
              <strong>自由重开</strong>
              <small>三十张里选三张，可刷新三次，再分配初始属性</small>
            </button>
            <button type="button" onClick={openCharacters}>
              <span aria-hidden="true">◇</span>
              <strong>名人开局</strong>
              <small>从原版一百位预设人物中随机出现三位</small>
            </button>
          </div>
          <BackButton onClick={() => setStage("home")} />
        </section>
      )}

      {stage === "characters" && (
        <section className={styles.stepCard} aria-labelledby="character-title">
          <StepHeading step="02" title="挑一个原版人物开局" id="character-title" />
          <div className={styles.characterGrid}>
            {characterDrawIds.map((id) => {
              const character = data.character?.[id];
              if (!character) return null;
              const talentIds = (Array.isArray(character.talent) ? character.talent : [character.talent])
                .filter((talentId): talentId is string | number => talentId !== undefined && talentId !== null)
                .map(toId);
              return (
                <button key={id} type="button" onClick={() => chooseCharacter(character, id)}>
                  <span>{character.name.slice(0, 1)}</span>
                  <strong>{character.name}</strong>
                  <small>
                    颜值 {numberValue(character.property?.CHR)} · 智力 {numberValue(character.property?.INT)} ·
                    体质 {numberValue(character.property?.STR)} · 家境 {numberValue(character.property?.MNY)}
                  </small>
                  <i>{talentIds.map((talentId) => engine?.getTalent(talentId)?.name).filter(Boolean).join(" · ")}</i>
                </button>
              );
            })}
          </div>
          <div className={styles.stepActions}>
            <BackButton onClick={() => setStage("mode")} />
            <button className={styles.textButton} type="button" onClick={openCharacters}>换三位</button>
          </div>
        </section>
      )}

      {devtoolsEnabled && stage === "debug" && (
        <section className={`${styles.stepCard} ${styles.debugCard}`} aria-labelledby="debug-title">
          <StepHeading
            step="DEV"
            title="开发人员调试台"
            id="debug-title"
            aside={`${debugTalentIds.length} 个天赋 · ${debugEventAgeLabel}`}
          />
          <p className={styles.debugWarning}>
            仅在本地开发环境显示。人生会从 0 岁按正常事件逐年开始；不选事件时只测试天赋，主动选择的事件才会保证触发。
          </p>

          <div className={styles.debugToolbar}>
            <label>
              <span>全天赋</span>
              <input
                type="search"
                value={debugTalentQuery}
                onChange={(event) => setDebugTalentQuery(event.target.value)}
                placeholder="按名称或 ID 搜索"
              />
            </label>
            <div>
              <button className={styles.secondaryButton} type="button" onClick={() => setDebugTalentIds(
                debugRequiresMaleLead
                  ? withoutMaleIncompatibleTalents(Object.keys(data.talents))
                  : Object.keys(data.talents),
              )}>
                选择全部 {Object.keys(data.talents).length} 个
              </button>
              <button className={styles.textButton} type="button" onClick={() => setDebugTalentIds([])}>清空</button>
            </div>
          </div>
          <div className={styles.debugTalentGrid} aria-label="完整天赋列表">
            {visibleDebugTalents.map(([id, talent]) => {
              const selected = debugTalentIds.includes(id);
              const appearance = talentMeta(id, Math.max(0, Math.min(3, numberValue(talent.grade))) as RemakeGrade);
              return (
                <button
                  key={id}
                  type="button"
                  data-selected={selected}
                  data-rarity={appearance.rarity}
                  aria-pressed={selected}
                  onClick={() => toggleDebugTalent(id)}
                >
                  <span>{appearance.label} · {id}</span>
                  <strong>{talent.name}</strong>
                </button>
              );
            })}
          </div>

          <div className={styles.debugToolbar}>
            <label>
              <span>传说及特殊事件</span>
              <input
                type="search"
                value={debugEventQuery}
                onChange={(event) => setDebugEventQuery(event.target.value)}
                placeholder="按事件文字或 ID 搜索"
              />
            </label>
            <small>选中事件会保留自然发生年龄，并绕过前置条件与随机概率；分支和属性效果仍按原版执行。</small>
          </div>
          <div className={styles.debugEventList} role="radiogroup" aria-label="强制触发事件">
            <button
              type="button"
              role="radio"
              aria-checked={debugEventId === null}
              data-selected={debugEventId === null}
              onClick={() => setDebugEventId(null)}
            >
              <span>—</span>
              <strong>不强制特殊事件</strong>
              <i>仅测试所选天赋</i>
            </button>
            {debugEvents.map(([id, event]) => {
              const specialEnding = findSpecialEndingBySource([id]);
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={debugEventId === id}
                  data-selected={debugEventId === id}
                  onClick={() => chooseDebugEvent(id)}
                >
                  <span>{id}</span>
                  <strong>{event.event}</strong>
                  {specialEnding && <i>{specialEnding.title}</i>}
                </button>
              );
            })}
          </div>

          <div className={styles.stepActions}>
            <BackButton onClick={() => setStage("home")} />
            <button className={styles.primaryButton} type="button" onClick={startDebugRun}>
              {debugEventId ? "以调试配置开始" : "仅以所选天赋开始"}
            </button>
          </div>
        </section>
      )}

      {stage === "talents" && (
        <section className={styles.stepCard} aria-labelledby="talent-title">
          <StepHeading step="02" title="从三十张天赋里带走三张" id="talent-title" aside={`已选 ${selectedTalentIds.length} / 3`} />
          <div className={styles.talentDrawBar}>
            <div>
              <strong>红色天赋规则</strong>
              <small>每段人生最多出现 1 种红色天赋 · 常规开局出现概率 75%</small>
            </div>
            <button
              className={styles.refreshButton}
              type="button"
              disabled={talentRefreshesUsed >= MAX_TALENT_REFRESHES}
              onClick={refreshTalents}
            >
              <span aria-hidden="true">↻</span>
              {talentRefreshesUsed >= MAX_TALENT_REFRESHES
                ? "已无刷新次数"
                : `换一批 · 剩余 ${MAX_TALENT_REFRESHES - talentRefreshesUsed} 次`}
            </button>
          </div>
          <div className={styles.talentGrid}>
            {visibleTalentDraw.map((talent) => {
              const selected = selectedTalentIds.includes(talent.id);
              const inherited = talent.id === progress.inheritedTalentId;
              const boostedRed = RED_TALENT_IDS.has(talent.id);
              const appearance = talentMeta(talent.id, talent.grade);
              return (
                <button
                  className={styles.rarityCard}
                  data-rarity={appearance.rarity}
                  data-selected={selected}
                  key={talent.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleTalent(talent)}
                >
                  <span>{appearance.label}{boostedRed ? " · 本世唯一" : ""}{inherited ? " · 上一世" : ""}</span>
                  <strong>{talent.name}</strong>
                  <small>{talent.description}</small>
                </button>
              );
            })}
          </div>
          <div className={styles.stepActions}>
            <BackButton onClick={() => setStage("mode")} />
            <button className={styles.primaryButton} disabled={selectedTalentIds.length !== 3} type="button" onClick={prepareClassic}>
              分配初始属性
            </button>
          </div>
        </section>
      )}

      {stage === "allocate" && (
        <section className={styles.stepCard} aria-labelledby="allocate-title">
          <StepHeading step="03" title="把点数放进这一生" id="allocate-title" aside={`剩余 ${pointsLeft}`} />
          <div className={styles.allocationGrid}>
            {ALLOCATABLE_STATS.map((key) => (
              <div key={key}>
                <span aria-hidden="true">{STAT_META[key].glyph}</span>
                <label>{STAT_META[key].label}</label>
                <button type="button" aria-label={`${STAT_META[key].label}减一`} onClick={() => adjustAllocation(key, -1)}>−</button>
                <output aria-label={`${STAT_META[key].label}当前点数`}>{allocation[key]}</output>
                <button type="button" aria-label={`${STAT_META[key].label}加一`} onClick={() => adjustAllocation(key, 1)}>＋</button>
              </div>
            ))}
          </div>
          <p className={styles.allocationHint}>每项最多 10 点；快乐从 5 开始，天赋附加点已按原版规则计入。</p>
          <div className={styles.stepActions}>
            <BackButton onClick={() => { setPreparedTalentIds([]); setStage("talents"); }} />
            <button className={styles.textButton} type="button" onClick={randomAllocation}>随机分配</button>
            <button className={styles.primaryButton} disabled={pointsLeft !== 0} type="button" onClick={() => startPreparedRun(preparedTalentIds, allocation)}>
              开始这一生
            </button>
          </div>
        </section>
      )}

      {stage === "running" && run && (
        <section className={styles.lifePage} aria-labelledby="trajectory-title">
          <div className={styles.lifeHeader}>
            <div>
              <p>原版事件正在发生</p>
              <h1 id="trajectory-title">{run.age < 0 ? "出生以前" : `${run.age} 岁`}</h1>
            </div>
            <div className={styles.liveStats}>
              {ALL_STATS.map((key) => (
                <span key={key} title={STAT_META[key].label} aria-label={`${STAT_META[key].label} ${run.stats[key]}`}>
                  <i aria-hidden="true">{STAT_META[key].glyph}</i>
                  {Number.isInteger(run.stats[key]) ? run.stats[key] : run.stats[key].toFixed(1)}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.timeline} aria-live={autoPlay ? "off" : "polite"}>
            {timeline.length === 0 && (
              <div className={styles.emptyTimeline}>
                <span aria-hidden="true">○</span>
                <p>按下“下一年”，第一条原版经历就会写在这里。</p>
              </div>
            )}
            {timeline.slice(-60).map(({ age, content, weirdTale }, index, entries) => {
              const appearance = weirdTale
                ? { label: "来源不明的旁注", rarity: "anomaly" }
                : content.type === "event" && isCultivationEventId(content.id)
                ? CULTIVATION_META
                : content.type === "talent"
                ? talentMeta(content.id, content.grade)
                : GRADE_META[content.grade];
              return (
                <article
                  className={styles.timelineEntry}
                  data-rarity={appearance.rarity}
                  data-weird-tale={Boolean(weirdTale)}
                  data-current={index === entries.length - 1}
                  key={`${age}-${content.type}-${content.id}-${index}`}
                >
                  <time>{age < 0 ? "初始" : age}{age >= 0 && <small>岁</small>}</time>
                  <div>
                    <span>
                      {weirdTale
                        ? `异闻旁注 · ${String(weirdTale.order).padStart(2, "0")}`
                        : content.type === "talent"
                        ? `天赋触发 · ${appearance.label}`
                        : `${appearance.label}${content.probability === undefined ? " · 分支" : ` · ${formatProbability(content.probability)}`}`}
                    </span>
                    <p>{content.name ? `【${content.name}】${content.description}` : content.description}</p>
                    {content.postEvent && <p>{content.postEvent}</p>}
                    {formatEffect(content.effect) && <small>{formatEffect(content.effect)}</small>}
                  </div>
                </article>
              );
            })}
            <div ref={timelineEndRef} />
          </div>

          {pendingSpecialEnding && (
            <aside className={styles.specialEncounterPrompt} aria-labelledby="special-encounter-title">
              <p>
                异闻已出现 · {encounterWasCollected ? "已收录" : "首次发现"}
              </p>
              <h2 id="special-encounter-title">这一年的记录，在这里断了一下。</h2>
              <span>
                后面还有一页。你可以现在翻开，也可以只把它留在异闻录里。
              </span>
              {pendingSpecialEnding.entryMode === "forced" && (
                <small>
                  {pendingSpecialEnding.outcome === "end-life"
                    ? "这段人生已经抵达结局；跳过只会略过观赏，不会改变已经发生的事。"
                    : "这段异闻已经发生；跳过只会略过观赏，人生仍会从这里继续。"}
                </small>
              )}
              <div>
                <button className={styles.primaryButton} type="button" onClick={enterPendingSpecialEncounter}>
                  进入异闻
                </button>
                <button className={styles.secondaryButton} type="button" onClick={skipPendingSpecialEncounter}>
                  跳过观赏
                </button>
              </div>
            </aside>
          )}

          <div className={styles.playControls}>
            <button className={styles.secondaryButton} disabled={Boolean(pendingSpecialEnding)} type="button" onClick={() => setAutoPlay((value) => !value)}>
              {autoPlay ? "暂停" : "自动走"}
            </button>
            <button className={styles.primaryButton} disabled={Boolean(pendingSpecialEnding)} type="button" onClick={advanceLife}>下一年</button>
            <button className={styles.textButton} disabled={Boolean(pendingSpecialEnding)} type="button" onClick={finishLife}>一键走完</button>
          </div>
        </section>
      )}

      {stage === "special-ending" && (
        <section
          className={styles.specialEndingCard}
          data-entry-mode={encounterEnding.entryMode}
          aria-labelledby="special-ending-title"
        >
          <div className={styles.specialEndingCover} aria-hidden="true">
            <picture>
              <source media="(max-width: 720px)" srcSet={mobileStoryImagePath(encounterEnding.pages[0].image)} />
              <img src={encounterEnding.pages[0].image} alt="" decoding="async" fetchPriority="high" />
            </picture>
          </div>
          <div className={styles.specialEndingCopy}>
            <p>
              {encounterEnding.entryMode === "forced" ? "无法回避的异闻" : "偶然出现的异闻"}
              {` · ${encounterWasCollected ? "已收录" : "首次发现"}`}
            </p>
            <h1 id="special-ending-title">{encounterEnding.triggerTitle}</h1>
            <span className={styles.specialEndingPremise}>{encounterEnding.triggerPremise}</span>
            <blockquote className={styles.specialEndingLead}>{encounterEnding.triggerLead}</blockquote>
            <small className={styles.specialEndingStatus}>
              {encounterWasCollected
                ? "这段记录已经存在于异闻录中；再次进入不会重复计数。"
                : "命运已经替你记下这一刻，完成阅读后可从异闻录再次查看。"}
            </small>
            <div>
              <button className={styles.primaryButton} type="button" onClick={() => openSpecialEnding(encounterEnding, true)}>
                {encounterEnding.entryLabel}
              </button>
              {encounterEnding.entryMode === "optional" && (
                <button className={styles.textButton} type="button" onClick={() => leaveSpecialEncounter(encounterEnding)}>
                  {encounterEnding.skipLabel ?? "暂时离开"}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {stage === "summary" && run && (
        <section
          className={styles.summaryCard}
          data-ending={perfectEndingReached ? "perfect" : "ordinary"}
          aria-labelledby="summary-title"
        >
          <p>{perfectEndingReached ? "月白仙章 · 完美结局" : "这一页写完了"}</p>
          <h1 id="summary-title">{perfectEndingReached ? "山河无恙，故人仍在" : `终年 ${run.age} 岁`}</h1>
          {perfectEndingReached ? (
            <div className={styles.perfectCelebration}>
              <span className={styles.perfectMoon} aria-hidden="true"><i /></span>
              <strong>游戏已达成 · 完美结局</strong>
              <p>
                恭喜你历经 <b>{progress.runs + 1}</b> 世轮回、共 <b>{progress.totalYears + completedLifeYears(run)}</b> 年，
                终于走完月白仙章。
              </p>
              <small>那个祖传的小盒子已经消失。奇怪的是，盒底最后留下的圆形空位，仍不知道原本应当放入什么……</small>
            </div>
          ) : (
            <span>本局经历、分支与结局均由原版中文事件库实际运行得出。</span>
          )}
          <div className={styles.summaryScore}>
            <strong>{scoreFromSnapshot(run)}</strong>
            <small>人生总评</small>
          </div>
          <div className={styles.summaryStats}>
            {ALL_STATS.map((key) => (
              <div key={key}>
                <span>{STAT_META[key].glyph}</span>
                <small>最高{STAT_META[key].label}</small>
                <strong>{run.highest[key]}</strong>
              </div>
            ))}
          </div>
          <div className={styles.inheritBox}>
            <p>选一个天赋，留给下一段人生</p>
            <div>
              {run.talentIds.filter((id) => toId(id) !== RED_PILL_TALENT_ID).map((id) => {
                const talent = engine?.getTalent(id);
                if (!talent) return null;
                const appearance = talentMeta(talent.id, talent.grade);
                return (
                  <button key={id} type="button" data-rarity={appearance.rarity} onClick={() => inheritAndRestart(id)}>
                    <strong>{talent.name}</strong>
                    <small>{talent.description}</small>
                  </button>
                );
              })}
            </div>
            <button className={styles.textButton} type="button" onClick={() => inheritAndRestart(null)}>什么也不继承</button>
          </div>
        </section>
      )}

      {panel && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) closePanel();
        }}>
          <section ref={modalRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="record-panel-title">
            <header>
              <div>
                <p>{panel === "tales" ? "重开以后，仍然能够彼此对上的记录" : "留在这台设备里的原版记录"}</p>
                <h2 id="record-panel-title">
                  {panel === "achievements" ? "成就" : panel === "archive" ? "人生图鉴" : panel === "tales" ? "异闻录" : "本地存档"}
                </h2>
              </div>
              <button ref={modalCloseRef} type="button" aria-label="关闭" onClick={closePanel}>×</button>
            </header>

            {panel === "achievements" && (
              <div className={styles.achievementGrid}>
                {achievements.map((achievement) => {
                  const unlocked = progress.achievementIds.includes(achievement.id);
                  const hidden = Boolean(numberValue(achievement.hide)) && !unlocked;
                  const appearance = achievementMeta(achievement.id, achievement.grade);
                  return (
                    <article key={achievement.id} data-unlocked={unlocked} data-rarity={appearance.rarity}>
                      <span aria-hidden="true">{unlocked ? appearance.glyph : "·"}</span>
                      <div>
                        <strong>{hidden ? "隐藏成就" : achievement.name}</strong>
                        <small>{hidden ? "达成后才会显露。" : achievement.description}</small>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {panel === "archive" && (
              <div className={styles.archivePanel}>
                <ProgressLine label="见过的天赋" value={progress.unlockedTalentIds.length} total={Object.keys(data.talents).length} />
                <ProgressLine label="发生过的经历" value={progress.unlockedEventIds.length} total={Object.keys(data.events).length} />
                <ProgressLine label="点亮的成就" value={progress.achievementIds.length} total={achievements.length} />
                <p>图鉴使用原版完整总数，只记录这台设备上真正遇见过的内容。</p>
              </div>
            )}

            {panel === "tales" && (
              <div className={styles.weirdTalePanel}>
                {SPECIAL_ENDINGS.map((ending) => {
                  const unlocked = progress.specialEndingIds.includes(ending.id);
                  return (
                    <section className={styles.specialEndingArchive} data-unlocked={unlocked} key={ending.id}>
                      {unlocked ? (
                        <>
                          <div className={styles.specialEndingArchiveCover}>
                            <picture>
                              <source media="(max-width: 720px)" srcSet={mobileStoryImagePath(ending.pages[0].image)} />
                              <img src={ending.pages[0].image} alt="" decoding="async" loading="lazy" />
                            </picture>
                          </div>
                          <div>
                            <p>{ending.kicker}</p>
                            <h3>{ending.title}</h3>
                            <span>{ending.summary}</span>
                            <button className={styles.secondaryButton} type="button" onClick={() => openSpecialEnding(ending)}>
                              再看一次 · {ending.pages.length}页
                            </button>
                            {ending.mirrorChapter && (
                              <button
                                className={styles.mirrorChapterButton}
                                type="button"
                                onClick={() => openMirrorChapter(ending)}
                              >
                                海雾另一侧 · {ending.mirrorChapter.pages.length}页
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div>
                          <p>尚未抵达的特殊结局</p>
                          <h3>■■■■■■</h3>
                          <span>当世界开始修正自身时，也许会出现一条不存在于事件库里的路。</span>
                        </div>
                      )}
                    </section>
                  );
                })}
                {WEIRD_TALE_LINES.map((line) => {
                  const discoveredCount = line.clues.filter((clue) => discoveredTales.has(clue.id)).length;
                  const discoveredClues = line.clues.filter((clue) => discoveredTales.has(clue.id));
                  const displayTitle = discoveredCount >= line.revealAfter
                    ? line.title
                    : discoveredCount > 0
                    ? line.partialTitle
                    : "未命名卷宗";
                  return (
                    <section key={line.id} aria-labelledby={`tale-line-${line.id}`}>
                      <header>
                        <div>
                          <p>{discoveredCount ? line.eyebrow : "尚未归档"}</p>
                          <h3 id={`tale-line-${line.id}`}>{displayTitle}</h3>
                        </div>
                        <strong>已收录 {discoveredCount} 则</strong>
                      </header>
                      <p>{line.introduction}</p>
                      {discoveredCount >= 4 && (
                        <div className={styles.taleMotifs} aria-label="反复出现的线索">
                          {line.recurringMotifs.map((motif) => <span key={motif}>{motif}</span>)}
                        </div>
                      )}
                      <ol className={styles.taleClueList}>
                        {discoveredClues.map((clue) => (
                          <li key={clue.id} data-discovered="true">
                            <span aria-hidden="true">{String(clue.order).padStart(2, "0")}</span>
                            <div>
                              <strong>{clue.title}</strong>
                              <small>{clue.body}</small>
                            </div>
                          </li>
                        ))}
                        {discoveredCount < line.clues.length && (
                          <li data-missing="true">
                            <span aria-hidden="true">?</span>
                            <div>
                              <strong>仍有缺页</strong>
                              <small>有些页码像是被刻意撕掉了，暂时无法判断还缺少什么。</small>
                            </div>
                          </li>
                        )}
                      </ol>
                      {discoveredCount === line.clues.length && (
                        <p className={styles.taleEnding}>{line.ending}</p>
                      )}
                    </section>
                  );
                })}
                <p className={styles.taleLocalNote}>
                  {discoveredTales.size + progress.specialEndingIds.length
                    ? `已收录 ${discoveredTales.size + progress.specialEndingIds.length} 则，仍有缺页`
                    : "尚未收录异闻"} · 线索只保存在这台设备
                </p>
              </div>
            )}

            {panel === "save" && (
              <div className={styles.savePanel}>
                <p>自动存档只在当前浏览器有效。换设备前，可以先导出一份 JSON 文件。</p>
                <div>
                  <button className={styles.secondaryButton} type="button" onClick={exportSave}>导出存档</button>
                  <button className={styles.secondaryButton} type="button" onClick={() => importInputRef.current?.click()}>导入存档</button>
                  <input ref={importInputRef} type="file" accept="application/json,.json" hidden onChange={importSave} />
                </div>
                <button className={styles.dangerButton} type="button" onClick={clearSave}>
                  {clearArmed ? "确认清空" : "清空所有游戏记录"}
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {activeStory && (
        <section className={styles.storyViewer} role="dialog" aria-modal="true" aria-labelledby="story-viewer-title">
          <header>
            <div>
              <p>{activeStory.kicker}</p>
              <h2 id="story-viewer-title">{activeStory.title}</h2>
            </div>
            <span>{storyPage + 1} / {activeStory.pages.length}</span>
            {(!storyFromEncounter || activeStory.entryMode === "optional") && (
              <button type="button" aria-label="关闭图文" onClick={() => setStoryEndingId(null)}>×</button>
            )}
          </header>
          <figure aria-busy={!storyImageLoaded}>
            <div className={styles.storyImageFrame} data-loaded={storyImageLoaded}>
              <picture key={activeStoryPage?.image}>
                <source media="(max-width: 720px)" srcSet={mobileStoryImagePath(activeStoryPage!.image)} />
                <img
                  src={activeStoryPage!.image}
                  alt={activeStoryPage!.text
                    ? `第${storyPage + 1}页：${activeStoryPage!.text}`
                    : `${activeStory.title}第${storyPage + 1}页`}
                  decoding="async"
                  fetchPriority="high"
                  onLoad={() => setLoadedStoryImagePath(activeStoryPage!.image)}
                />
              </picture>
              {!storyImageLoaded && <span role="status">正在翻到这一页……</span>}
            </div>
            {activeStoryPage?.text && (
              <figcaption>{activeStoryPage.text}</figcaption>
            )}
          </figure>
          <footer>
            <button
              className={styles.secondaryButton}
              disabled={storyPage === 0}
              type="button"
              onClick={() => setStoryPage((page) => Math.max(0, page - 1))}
            >
              上一页
            </button>
            {storyPage === activeStory.pages.length - 1 ? (
              <strong className={styles.storyFinalLine}>
                {activeStory.mirrorChapter ? activeStory.mirrorChapter.transition : activeStory.ending}
              </strong>
            ) : (
              <div className={styles.storyDots} aria-hidden="true">
                {activeStory.pages.map((page, index) => (
                  <i data-current={index === storyPage} key={page.image} />
                ))}
              </div>
            )}
            {storyPage === activeStory.pages.length - 1 ? activeStory.mirrorChapter ? (
              <div className={styles.storyChapterActions}>
                <button className={styles.secondaryButton} type="button" onClick={finishActiveStory}>
                  暂时收起
                </button>
                <button className={styles.primaryButton} type="button" onClick={() => openMirrorChapter(activeStory)}>
                  {activeStory.mirrorChapter.entryLabel}
                </button>
              </div>
            ) : (
              <button className={styles.primaryButton} type="button" onClick={finishActiveStory}>
                {activeStoryIsTruthEnding
                  ? "睁开眼睛"
                  : storyFromEncounter
                  ? activeStory.outcome === "end-life" ? "收录并结束此生" : activeStory.completionLabel ?? "收录并继续人生"
                  : "返回异闻录"}
              </button>
            ) : (
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => setStoryPage((page) => Math.min(activeStory.pages.length - 1, page + 1))}
              >
                下一页
              </button>
            )}
          </footer>
        </section>
      )}
    </div>
  );
}

function StepHeading({ step, title, id, aside }: { step: string; title: string; id: string; aside?: string }) {
  return (
    <header className={styles.stepHeading}>
      <div>
        <p>STEP {step}</p>
        <h1 id={id}>{title}</h1>
      </div>
      {aside && <strong>{aside}</strong>}
    </header>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return <button className={styles.textButton} type="button" onClick={onClick}>← 返回上一步</button>;
}

function ProgressLine({ label, value, total }: { label: string; value: number; total: number }) {
  const percentage = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div className={styles.progressLine}>
      <div><span>{label}</span><strong>{value} / {total}</strong></div>
      <i><b style={{ width: `${percentage}%` }} /></i>
    </div>
  );
}
