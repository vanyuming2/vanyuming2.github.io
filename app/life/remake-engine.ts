/*
 * A dependency-free TypeScript port of the data-driven rules used by
 * VickScarlet/remake. The project-wide third-party notices contain the
 * upstream MIT license and attribution.
 */

export type RemakeId = string;
export type RemakeGrade = 0 | 1 | 2 | 3;
export type RemakeStatKey = "CHR" | "INT" | "STR" | "MNY" | "SPR";
export type RemakePropertyKey = RemakeStatKey | "AGE" | "LIF" | "RDM";

type JsonNumber = number | string;

export type RemakeEffect = Partial<Record<RemakePropertyKey, JsonNumber>>;

export type RemakeAgeRecord = {
  age?: JsonNumber;
  event?: JsonNumber[] | string;
  talent?: JsonNumber[] | string;
};

export type RemakeEventRecord = {
  id?: JsonNumber;
  event: string;
  grade?: JsonNumber;
  postEvent?: string;
  effect?: RemakeEffect;
  NoRandom?: JsonNumber;
  include?: string;
  exclude?: string;
  branch?: string[] | string;
};

export type RemakeTalentRecord = {
  id?: JsonNumber;
  name: string;
  description: string;
  grade?: JsonNumber;
  condition?: string;
  status?: JsonNumber;
  exclusive?: JsonNumber;
  effect?: RemakeEffect;
  exclude?: JsonNumber[] | JsonNumber;
  replacement?: {
    grade?: JsonNumber[] | JsonNumber;
    talent?: JsonNumber[] | JsonNumber;
  };
};

export type RemakeAchievementRecord = {
  id?: JsonNumber;
  name: string;
  description: string;
  grade?: JsonNumber;
  condition?: string;
  hide?: JsonNumber;
  opportunity?: string;
};

export type RemakeCharacterRecord = {
  id?: JsonNumber;
  name: string;
  property?: Partial<Record<RemakeStatKey, JsonNumber>>;
  talent?: JsonNumber[] | JsonNumber;
};

export type RemakeData = {
  age: Record<string, RemakeAgeRecord>;
  events: Record<string, RemakeEventRecord>;
  talents: Record<string, RemakeTalentRecord>;
  achievement?: Record<string, RemakeAchievementRecord>;
  character?: Record<string, RemakeCharacterRecord>;
};

export type RemakeStats = Record<RemakeStatKey, number> & { LIF: number };
export type RemakeAllocation = Record<Exclude<RemakeStatKey, "SPR">, number>;

export type RemakeTalentCard = {
  id: RemakeId;
  name: string;
  description: string;
  grade: RemakeGrade;
  /** Probability of this exact card at the moment it was drawn, in [0, 1]. */
  probability: number;
};

export type TalentDrawResult = {
  cards: RemakeTalentCard[];
  /** Effective grade probabilities for the first non-inherited draw. */
  gradeProbabilities: Record<RemakeGrade, number>;
};

export type TalentReplacement = {
  sourceId: RemakeId;
  targetId: RemakeId;
  source: RemakeTalentCard;
  target: RemakeTalentCard;
};

export type PreparedTalents = {
  /** The selected talents followed by any recursively added replacement talents. */
  talentIds: RemakeId[];
  replacements: TalentReplacement[];
  allocationPoints: number;
};

export type RemakeContent = {
  type: "talent" | "event";
  id: RemakeId;
  grade: RemakeGrade;
  name?: string;
  description: string;
  postEvent?: string;
  effect?: RemakeEffect;
  /** Present for the first, random event of a year. */
  probability?: number;
};

export type EventPoolEntry = {
  id: RemakeId;
  event: string;
  grade: RemakeGrade;
  weight: number;
  /** Probability after include/exclude/NoRandom filtering, in [0, 1]. */
  probability: number;
  probabilityPercent: number;
};

export type SelectedEvent = EventPoolEntry;

export type RemakeHistoryYear = {
  age: number;
  content: RemakeContent[];
  isEnd: boolean;
  stats: RemakeStats;
};

export type RemakeYearResult = RemakeHistoryYear & {
  eventPool: EventPoolEntry[];
  selectedEvent: SelectedEvent;
};

export type RemakeSummary = {
  age: number;
  stats: RemakeStats;
  highest: Record<RemakeStatKey | "AGE", number>;
  lowest: Record<RemakeStatKey | "AGE", number>;
  score: number;
  talentIds: RemakeId[];
  eventIds: RemakeId[];
};

export type RemakeSnapshot = {
  version: 1;
  age: number;
  stats: RemakeStats;
  talentIds: RemakeId[];
  eventIds: RemakeId[];
  triggerCounts: Record<RemakeId, number>;
  highest: Record<RemakeStatKey | "AGE", number>;
  lowest: Record<RemakeStatKey | "AGE", number>;
  ended: boolean;
  initialContent: RemakeContent[];
  history: RemakeHistoryYear[];
  /** Developer-only queue. Empty during normal play. Persisted so a debug run survives refresh. */
  forcedEventIds?: RemakeId[];
  /** Target ages aligned with forcedEventIds. Missing values keep legacy immediate behavior. */
  forcedEventAges?: number[];
};

export type RemakeStartInput = {
  /** Pass PreparedTalents.talentIds here; start does not run replacement twice. */
  talentIds: readonly RemakeId[];
  allocation: RemakeAllocation;
  /** Original preset characters use fixed attributes rather than the free-allocation total. */
  presetAllocation?: boolean;
  /** Developer-only: force these events on the next years, bypassing age and include filters. */
  forcedEventIds?: readonly RemakeId[];
  /** Target ages aligned with forcedEventIds, allowing a run to begin normally at age zero. */
  forcedEventAges?: readonly number[];
};

export type RemakeRunResult = {
  initialContent: RemakeContent[];
  history: RemakeHistoryYear[];
  summary: RemakeSummary;
  snapshot: RemakeSnapshot;
};

export type RemakePersistentProperties = {
  times?: number;
  achievedEvents?: readonly RemakeId[];
  achievedTalents?: readonly RemakeId[];
};

export type RemakeEngineOptions = {
  random?: () => number;
  defaultPropertyPoints?: number;
  defaultSpirit?: number;
  allocationRange?: readonly [number, number];
  talentRates?: Partial<Record<RemakeGrade, number>> & { total?: number };
  talentWeights?: Partial<Record<RemakeId, number>>;
  persistent?: RemakePersistentProperties;
};

export type ConditionValue = number | string | readonly (number | string)[];
export type ConditionProperties =
  | Readonly<Record<string, ConditionValue>>
  | ((property: string) => ConditionValue | undefined);

type NormalizedAge = { event: WeightedId[]; talent: RemakeId[] };
type NormalizedEvent = Omit<RemakeEventRecord, "id" | "branch"> & {
  id: RemakeId;
  grade: RemakeGrade;
  branches: { condition: string; nextId: RemakeId }[];
};
type NormalizedTalent = Omit<RemakeTalentRecord, "id" | "grade" | "exclude"> & {
  id: RemakeId;
  grade: RemakeGrade;
  exclude: RemakeId[];
  maxTriggers: number;
};
type WeightedId = { id: RemakeId; weight: number };
type NormalizedData = {
  age: Record<string, NormalizedAge>;
  events: Record<RemakeId, NormalizedEvent>;
  talents: Record<RemakeId, NormalizedTalent>;
};

const STAT_KEYS: readonly RemakeStatKey[] = ["CHR", "INT", "STR", "MNY", "SPR"];
const TRACKED_KEYS: readonly (RemakeStatKey | "AGE")[] = ["AGE", ...STAT_KEYS];
const DEFAULT_TALENT_RATES: Record<RemakeGrade, number> & { total: number } = {
  0: 889,
  1: 100,
  2: 10,
  3: 1,
  total: 1000,
};

function idOf(value: JsonNumber): RemakeId {
  return String(value);
}

function numberOf(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function gradeOf(value: unknown): RemakeGrade {
  const grade = Math.trunc(numberOf(value));
  if (grade <= 0) return 0;
  if (grade >= 3) return 3;
  return grade as RemakeGrade;
}

function arrayOf<T>(value: T[] | T | undefined): T[] {
  if (value === undefined || value === null || value === "") return [];
  return Array.isArray(value) ? [...value] : [value];
}

function listOf(value: JsonNumber[] | JsonNumber | undefined): JsonNumber[] {
  if (typeof value === "string" && value.includes(",")) {
    return value.split(",").map((part) => part.trim()).filter(Boolean);
  }
  return arrayOf(value);
}

function weightedIdOf(value: JsonNumber): WeightedId | null {
  const [rawId, rawWeight] = String(value).split("*", 2);
  const id = rawId.trim();
  if (!id) return null;
  const weight = rawWeight === undefined ? 1 : numberOf(rawWeight, 1);
  if (!(weight > 0)) return null;
  return { id, weight };
}

function normalizeData(data: RemakeData): NormalizedData {
  const age: Record<string, NormalizedAge> = {};
  for (const [ageKey, record] of Object.entries(data.age)) {
    age[ageKey] = {
      event: listOf(record.event).map(weightedIdOf).filter((item): item is WeightedId => item !== null),
      talent: listOf(record.talent).map(idOf),
    };
  }

  const events: Record<RemakeId, NormalizedEvent> = {};
  for (const [key, record] of Object.entries(data.events)) {
    const id = idOf(record.id ?? key);
    const branchValues = typeof record.branch === "string"
      ? [record.branch]
      : (record.branch ?? []);
    const branches = branchValues.flatMap((branch) => {
      const separator = branch.lastIndexOf(":");
      if (separator < 0) return [];
      const condition = branch.slice(0, separator).trim();
      const nextId = branch.slice(separator + 1).trim();
      return condition && nextId ? [{ condition, nextId }] : [];
    });
    events[id] = {
      ...record,
      id,
      grade: gradeOf(record.grade),
      branches,
    };
  }

  const talents: Record<RemakeId, NormalizedTalent> = {};
  for (const [key, record] of Object.entries(data.talents)) {
    const id = idOf(record.id ?? key);
    talents[id] = {
      ...record,
      id,
      grade: gradeOf(record.grade),
      exclude: listOf(record.exclude).map(idOf),
      maxTriggers: extractMaxTriggers(record.condition),
    };
  }
  return { age, events, talents };
}

function comparable(value: unknown): number | string {
  if (typeof value === "number") return value;
  const numeric = Number(value);
  return value !== "" && Number.isFinite(numeric) ? numeric : String(value);
}

function equalValue(left: unknown, right: unknown): boolean {
  return comparable(left) === comparable(right);
}

function includesValue(haystack: readonly unknown[], needle: unknown): boolean {
  return haystack.some((value) => equalValue(value, needle));
}

function parseConditionValue(raw: string): ConditionValue {
  const value = raw.trim();
  if (value.startsWith("[") && value.endsWith("]")) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is number | string =>
          typeof item === "number" || typeof item === "string");
      }
    } catch {
      return [];
    }
  }
  const numeric = Number(value);
  return value !== "" && Number.isFinite(numeric) ? numeric : value;
}

function checkConditionAtom(get: (property: string) => ConditionValue | undefined, atom: string): boolean {
  const match = atom.trim().match(/^([A-Za-z][A-Za-z0-9_]*)\s*(>=|<=|!=|>|<|=|\?|!)\s*(.+)$/);
  if (!match) return false;
  const [, property, operator, rawExpected] = match;
  const actual = get(property);
  if (actual === undefined) return false;
  const expected = parseConditionValue(rawExpected);

  if (operator === "?") {
    const expectedList = Array.isArray(expected) ? expected : [expected];
    return Array.isArray(actual)
      ? actual.some((item) => includesValue(expectedList, item))
      : includesValue(expectedList, actual);
  }
  if (operator === "!") {
    const expectedList = Array.isArray(expected) ? expected : [expected];
    return Array.isArray(actual)
      ? actual.every((item) => !includesValue(expectedList, item))
      : !includesValue(expectedList, actual);
  }
  if (operator === "=" || operator === "!=") {
    const matches = Array.isArray(actual)
      ? includesValue(actual, expected)
      : equalValue(actual, expected);
    return operator === "=" ? matches : !matches;
  }

  const actualNumber = Number(actual);
  const expectedNumber = Number(expected);
  if (!Number.isFinite(actualNumber) || !Number.isFinite(expectedNumber)) return false;
  if (operator === ">") return actualNumber > expectedNumber;
  if (operator === "<") return actualNumber < expectedNumber;
  if (operator === ">=") return actualNumber >= expectedNumber;
  if (operator === "<=") return actualNumber <= expectedNumber;
  return false;
}

type ConditionToken = "(" | ")" | "&" | "|" | { atom: string };

function tokenizeCondition(condition: string): ConditionToken[] {
  const tokens: ConditionToken[] = [];
  let cursor = 0;
  const flush = (end: number) => {
    const atom = condition.slice(cursor, end).trim();
    if (atom) tokens.push({ atom });
  };
  for (let index = 0; index < condition.length; index += 1) {
    const character = condition[index];
    if (character !== "(" && character !== ")" && character !== "&" && character !== "|") continue;
    flush(index);
    tokens.push(character);
    cursor = index + 1;
  }
  flush(condition.length);
  return tokens;
}

/** Evaluates the upstream condition language, including nested parentheses. */
export function checkCondition(properties: ConditionProperties, condition?: string | null): boolean {
  if (!condition?.trim()) return true;
  const get = typeof properties === "function"
    ? properties
    : (property: string) => properties[property];
  const tokens = tokenizeCondition(condition);
  let cursor = 0;

  const factor = (): boolean => {
    const token = tokens[cursor];
    if (token === "(") {
      cursor += 1;
      const result = expression();
      if (tokens[cursor] === ")") cursor += 1;
      return result;
    }
    if (typeof token === "object") {
      cursor += 1;
      return checkConditionAtom(get, token.atom);
    }
    cursor += 1;
    return false;
  };

  // The original engine evaluates & and | from left to right within a group.
  const expression = (): boolean => {
    let result = factor();
    while (cursor < tokens.length && tokens[cursor] !== ")") {
      const operator = tokens[cursor];
      if (operator !== "&" && operator !== "|") {
        cursor += 1;
        return false;
      }
      cursor += 1;
      const right = factor();
      result = operator === "&" ? result && right : result || right;
    }
    return result;
  };

  return expression() && cursor === tokens.length;
}

export function extractMaxTriggers(condition?: string): number {
  if (!condition) return 1;
  const match = /AGE\?\[([0-9,\s]+)\]/.exec(condition);
  if (!match) return 1;
  return Math.max(1, match[1].split(",").filter((age) => age.trim() !== "").length);
}

/** Formats the placeholders supported by the original event data. */
export function formatTemplate(
  template: string,
  properties: ConditionProperties,
  currentYear = new Date().getFullYear(),
): string {
  const get = typeof properties === "function"
    ? properties
    : (property: string) => properties[property];
  const aliases: Record<string, string> = {
    age: "AGE",
    charm: "CHR",
    intelligence: "INT",
    strength: "STR",
    money: "MNY",
    spirit: "SPR",
  };
  return String(template).replace(/\{\s*([0-9a-zA-Z_-]+)\s*\}/g, (whole, rawKey: string) => {
    const key = rawKey.toLowerCase();
    if (key === "currentyear") return String(currentYear);
    const value = get(aliases[key] ?? rawKey.toUpperCase());
    return value === undefined || Array.isArray(value) ? whole : String(value);
  });
}

function cloneStats(stats: RemakeStats): RemakeStats {
  return { ...stats };
}

function cloneContent(content: readonly RemakeContent[]): RemakeContent[] {
  return content.map((entry) => ({ ...entry, effect: entry.effect ? { ...entry.effect } : undefined }));
}

function normalizeRandom(random: () => number): number {
  const value = random();
  if (!Number.isFinite(value)) return 0.5;
  return Math.min(Math.max(value, 0), 1 - Number.EPSILON);
}

function weightedPick<T>(items: readonly T[], weight: (item: T) => number, random: () => number): T {
  if (!items.length) throw new Error("Cannot choose from an empty weighted pool.");
  const total = items.reduce((sum, item) => sum + Math.max(0, weight(item)), 0);
  if (!(total > 0)) return items[items.length - 1];
  let cursor = normalizeRandom(random) * total;
  for (const item of items) {
    cursor -= Math.max(0, weight(item));
    if (cursor < 0) return item;
  }
  return items[items.length - 1];
}

function cardOf(talent: NormalizedTalent, probability = 0): RemakeTalentCard {
  return {
    id: talent.id,
    name: talent.name,
    description: talent.description,
    grade: talent.grade,
    probability,
  };
}

function calculateScore(highest: Record<RemakeStatKey | "AGE", number>): number {
  const statSum = STAT_KEYS.reduce((sum, key) => sum + highest[key], 0);
  return Math.floor(statSum * 2 + highest.AGE / 2);
}

function serializableHistory(history: readonly RemakeHistoryYear[]): RemakeHistoryYear[] {
  return history.map((year) => ({
    age: year.age,
    content: cloneContent(year.content),
    isEnd: year.isEnd,
    stats: cloneStats(year.stats),
  }));
}

class SessionState {
  age = -1;
  stats: RemakeStats;
  talentIds: RemakeId[];
  eventIds: RemakeId[] = [];
  triggerCounts: Record<RemakeId, number> = {};
  highest: Record<RemakeStatKey | "AGE", number>;
  lowest: Record<RemakeStatKey | "AGE", number>;
  ended = false;
  initialContent: RemakeContent[] = [];
  history: RemakeHistoryYear[] = [];
  forcedEventIds: RemakeId[] = [];
  forcedEventAges: number[] = [];

  constructor(talentIds: readonly RemakeId[], stats: RemakeStats) {
    this.talentIds = [...talentIds];
    this.stats = cloneStats(stats);
    this.highest = { AGE: this.age, CHR: stats.CHR, INT: stats.INT, STR: stats.STR, MNY: stats.MNY, SPR: stats.SPR };
    this.lowest = { ...this.highest };
  }
}

export class RemakeSession {
  private state: SessionState;

  /** @internal Create sessions through createRemakeEngine(). */
  constructor(
    private readonly data: NormalizedData,
    private readonly random: () => number,
    private readonly persistent: Required<RemakePersistentProperties>,
    state: SessionState,
  ) {
    this.state = state;
  }

  get initialContent(): readonly RemakeContent[] {
    return this.state.initialContent;
  }

  get history(): readonly RemakeHistoryYear[] {
    return this.state.history;
  }

  get isEnd(): boolean {
    return this.state.ended;
  }

  private property = (property: string): ConditionValue | undefined => {
    const state = this.state;
    if (property === "AGE") return state.age;
    if (property === "LIF") return state.stats.LIF;
    if ((STAT_KEYS as readonly string[]).includes(property)) return state.stats[property as RemakeStatKey];
    if (property.startsWith("H") && TRACKED_KEYS.includes(property.slice(1) as RemakeStatKey | "AGE")) {
      return state.highest[property.slice(1) as RemakeStatKey | "AGE"];
    }
    if (property.startsWith("L") && TRACKED_KEYS.includes(property.slice(1) as RemakeStatKey | "AGE")) {
      return state.lowest[property.slice(1) as RemakeStatKey | "AGE"];
    }
    if (property === "TLT") return state.talentIds.map(comparable);
    if (property === "EVT") return state.eventIds.map(comparable);
    if (property === "ATLT") return [...new Set([...this.persistent.achievedTalents, ...state.talentIds])].map(comparable);
    if (property === "AEVT") return [...new Set([...this.persistent.achievedEvents, ...state.eventIds])].map(comparable);
    if (property === "TMS") return this.persistent.times;
    if (property === "SUM") return calculateScore(state.highest);
    return undefined;
  };

  private touch(property: RemakeStatKey | "AGE", value: number): void {
    this.state.highest[property] = Math.max(this.state.highest[property], value);
    this.state.lowest[property] = Math.min(this.state.lowest[property], value);
  }

  private applyEffect(effect?: RemakeEffect): void {
    if (!effect) return;
    for (const [rawProperty, rawAmount] of Object.entries(effect)) {
      let property = rawProperty as RemakePropertyKey;
      if (property === "RDM") {
        property = STAT_KEYS[Math.floor(normalizeRandom(this.random) * STAT_KEYS.length)];
      }
      const amount = numberOf(rawAmount);
      if (property === "AGE") {
        this.state.age += amount;
        this.touch("AGE", this.state.age);
      } else if (property === "LIF") {
        this.state.stats.LIF += amount;
      } else if ((STAT_KEYS as readonly string[]).includes(property)) {
        this.state.stats[property as RemakeStatKey] += amount;
        this.touch(property as RemakeStatKey, this.state.stats[property as RemakeStatKey]);
      }
    }
  }

  private doTalents(newTalentIds: readonly RemakeId[] = []): RemakeContent[] {
    for (const id of newTalentIds) {
      if (this.data.talents[id] && !this.state.talentIds.includes(id)) this.state.talentIds.push(id);
    }
    const content: RemakeContent[] = [];
    for (const id of this.state.talentIds) {
      const talent = this.data.talents[id];
      if (!talent) continue;
      const triggers = this.state.triggerCounts[id] ?? 0;
      if (triggers >= talent.maxTriggers) continue;
      if (talent.condition && !checkCondition(this.property, talent.condition)) continue;
      this.state.triggerCounts[id] = triggers + 1;
      content.push({
        type: "talent",
        id,
        grade: talent.grade,
        name: talent.name,
        description: formatTemplate(talent.description, this.property),
        effect: talent.effect ? { ...talent.effect } : undefined,
      });
      this.applyEffect(talent.effect);
    }
    return content;
  }

  /** Runs the initial, non-age talent effects once. Used only by engine.start(). */
  initializeTalents(): void {
    this.state.initialContent = this.doTalents();
    for (const key of TRACKED_KEYS) {
      const value = key === "AGE" ? this.state.age : this.state.stats[key];
      this.state.highest[key] = value;
      this.state.lowest[key] = value;
    }
  }

  /** @internal Used by the local developer harness before the first year. */
  queueForcedEvents(eventIds: readonly RemakeId[], targetAges: readonly number[] = []): void {
    this.state.forcedEventIds = eventIds.map(idOf);
    this.state.forcedEventAges = eventIds.map((_, index) => {
      const targetAge = numberOf(targetAges[index], Number.NEGATIVE_INFINITY);
      return Number.isFinite(targetAge) ? Math.max(0, Math.trunc(targetAge)) : Number.NEGATIVE_INFINITY;
    });
  }

  private canRandomlyTrigger(event: NormalizedEvent): boolean {
    if (numberOf(event.NoRandom) !== 0) return false;
    if (event.exclude && checkCondition(this.property, event.exclude)) return false;
    if (event.include) return checkCondition(this.property, event.include);
    return true;
  }

  private eventPool(weightedEvents: readonly WeightedId[]): EventPoolEntry[] {
    const weights = new Map<RemakeId, number>();
    for (const item of weightedEvents) {
      const event = this.data.events[item.id];
      if (!event || !this.canRandomlyTrigger(event)) continue;
      weights.set(item.id, (weights.get(item.id) ?? 0) + item.weight);
    }
    const total = [...weights.values()].reduce((sum, weight) => sum + weight, 0);
    return [...weights].map(([id, weight]) => {
      const event = this.data.events[id];
      const probability = total > 0 ? weight / total : 0;
      return {
        id,
        event: event.event,
        grade: event.grade,
        weight,
        probability,
        probabilityPercent: probability * 100,
      };
    });
  }

  private doEvent(id: RemakeId, probability?: number, depth = 0): RemakeContent[] {
    if (depth > 100) throw new Error("Event branch depth exceeded 100; the data may contain a cycle.");
    const event = this.data.events[id];
    if (!event) throw new Error(`No event data found for id ${id}.`);

    let nextId: RemakeId | undefined;
    for (const branch of event.branches) {
      if (checkCondition(this.property, branch.condition)) {
        nextId = branch.nextId;
        break;
      }
    }

    if (!this.state.eventIds.includes(id)) this.state.eventIds.push(id);
    this.applyEffect(event.effect);
    const content: RemakeContent = {
      type: "event",
      id,
      grade: event.grade,
      description: formatTemplate(event.event, this.property),
      postEvent: event.postEvent ? formatTemplate(event.postEvent, this.property) : undefined,
      effect: event.effect ? { ...event.effect } : undefined,
      probability,
    };
    if (!nextId) return [content];
    return [content, ...this.doEvent(nextId, undefined, depth + 1)];
  }

  next(): RemakeYearResult {
    if (this.state.ended) throw new Error("This life has already ended.");
    this.state.age += 1;
    this.touch("AGE", this.state.age);
    const displayedAge = this.state.age;
    const ageData = this.data.age[String(displayedAge)];
    if (!ageData) throw new Error(`No age data found for age ${displayedAge}.`);

    const talentContent = this.doTalents(ageData.talent);
    const forcedTargetAge = this.state.forcedEventAges[0] ?? Number.NEGATIVE_INFINITY;
    const shouldForceEvent = this.state.forcedEventIds.length > 0 && displayedAge >= forcedTargetAge;
    const forcedEventId = shouldForceEvent ? this.state.forcedEventIds.shift() : undefined;
    if (shouldForceEvent) this.state.forcedEventAges.shift();
    const forcedEvent = forcedEventId ? this.data.events[forcedEventId] : undefined;
    if (forcedEventId && !forcedEvent) throw new Error(`No forced event data found for id ${forcedEventId}.`);
    const pool = forcedEvent
      ? [{
        id: forcedEvent.id,
        event: forcedEvent.event,
        grade: forcedEvent.grade,
        weight: 1,
        probability: 1,
        probabilityPercent: 100,
      }]
      : this.eventPool(ageData.event);
    if (!pool.length) throw new Error(`No eligible random event exists for age ${displayedAge}.`);
    const selectedEvent = forcedEvent ? pool[0] : weightedPick(pool, (event) => event.weight, this.random);
    const eventContent = this.doEvent(selectedEvent.id, selectedEvent.probability);
    const content = [...talentContent, ...eventContent];
    this.state.ended = this.state.stats.LIF < 1;

    const historyYear: RemakeHistoryYear = {
      age: displayedAge,
      content: cloneContent(content),
      isEnd: this.state.ended,
      stats: cloneStats(this.state.stats),
    };
    this.state.history.push(historyYear);
    return { ...historyYear, eventPool: pool.map((entry) => ({ ...entry })), selectedEvent: { ...selectedEvent } };
  }

  runToEnd(maxYears = 1000): RemakeRunResult {
    let years = 0;
    while (!this.state.ended && years < maxYears) {
      this.next();
      years += 1;
    }
    if (!this.state.ended) throw new Error(`Life did not end within ${maxYears} simulated years.`);
    return {
      initialContent: cloneContent(this.state.initialContent),
      history: serializableHistory(this.state.history),
      summary: this.summary(),
      snapshot: this.snapshot(),
    };
  }

  summary(): RemakeSummary {
    return {
      age: this.state.age,
      stats: cloneStats(this.state.stats),
      highest: { ...this.state.highest },
      lowest: { ...this.state.lowest },
      score: calculateScore(this.state.highest),
      talentIds: [...this.state.talentIds],
      eventIds: [...this.state.eventIds],
    };
  }

  snapshot(): RemakeSnapshot {
    return {
      version: 1,
      age: this.state.age,
      stats: cloneStats(this.state.stats),
      talentIds: [...this.state.talentIds],
      eventIds: [...this.state.eventIds],
      triggerCounts: { ...this.state.triggerCounts },
      highest: { ...this.state.highest },
      lowest: { ...this.state.lowest },
      ended: this.state.ended,
      initialContent: cloneContent(this.state.initialContent),
      history: serializableHistory(this.state.history),
      forcedEventIds: [...this.state.forcedEventIds],
      forcedEventAges: [...this.state.forcedEventAges],
    };
  }
}

function restoredState(snapshot: RemakeSnapshot, data: NormalizedData): SessionState {
  if (snapshot.version !== 1) throw new Error(`Unsupported remake snapshot version: ${String(snapshot.version)}.`);
  const talentIds = snapshot.talentIds.map(idOf).filter((id) => Boolean(data.talents[id]));
  const state = new SessionState(talentIds, cloneStats(snapshot.stats));
  state.age = numberOf(snapshot.age, -1);
  state.eventIds = snapshot.eventIds.map(idOf).filter((id) => Boolean(data.events[id]));
  state.triggerCounts = Object.fromEntries(
    Object.entries(snapshot.triggerCounts).map(([id, count]) => [idOf(id), Math.max(0, Math.trunc(numberOf(count)))]),
  );
  state.highest = { ...snapshot.highest };
  state.lowest = { ...snapshot.lowest };
  state.ended = Boolean(snapshot.ended) || state.stats.LIF < 1;
  state.initialContent = cloneContent(snapshot.initialContent ?? []);
  state.history = serializableHistory(snapshot.history ?? []);
  state.forcedEventIds = (snapshot.forcedEventIds ?? []).map(idOf).filter((id) => Boolean(data.events[id]));
  state.forcedEventAges = state.forcedEventIds.map((_, index) => {
    const age = numberOf(snapshot.forcedEventAges?.[index], Number.NEGATIVE_INFINITY);
    return Number.isFinite(age) ? Math.max(0, Math.trunc(age)) : Number.NEGATIVE_INFINITY;
  });
  return state;
}

export type RemakeEngine = ReturnType<typeof createRemakeEngine>;

export function createRemakeEngine(data: RemakeData, options: RemakeEngineOptions = {}) {
  const normalized = normalizeData(data);
  const random = options.random ?? Math.random;
  const defaultPropertyPoints = numberOf(options.defaultPropertyPoints, 20);
  const defaultSpirit = numberOf(options.defaultSpirit, 5);
  const allocationRange = options.allocationRange ?? [0, 10] as const;
  const persistent: Required<RemakePersistentProperties> = {
    times: Math.max(0, Math.trunc(numberOf(options.persistent?.times))),
    achievedEvents: [...(options.persistent?.achievedEvents ?? [])].map(idOf),
    achievedTalents: [...(options.persistent?.achievedTalents ?? [])].map(idOf),
  };
  const rates = { ...DEFAULT_TALENT_RATES, ...options.talentRates };
  rates.total = numberOf(rates.total, DEFAULT_TALENT_RATES.total);
  const talentWeight = (talent: NormalizedTalent) => Math.max(
    0.0001,
    numberOf(options.talentWeights?.[talent.id], 1),
  );

  const conflict = (selectedIds: readonly RemakeId[], candidateId: RemakeId): RemakeId | null => {
    const candidate = normalized.talents[idOf(candidateId)];
    if (!candidate) return null;
    for (const selectedId of selectedIds.map(idOf)) {
      if (selectedId === candidate.id) return selectedId;
      const selected = normalized.talents[selectedId];
      if (!selected) continue;
      if (candidate.exclude.includes(selectedId) || selected.exclude.includes(candidate.id)) return selectedId;
    }
    return null;
  };

  const allocationPoints = (talentIds: readonly RemakeId[]) =>
    defaultPropertyPoints + talentIds.reduce((sum, id) => sum + numberOf(normalized.talents[idOf(id)]?.status), 0);

  const drawTalents = ({ count = 10, includeTalentId }: { count?: number; includeTalentId?: RemakeId | null } = {}): TalentDrawResult => {
    const pools: Record<RemakeGrade, NormalizedTalent[]> = { 0: [], 1: [], 2: [], 3: [] };
    const includeId = includeTalentId == null ? null : idOf(includeTalentId);
    for (const talent of Object.values(normalized.talents)) {
      if (numberOf(talent.exclusive) !== 0 || talent.id === includeId) continue;
      pools[talent.grade].push(talent);
    }

    const rawMass: Record<RemakeGrade, number> = {
      0: Math.max(0, numberOf(rates[0], Math.max(0, rates.total - numberOf(rates[1]) - numberOf(rates[2]) - numberOf(rates[3])))),
      1: Math.max(0, numberOf(rates[1])),
      2: Math.max(0, numberOf(rates[2])),
      3: Math.max(0, numberOf(rates[3])),
    };
    // Grade zero is the remainder in the upstream config unless explicitly overridden.
    if (options.talentRates?.[0] === undefined) {
      rawMass[0] = Math.max(0, rates.total - rawMass[1] - rawMass[2] - rawMass[3]);
    }
    const massTotal = Object.values(rawMass).reduce((sum, mass) => sum + mass, 0) || 1;
    const initialEffective: Record<RemakeGrade, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (let source = 0 as RemakeGrade; source <= 3; source = (source + 1) as RemakeGrade) {
      let target = source;
      while (target > 0 && pools[target].length === 0) target = (target - 1) as RemakeGrade;
      if (pools[target].length) initialEffective[target] += rawMass[source] / massTotal;
    }

    const cards: RemakeTalentCard[] = [];
    if (includeId && normalized.talents[includeId] && count > 0) cards.push(cardOf(normalized.talents[includeId], 1));
    while (cards.length < Math.max(0, Math.trunc(count))) {
      if (!Object.values(pools).some((pool) => pool.length)) break;
      const source = weightedPick<RemakeGrade>([0, 1, 2, 3], (grade) => rawMass[grade], random);
      let grade = source;
      while (grade > 0 && pools[grade].length === 0) grade = (grade - 1) as RemakeGrade;
      if (!pools[grade].length) {
        grade = ([0, 1, 2, 3] as RemakeGrade[]).find((candidate) => pools[candidate].length > 0) ?? 0;
      }

      let effectiveMass = 0;
      for (let candidate = 0 as RemakeGrade; candidate <= 3; candidate = (candidate + 1) as RemakeGrade) {
        let fallback = candidate;
        while (fallback > 0 && pools[fallback].length === 0) fallback = (fallback - 1) as RemakeGrade;
        if (fallback === grade) effectiveMass += rawMass[candidate] / massTotal;
      }
      const pool = pools[grade];
      const poolWeight = pool.reduce((sum, talent) => sum + talentWeight(talent), 0);
      const selected = weightedPick(pool, talentWeight, random);
      const index = pool.indexOf(selected);
      const exactProbability = effectiveMass * talentWeight(selected) / poolWeight;
      cards.push(cardOf(pool.splice(index, 1)[0], exactProbability));
    }
    return { cards, gradeProbabilities: initialEffective };
  };

  const prepareTalents = (selectedIds: readonly RemakeId[]): PreparedTalents => {
    const selected = selectedIds.map(idOf);
    for (let index = 0; index < selected.length; index += 1) {
      const id = selected[index];
      if (!normalized.talents[id]) throw new Error(`No talent data found for id ${id}.`);
      const other = selected.slice(0, index);
      const blockingId = conflict(other, id);
      if (blockingId) throw new Error(`Talent ${id} conflicts with talent ${blockingId}.`);
    }

    const active = [...selected];
    const replacements: TalentReplacement[] = [];
    const resolve = (sourceId: RemakeId, depth = 0): void => {
      if (depth > 100) throw new Error("Talent replacement depth exceeded 100; the data may contain a cycle.");
      const source = normalized.talents[sourceId];
      if (!source?.replacement) return;
      const candidates: WeightedId[] = [];
      for (const gradeValue of listOf(source.replacement.grade)) {
        const parsed = weightedIdOf(gradeValue);
        if (!parsed) continue;
        const grade = gradeOf(parsed.id);
        for (const talent of Object.values(normalized.talents)) {
          if (talent.grade !== grade || numberOf(talent.exclusive) !== 0 || conflict(active, talent.id)) continue;
          candidates.push({ id: talent.id, weight: parsed.weight });
        }
      }
      for (const talentValue of listOf(source.replacement.talent)) {
        const parsed = weightedIdOf(talentValue);
        if (!parsed || !normalized.talents[parsed.id] || conflict(active, parsed.id)) continue;
        candidates.push(parsed);
      }
      if (!candidates.length) return;
      const targetId = weightedPick(candidates, (candidate) => candidate.weight, random).id;
      if (active.includes(targetId)) return;
      active.push(targetId);
      replacements.push({
        sourceId,
        targetId,
        source: cardOf(source),
        target: cardOf(normalized.talents[targetId]),
      });
      resolve(targetId, depth + 1);
    };
    for (const id of selected) resolve(id);
    return { talentIds: active, replacements, allocationPoints: allocationPoints(active) };
  };

  const start = (input: RemakeStartInput): RemakeSession => {
    const talentIds = input.talentIds.map(idOf);
    for (const id of talentIds) {
      if (!normalized.talents[id]) throw new Error(`No talent data found for id ${id}.`);
    }
    const expectedPoints = allocationPoints(talentIds);
    const actualPoints = (["CHR", "INT", "STR", "MNY"] as const).reduce((sum, key) => {
      const value = input.allocation[key];
      if (!Number.isFinite(value) || value < allocationRange[0] || value > allocationRange[1]) {
        throw new Error(`${key} must be between ${allocationRange[0]} and ${allocationRange[1]}.`);
      }
      return sum + value;
    }, 0);
    if (!input.presetAllocation && actualPoints !== expectedPoints) {
      throw new Error(`Allocation must total ${expectedPoints} points; received ${actualPoints}.`);
    }
    const stats: RemakeStats = { ...input.allocation, SPR: defaultSpirit, LIF: 1 };
    const session = new RemakeSession(normalized, random, persistent, new SessionState(talentIds, stats));
    const forcedEventIds = (input.forcedEventIds ?? []).map(idOf);
    for (const id of forcedEventIds) {
      if (!normalized.events[id]) throw new Error(`No forced event data found for id ${id}.`);
    }
    session.queueForcedEvents(forcedEventIds, input.forcedEventAges);
    session.initializeTalents();
    return session;
  };

  const restore = (snapshot: RemakeSnapshot): RemakeSession =>
    new RemakeSession(normalized, random, persistent, restoredState(snapshot, normalized));

  return {
    drawTalents,
    findTalentConflict: conflict,
    prepareTalents,
    getAllocationPoints: allocationPoints,
    start,
    restore,
    createSession: restore,
    getTalent: (id: RemakeId) => {
      const talent = normalized.talents[idOf(id)];
      return talent ? cardOf(talent) : null;
    },
    getEvent: (id: RemakeId) => {
      const event = normalized.events[idOf(id)];
      return event ? { id: event.id, event: event.event, grade: event.grade } : null;
    },
  };
}
