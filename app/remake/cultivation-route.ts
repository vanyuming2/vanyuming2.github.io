import type {
  RemakeAchievementRecord,
  RemakeEventRecord,
  RemakeId,
  RemakeTalentRecord,
} from "../life/remake-engine";

export const SMALL_BOX_TALENT_ID = "1048";
export const IMMORTAL_BOOK_EVENT_ID = "20461";
export const IMMORTAL_BOOK_OPPORTUNITY_EVENT_ID = "site-small-box-immortal-book";
export const IMMORTAL_BOOK_MIN_AGE = 26;
export const IMMORTAL_BOOK_MAX_AGE = 59;
// The upstream age pools contain sentinel weights far above ordinary events.
// A finite 1e100 keeps the weighted picker stable while making this encounter
// effectively certain whenever the small-box condition is satisfied.
export const IMMORTAL_BOOK_EVENT_WEIGHT = 1e100;
export const CULTIVATION_CHAPTER_WEIGHT = 1e90;
export const PERFECT_CULTIVATION_EVENT_ID = "40050";
export const FIRST_SPECIAL_ACHIEVEMENT_ID = "site-achievement-first-special";
export const PERFECT_CULTIVATION_ACHIEVEMENT_ID = "site-achievement-perfect-cultivation";
export const RED_PILL_TALENT_ID = "site-red-pill";
export const TRUE_ENDING_ACHIEVEMENT_ID = "site-achievement-true-ending";
export const TRUE_ENDING_QUOTE = "我再一次站在阳光下，就像我儿时那样，我一无所有，一无所学，一无所知。";
export const TRUE_ENDING_ATTRIBUTION = "赫尔曼·黑塞《悉达多》";
export const TRUE_ENDING_REFLECTION = [
  "走到这里，我反而不想再解释那些异闻究竟是什么。它们可以是一场很长的梦，也可以是意识在昏迷中替自己寻找出口。",
  "重要的是，醒来以后，父亲还在，旧路还认得，普通的日子仍能往下过。所谓真结局，不是终于得到了所有答案，而是愿意回到没有答案的生活里。",
] as const;

export function shouldOfferTruthChoice(
  perfectEndingInRun: boolean,
  truthChoiceAvailable: boolean,
  trueEndingReached: boolean,
) {
  return !trueEndingReached && (perfectEndingInRun || truthChoiceAvailable);
}

export function isTruthRun(talentIds: readonly RemakeId[]) {
  return talentIds.some((id) => String(id) === RED_PILL_TALENT_ID);
}

export const RED_PILL_TALENT: RemakeTalentRecord = {
  id: RED_PILL_TALENT_ID,
  name: "红色药丸",
  description: "你醒来前吞下的东西。梦会继续，直到它愿意放你出去。",
  grade: 3,
  exclusive: 1,
  effect: { LIF: 10 },
  exclude: [1004, 1024, 1025, 1113],
};

export const IMMORTAL_BOOK_OPPORTUNITY_EVENT: RemakeEventRecord = {
  id: IMMORTAL_BOOK_OPPORTUNITY_EVENT_ID,
  event: "一个乞丐拦住你，低声问：盒子还没有打开，对吗？随后，他从怀里取出一本《仙脉图录》。",
  grade: 3,
  include: `TLT?[${SMALL_BOX_TALENT_ID}]`,
  exclude: `EVT?[${IMMORTAL_BOOK_EVENT_ID},"${IMMORTAL_BOOK_OPPORTUNITY_EVENT_ID}"]`,
  branch: [`TLT?[${SMALL_BOX_TALENT_ID}]:${IMMORTAL_BOOK_EVENT_ID}`],
};

export interface CultivationChapter {
  id: string;
  minAge: number;
  maxAge: number;
  event: RemakeEventRecord;
}

const chapter = (
  index: number,
  minAge: number,
  maxAge: number,
  text: string,
  previousId: string,
  branchEventId: string,
  effect?: RemakeEventRecord["effect"],
): CultivationChapter => {
  const id = `site-cultivation-${String(index).padStart(2, "0")}`;
  return {
    id,
    minAge,
    maxAge,
    event: {
      id,
      event: text,
      grade: 3,
      include: `TLT?[${SMALL_BOX_TALENT_ID}]&EVT?[${previousId}]`,
      exclude: `EVT?["${id}"]`,
      branch: [`TLT?[${SMALL_BOX_TALENT_ID}]:${branchEventId}`],
      ...(effect ? { effect } : {}),
    },
  };
};

/**
 * A restrained narrative thread laid over the upstream cultivation mechanics.
 * Each chapter echoes one of the site's strange tales without explaining the
 * connection; the last chapter still resolves through the original event 40050.
 */
export const CULTIVATION_ROUTE_CHAPTERS: readonly CultivationChapter[] = [
  chapter(1, 101, 109,
    "《仙脉图录》的夹页里有一行极淡的小字：世间诸事，皆有旧稿。你再看时，那行字已经不见了。",
    "40001", "40002", { INT: 8, SPR: 2 }),
  chapter(2, 110, 129,
    "入定以后，你看见黑暗中悬着一颗微弱的星。它每闪一次，远处便有一段陌生人生随之亮起。",
    "site-cultivation-01", "40003", { INT: 20, STR: 80 }),
  chapter(3, 130, 159,
    "你循着灵息走入雪山。雨停以后，一道彩虹落在岩壁上；壁后传来空旷的回声，像有人先你一步进去过。",
    "site-cultivation-02", "40010", { INT: 60, STR: 420 }),
  chapter(4, 160, 199,
    "海上起了没有方向的雾。一块旧木牌从浪里漂来，背面刻着你的名字，字迹却比你年长许多。",
    "site-cultivation-03", "40023", { INT: 420, STR: 900 }),
  chapter(5, 200, 239,
    "你在荒原上看见两个太阳。第二个只存在了片刻，消失时，脚下浅水里的倒影仍迟了一息。",
    "site-cultivation-04", "40034", { INT: 180, STR: 180 }),
  chapter(6, 240, 279,
    "神识沉入深海，历代鲸骨都朝向同一道海沟。沟底没有生灵，只有一页仍在缓慢翻动的纸。",
    "site-cultivation-05", "40035", { INT: 240, STR: 160 }),
  chapter(7, 280, 319,
    "沙暴退去，地下露出一座没有尸骨的城。每间空屋的门都朝着同一处，仿佛在等一次尚未发生的归来。",
    "site-cultivation-06", "40036", { INT: 360, STR: 360 }),
  chapter(8, 320, 359,
    "一座废弃院落里，门框高得不合常理。你没有进去；离开很远以后，身后的脚步声才停下。",
    "site-cultivation-07", "40037", { INT: 300, STR: 300, SPR: -1 }),
  chapter(9, 360, 399,
    "旧磁带在无人触碰时自行转动。失真的人声反复告诫你不要回头，而墙上的影子始终面向相反的方向。",
    "site-cultivation-08", "40038", { INT: 380, STR: 380 }),
  chapter(10, 400, 439,
    "你在罗布泊上空俯视大地。两片鱼形阴影短暂合拢，天地随之安静了一瞬，像一页被重新誊写。",
    "site-cultivation-09", "40039", { INT: 520, STR: 520 }),
  chapter(11, 440, 469,
    "界外残碑记着十种互不相干的异闻。末尾却用了同一种笔迹：不要试着唤醒正在读这些字的人。",
    "site-cultivation-10", "40047", { INT: 600, STR: 600 }),
  chapter(12, 470, 484,
    "《仙脉图录》多出一页空白。你以神识触碰，纸面浮现出极细的方格，随即又恢复成普通纤维。",
    "site-cultivation-11", "40048", { INT: 700, STR: 700 }),
  chapter(13, 485, 498,
    "小盒子的内壁开始脱落，如雪花般无声消融。盒底露出一个圆形空位，尺寸恰好容得下一枚药丸。",
    "site-cultivation-12", "40049", { INT: 900, STR: 900, SPR: 3 }),
  chapter(14, 499, 499,
    "界壁裂开一道极窄的缝。缝外有光，也有人叫你的名字。你没有回答，只将这一页轻轻合上。",
    "site-cultivation-13", PERFECT_CULTIVATION_EVENT_ID),
];

export const SITE_ACHIEVEMENTS: readonly RemakeAchievementRecord[] = [
  {
    id: FIRST_SPECIAL_ACHIEVEMENT_ID,
    name: "初识冰山一角",
    description: "完整读完任意一则特殊事件。帷幕后，还有更多尚未彼此相连的记录。",
    grade: 2,
    // This achievement is awarded by the story reader only after the last page.
    condition: 'EVT?["site-achievement-never-auto"]',
    hide: 0,
    opportunity: "END",
  },
  {
    id: PERFECT_CULTIVATION_ACHIEVEMENT_ID,
    name: "完美结局",
    description: "从神秘的小盒子中找到那条隐秘道路，悟透本源大道，最终踏入羽化境。",
    grade: 3,
    condition: `EVT?[${PERFECT_CULTIVATION_EVENT_ID}]`,
    hide: 1,
    opportunity: "TRAJECTORY",
  },
  {
    id: TRUE_ENDING_ACHIEVEMENT_ID,
    name: "真结局",
    description: "走过所有漫长的答案以后，从一场昏迷中醒来。",
    grade: 3,
    condition: 'EVT?["site-achievement-never-auto"]',
    hide: 1,
    opportunity: "END",
  },
];

export function isCultivationEventId(id: RemakeId) {
  const value = String(id);
  const numeric = Number(value);
  return value === IMMORTAL_BOOK_EVENT_ID
    || value === IMMORTAL_BOOK_OPPORTUNITY_EVENT_ID
    || value.startsWith("site-cultivation-")
    || (Number.isInteger(numeric) && numeric >= 40001 && numeric <= 40050);
}
