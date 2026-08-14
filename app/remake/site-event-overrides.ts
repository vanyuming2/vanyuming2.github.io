import type {
  RemakeAgeRecord,
  RemakeData,
  RemakeEventRecord,
  RemakeTalentRecord,
} from "../life/remake-engine";
import {
  CULTIVATION_CHAPTER_WEIGHT,
  CULTIVATION_ROUTE_CHAPTERS,
  IMMORTAL_BOOK_EVENT_WEIGHT,
  IMMORTAL_BOOK_MAX_AGE,
  IMMORTAL_BOOK_MIN_AGE,
  IMMORTAL_BOOK_OPPORTUNITY_EVENT,
  IMMORTAL_BOOK_OPPORTUNITY_EVENT_ID,
  RED_PILL_TALENT,
  RED_PILL_TALENT_ID,
  SITE_ACHIEVEMENTS,
} from "./cultivation-route";

export const UNLOADED_HOMETOWN_EVENT_ID = "21305";
export const UNLOADED_HOMETOWN_MIN_AGE = 20;
export const UNLOADED_HOMETOWN_MAX_AGE = 32;
export const UNLOADED_HOMETOWN_EVENT_WEIGHT = 0.2;
export const SHAMBHALA_TALENT_ID = "site-shambhala-manuscript";
export const SHAMBHALA_EVENT_ID = "site-shambhala-entry";
export const SHAMBHALA_EVENT_AGE = 20;
export const EIGHTIES_GHOST_EVENT_ID = "site-eighties-ghost-file";
export const EIGHTIES_GHOST_MIN_AGE = 18;
export const EIGHTIES_GHOST_MAX_AGE = 25;
export const EIGHTIES_GHOST_EVENT_WEIGHT = 0.2;
export const GONGGONG_BLOODLINE_TALENT_ID = "site-gonggong-bloodline";
export const GONGGONG_ZHURONG_EVENT_ID = "site-gonggong-zhurong-crossing";
export const GONGGONG_MALE_BIRTH_EVENT_ID = "10001";
export const GONGGONG_ZHURONG_MIN_AGE = 18;
export const GONGGONG_ZHURONG_MAX_AGE = 25;
export const PENGLAI_TALENT_ID = "site-penglai-sea-fog";
export const PENGLAI_EVENT_ID = "site-penglai-route-crossing";
export const PENGLAI_MIN_AGE = 20;
export const PENGLAI_MAX_AGE = 35;
export const PENGLAI_MALE_BIRTH_EVENT_ID = "10001";
export const DOUBLE_FISH_TALENT_ID = "site-double-fish-aerial-negative";
export const DOUBLE_FISH_EVENT_ID = "site-double-fish-jade-crossing";
export const DOUBLE_FISH_EVENT_AGE = 21;
export const CTHULHU_CEMETERY_TALENT_ID = "site-cthulhu-cemetery";
export const CTHULHU_CEMETERY_EVENT_ID = "site-cthulhu-cemetery-dive";
export const CTHULHU_CEMETERY_MIN_AGE = 24;
export const CTHULHU_CEMETERY_MAX_AGE = 32;
export const KUNLUN_BONES_TALENT_ID = "site-kunlun-bone-compass";
export const KUNLUN_BONES_EVENT_ID = "site-kunlun-bones-expedition";
export const KUNLUN_BONES_MIN_AGE = 26;
export const KUNLUN_BONES_MAX_AGE = 36;
export const SAND_SEA_TALENT_ID = "site-sand-sea-stone-seal";
export const SAND_SEA_EVENT_ID = "site-sand-sea-beneath";
export const SAND_SEA_MIN_AGE = 28;
export const SAND_SEA_MAX_AGE = 38;
export const EIGHT_FOOT_WOMAN_TALENT_ID = "site-eight-foot-woman-sensitivity";
export const EIGHT_FOOT_WOMAN_EVENT_ID = "site-eight-foot-woman-return";
export const EIGHT_FOOT_WOMAN_MIN_AGE = 19;
export const EIGHT_FOOT_WOMAN_MAX_AGE = 23;
export const MALE_BIRTH_EVENT_ID = "10001";

export const SPECIAL_PROLOGUE_EVENT_IDS = {
  shambhala: ["site-prologue-shambhala-family", "site-prologue-shambhala-study"],
  gonggong: ["site-prologue-gonggong-dream", "site-prologue-gonggong-flood-record"],
  penglai: ["site-prologue-penglai-course", "site-prologue-penglai-invitation"],
  doubleFish: ["site-prologue-double-fish-major", "site-prologue-double-fish-archive"],
  cthulhuCemetery: ["site-prologue-cthulhu-major", "site-prologue-cthulhu-project"],
  kunlunBones: ["site-prologue-kunlun-reporter", "site-prologue-kunlun-parcel"],
  sandSea: ["site-prologue-sand-sea-major", "site-prologue-sand-sea-drive"],
  eightFootWoman: ["site-prologue-eight-foot-childhood", "site-prologue-eight-foot-return"],
} as const;

export const SPECIAL_RUMOR_EVENT_IDS = {
  unloadedHometown: "site-rumor-unloaded-hometown",
  shambhala: "site-rumor-shambhala",
  eightiesRoom: "site-rumor-eighties-room",
  gonggong: "site-rumor-gonggong",
  penglai: "site-rumor-penglai",
  doubleFish: "site-rumor-double-fish",
  cthulhuCemetery: "site-rumor-cthulhu-cemetery",
  kunlunBones: "site-rumor-kunlun-bones",
  sandSea: "site-rumor-sand-sea",
  eightFootWoman: "site-rumor-eight-foot-woman",
} as const;

const SHAMBHALA_TALENT: RemakeTalentRecord = {
  id: SHAMBHALA_TALENT_ID,
  name: "香巴拉世界手稿",
  description: "祖父留下的手稿没有结论，只有几处坐标被反复圈起。",
  grade: 3,
};

const SHAMBHALA_EVENT: RemakeEventRecord = {
  id: SHAMBHALA_EVENT_ID,
  event: "你重新翻出了祖父留下的香巴拉手稿。最后几页，记录着一条没有出现在任何地图上的路线。",
  grade: 3,
  NoRandom: 1,
  include: `AGE=${SHAMBHALA_EVENT_AGE}&TLT?["${SHAMBHALA_TALENT_ID}"]`,
  exclude: `EVT?["${SHAMBHALA_EVENT_ID}"]`,
};

const EIGHTIES_GHOST_EVENT: RemakeEventRecord = {
  id: EIGHTIES_GHOST_EVENT_ID,
  event: "你在学校旧阅览室的报废书柜里，发现一本八十年代的借阅簿。建明这个名字，连续七天写在同一个房间号后面。",
  grade: 3,
  include: `AGE>=${EIGHTIES_GHOST_MIN_AGE}&AGE<=${EIGHTIES_GHOST_MAX_AGE}`,
  exclude: `EVT?[\"${EIGHTIES_GHOST_EVENT_ID}\"]`,
};

const GONGGONG_BLOODLINE_TALENT: RemakeTalentRecord = {
  id: GONGGONG_BLOODLINE_TALENT_ID,
  name: "共工血脉",
  description: "血里有一场尚未落下的洪水。体质 +15，智力 +5，快乐 +2，可分配点 +8。",
  grade: 3,
  status: 8,
  effect: { STR: 15, INT: 5, SPR: 2 },
  exclude: [1004, 1024, 1025, 1113],
};

const GONGGONG_ZHURONG_EVENT: RemakeEventRecord = {
  id: GONGGONG_ZHURONG_EVENT_ID,
  event: "后脑传来一阵钝痛。你在陌生的荒地上睁开眼，天上挂着两个太阳。",
  grade: 3,
  NoRandom: 1,
  include: `AGE>=${GONGGONG_ZHURONG_MIN_AGE}&AGE<=${GONGGONG_ZHURONG_MAX_AGE}&TLT?["${GONGGONG_BLOODLINE_TALENT_ID}"]`,
  exclude: `EVT?["${GONGGONG_ZHURONG_EVENT_ID}"]`,
};

const PENGLAI_TALENT: RemakeTalentRecord = {
  id: PENGLAI_TALENT_ID,
  name: "海雾来客",
  description: "每当海上起雾，总觉得有人在更远的地方叫你的名字。智力 +4，体质 +3，快乐 +1，可分配点 +4。",
  grade: 3,
  status: 4,
  effect: { INT: 4, STR: 3, SPR: 1 },
  exclude: [1004, 1024, 1025, 1113],
};

const PENGLAI_EVENT: RemakeEventRecord = {
  id: PENGLAI_EVENT_ID,
  event: "大学室友邀你去海边住几天。出海后的下午，低雾压住海面，导航与指南针同时失去了方向。",
  grade: 3,
  NoRandom: 1,
  include: `AGE>=${PENGLAI_MIN_AGE}&AGE<=${PENGLAI_MAX_AGE}&TLT?["${PENGLAI_TALENT_ID}"]`,
  exclude: `EVT?["${PENGLAI_EVENT_ID}"]`,
};

const DOUBLE_FISH_TALENT: RemakeTalentRecord = {
  id: DOUBLE_FISH_TALENT_ID,
  name: "罗布泊旧航片",
  description: "航片拍摄于1980年，角落里有一座如今地图上不存在的气象站。智力 +7，体质 +3，快乐 +2，可分配点 +5。",
  grade: 3,
  status: 5,
  effect: { INT: 7, STR: 3, SPR: 2 },
  exclude: [1004, 1024, 1025, 1113],
};

const DOUBLE_FISH_EVENT: RemakeEventRecord = {
  id: DOUBLE_FISH_EVENT_ID,
  event: "遥感课上，你在一张1980年的罗布泊航拍图里，发现了一座如今并不存在的气象站。最后一页记录写着：今天，太阳落下了两次。",
  grade: 3,
  NoRandom: 1,
  include: `AGE=${DOUBLE_FISH_EVENT_AGE}&TLT?["${DOUBLE_FISH_TALENT_ID}"]`,
  exclude: `EVT?["${DOUBLE_FISH_EVENT_ID}"]`,
};

const CTHULHU_CEMETERY_TALENT: RemakeTalentRecord = {
  id: CTHULHU_CEMETERY_TALENT_ID,
  name: "七千米深潜母带",
  description: "未经剪辑的影像里，跨越五百三十万年的鲸骨朝向同一条海沟。智力 +6，体质 +6，快乐 +2，可分配点 +5。",
  grade: 3,
  status: 5,
  effect: { INT: 6, STR: 6, SPR: 2 },
  exclude: [1004, 1024, 1025, 1113],
};

const CTHULHU_CEMETERY_EVENT: RemakeEventRecord = {
  id: CTHULHU_CEMETERY_EVENT_ID,
  event: "你重新整理七千米深处的潜航影像。跨越五百三十万年的鲸骨，全部朝向同一条海沟。",
  grade: 3,
  NoRandom: 1,
  include: `AGE>=${CTHULHU_CEMETERY_MIN_AGE}&AGE<=${CTHULHU_CEMETERY_MAX_AGE}&TLT?["${CTHULHU_CEMETERY_TALENT_ID}"]`,
  exclude: `EVT?["${CTHULHU_CEMETERY_EVENT_ID}"]`,
};

const KUNLUN_BONES_TALENT: RemakeTalentRecord = {
  id: KUNLUN_BONES_TALENT_ID,
  name: "无编号旧磁带",
  description: "磁带来自1983年，失真的录音里有人反复说：不要顺着骸骨面对的方向走。智力 +6，体质 +5，快乐 +3，可分配点 +5。",
  grade: 3,
  status: 5,
  effect: { INT: 6, STR: 5, SPR: 3 },
  exclude: [1004, 1024, 1025, 1113],
};

const KUNLUN_BONES_EVENT: RemakeEventRecord = {
  id: KUNLUN_BONES_EVENT_ID,
  event: "一盘没有编号的磁带里，有人反复警告：不要顺着骸骨面对的方向走。旧地图却在那句话之后，多出了一条路线。",
  grade: 3,
  NoRandom: 1,
  include: `AGE>=${KUNLUN_BONES_MIN_AGE}&AGE<=${KUNLUN_BONES_MAX_AGE}&TLT?["${KUNLUN_BONES_TALENT_ID}"]`,
  exclude: `EVT?["${KUNLUN_BONES_EVENT_ID}"]`,
};

const SAND_SEA_TALENT: RemakeTalentRecord = {
  id: SAND_SEA_TALENT_ID,
  name: "沙海石印",
  description: "一枚从无人沙漠寄来的小石印，刻痕不属于任何已知文字。智力 +9，体质 +5，家境 +2，可分配点 +6。",
  grade: 3,
  status: 6,
  effect: { INT: 9, STR: 5, MNY: 2 },
  exclude: [1004, 1024, 1025, 1113],
};

const SAND_SEA_EVENT: RemakeEventRecord = {
  id: SAND_SEA_EVENT_ID,
  event: "一次普通的卫星扫描中，你在无人沙漠下发现了规则排列的街道。复测三次，城市轮廓仍在原处。",
  grade: 3,
  NoRandom: 1,
  include: `AGE>=${SAND_SEA_MIN_AGE}&AGE<=${SAND_SEA_MAX_AGE}&TLT?["${SAND_SEA_TALENT_ID}"]`,
  exclude: `EVT?["${SAND_SEA_EVENT_ID}"]`,
};

const EIGHT_FOOT_WOMAN_TALENT: RemakeTalentRecord = {
  id: EIGHT_FOOT_WOMAN_TALENT_ID,
  name: "招阴体质",
  description: "你总能比旁人更早察觉到门外有人。智力 +3，体质 +2，快乐 -1，可分配点 +2。",
  grade: 2,
  status: 2,
  effect: { INT: 3, STR: 2, SPR: -1 },
  exclude: [1004, 1024, 1025, 1113],
};

const EIGHT_FOOT_WOMAN_EVENT: RemakeEventRecord = {
  id: EIGHT_FOOT_WOMAN_EVENT_ID,
  event: "返乡的大巴上，一个全身黑衣的女人始终站着。车顶很低，她却没有弯腰。",
  grade: 2,
  NoRandom: 1,
  include: `AGE>=${EIGHT_FOOT_WOMAN_MIN_AGE}&AGE<=${EIGHT_FOOT_WOMAN_MAX_AGE}&TLT?["${EIGHT_FOOT_WOMAN_TALENT_ID}"]`,
  exclude: `EVT?["${EIGHT_FOOT_WOMAN_EVENT_ID}"]`,
};

const SPECIAL_PROLOGUE_EVENTS: readonly RemakeEventRecord[] = [
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.shambhala[0],
    event: "小时候，你常在祖父的书房里等他下班。最里面的柜子始终锁着，柜门上贴着一张已经褪色的冈仁波齐照片。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.shambhala[1],
    event: "你选修了藏地历史与地理。课堂提到香巴拉时，老师说那只是宗教寓言；你却想起祖父从不让人触碰的柜子。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.gonggong[0],
    event: "你反复梦见一场没有尽头的洪水。梦醒时，床边总像刚被水浸过一样冰凉。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.gonggong[1],
    event: "整理地方水患记录时，你发现家族旧谱在共工二字旁留了一处空白。那页纸带着很淡的潮气。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.penglai[0],
    event: "大学里，你选修了中国航海史。讲到徐市出海以后再无确切记载，老师很快翻过了那一页。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.penglai[1],
    event: "工作迟迟没有着落。大学室友顾衡发来消息，让你去海边住几天，顺便跟他的朋友出海散散心。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.doubleFish[0],
    event: "填报志愿时，你选择了地理信息科学。比起今天的地图，你更喜欢在旧航片里寻找已经消失的河流和道路。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.doubleFish[1],
    event: "遥感课要求整理一批尚未数字化的航片。老师把一只落满灰的档案箱交给了你，编号停在1980年。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.cthulhuCemetery[0],
    event: "你选择了海洋地质方向。第一次看见鲸落影像时，你注意到遗骸周围的生物很多，唯独没有鱼游向更深的海沟。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.cthulhuCemetery[1],
    event: "导师让你协助整理一批未公开的深潜资料。硬盘标签只写着深度：七千零二十四米。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.kunlunBones[0],
    event: "你开始从事调查报道，尤其留意那些只有一句结论、没有调查过程的失踪档案。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.kunlunBones[1],
    event: "编辑部收到一个没有寄件人的旧包裹。里面只有一盘磁带和一张昆仑山黑石沟的油纸地图。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.sandSea[0],
    event: "大学里，你选择了遥感与考古地理方向。比起已经命名的遗址，你更在意卫星图上那些被标成噪点的规则线条。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.sandSea[1],
    event: "西北测绘站清理旧库时，寄来一枚没有登记过的石印。包裹内侧，只写着一组位于无人沙漠的坐标。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.eightFootWoman[0],
    event: "小时候住在乡下，天黑后你偶尔会听见院墙外传来拖长的脚步声。祖母从不许你靠近窗户。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_PROLOGUE_EVENT_IDS.eightFootWoman[1],
    event: "大二暑假，你决定独自回乡下老宅住几天。买票时，售票员确认了两次终点，又把零钱原样退给了你。",
    grade: 0,
    NoRandom: 1,
  },
];

const SPECIAL_RUMOR_EVENTS: readonly RemakeEventRecord[] = [
  {
    id: SPECIAL_RUMOR_EVENT_IDS.unloadedHometown,
    event: "隔壁市有个大学生在返乡途中遭遇车祸。醒来以后，他反复说父亲一睡着，老家的房屋和道路就会消失。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_RUMOR_EVENT_IDS.shambhala,
    event: "网上有人求助，说几名年轻人带着一份祖传手稿进入冈仁波齐附近后失去联系。帖子第二天就被删除了。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_RUMOR_EVENT_IDS.eightiesRoom,
    event: "邻市一所大学清理旧校舍时发现一本八十年代的借阅簿。同一个学生的名字，连续七天登记在一间不存在的房间里。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_RUMOR_EVENT_IDS.gonggong,
    event: "南方暴雨过后，有人在积水里拍到两个太阳。气象部门说，那只是手机镜头产生的重影。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_RUMOR_EVENT_IDS.penglai,
    event: "海边有个年轻人失踪了五个小时。获救后，他坚称自己在一支古代船队里生活了三天。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_RUMOR_EVENT_IDS.doubleFish,
    event: "一支学生考察队在罗布泊短暂失联。回程登记表比出发时多了一个名字，却没人承认队伍里多过人。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_RUMOR_EVENT_IDS.cthulhuCemetery,
    event: "一段深潜影像在网上流传了几个小时。画面里，不同年代的鲸骨全都朝向同一条海沟。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_RUMOR_EVENT_IDS.kunlunBones,
    event: "一名调查记者进入昆仑山后失去联系。他留下的最后一段语音只有一句：不要顺着骸骨面对的方向走。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_RUMOR_EVENT_IDS.sandSea,
    event: "一支测绘队在无人沙漠中封锁了一处发掘点。返程名单完整，领队却坚持说，地下那座城里从来没有发现过尸骨。",
    grade: 0,
    NoRandom: 1,
  },
  {
    id: SPECIAL_RUMOR_EVENT_IDS.eightFootWoman,
    event: "邻县有个大学生暑假返乡后失踪。监控里，他深夜提着木棍走进一座废厂；在他前面，始终有一截黑衣露在画面上沿。",
    grade: 0,
    NoRandom: 1,
  },
];

export function randomUnloadedHometownAge(random = Math.random) {
  const ageCount = UNLOADED_HOMETOWN_MAX_AGE - UNLOADED_HOMETOWN_MIN_AGE + 1;
  return UNLOADED_HOMETOWN_MIN_AGE + Math.floor(Math.min(0.999999999, Math.max(0, random())) * ageCount);
}

function eventId(value: string | number) {
  return String(value).split("*")[0];
}

function eventValues(record: RemakeAgeRecord) {
  if (record.event === undefined || record.event === "") return [];
  return Array.isArray(record.event) ? record.event : [record.event];
}

/**
 * Keeps the upstream data package untouched while moving our standalone
 * virtual-world ending into a younger, deliberately rare age window.
 */
export function applySiteEventOverrides(data: RemakeData): RemakeData {
  const age = { ...data.age };

  for (const [ageKey, record] of Object.entries(data.age)) {
    const currentAge = Math.trunc(Number(record.age ?? ageKey));
    const withoutOldEntry = eventValues(record).filter(
      (value) => eventId(value) !== UNLOADED_HOMETOWN_EVENT_ID,
    );
    const withUnloadedHometown = currentAge >= UNLOADED_HOMETOWN_MIN_AGE
      && currentAge <= UNLOADED_HOMETOWN_MAX_AGE
      ? [...withoutOldEntry, `${UNLOADED_HOMETOWN_EVENT_ID}*${UNLOADED_HOMETOWN_EVENT_WEIGHT}`]
      : withoutOldEntry;
    const withoutGhostDuplicate = withUnloadedHometown.filter(
      (value) => eventId(value) !== EIGHTIES_GHOST_EVENT_ID,
    );
    const withEightiesGhost = currentAge >= EIGHTIES_GHOST_MIN_AGE
      && currentAge <= EIGHTIES_GHOST_MAX_AGE
      ? [...withoutGhostDuplicate, `${EIGHTIES_GHOST_EVENT_ID}*${EIGHTIES_GHOST_EVENT_WEIGHT}`]
      : withoutGhostDuplicate;
    const withoutBookDuplicate = withEightiesGhost.filter(
      (value) => eventId(value) !== IMMORTAL_BOOK_OPPORTUNITY_EVENT_ID,
    );
    let event = currentAge >= IMMORTAL_BOOK_MIN_AGE && currentAge <= IMMORTAL_BOOK_MAX_AGE
      ? [...withoutBookDuplicate, `${IMMORTAL_BOOK_OPPORTUNITY_EVENT_ID}*${IMMORTAL_BOOK_EVENT_WEIGHT}`]
      : withoutBookDuplicate;

    for (const cultivationChapter of CULTIVATION_ROUTE_CHAPTERS) {
      event = event.filter((value) => eventId(value) !== cultivationChapter.id);
      if (currentAge >= cultivationChapter.minAge && currentAge <= cultivationChapter.maxAge) {
        event.push(`${cultivationChapter.id}*${CULTIVATION_CHAPTER_WEIGHT}`);
      }
    }

    if (
      event.length !== eventValues(record).length
      || event.some((value, index) => value !== eventValues(record)[index])
    ) {
      age[ageKey] = { ...record, event };
    }
  }

  const originalEvent = data.events[UNLOADED_HOMETOWN_EVENT_ID];
  const events: Record<string, RemakeEventRecord> = {
    ...data.events,
    [UNLOADED_HOMETOWN_EVENT_ID]: {
      ...originalEvent,
      include: `AGE>=${UNLOADED_HOMETOWN_MIN_AGE}&AGE<=${UNLOADED_HOMETOWN_MAX_AGE}&TLT?["${RED_PILL_TALENT_ID}"]`,
      exclude: `EVT?[${UNLOADED_HOMETOWN_EVENT_ID}]`,
    },
    [SHAMBHALA_EVENT_ID]: SHAMBHALA_EVENT,
    [EIGHTIES_GHOST_EVENT_ID]: EIGHTIES_GHOST_EVENT,
    [GONGGONG_ZHURONG_EVENT_ID]: GONGGONG_ZHURONG_EVENT,
    [PENGLAI_EVENT_ID]: PENGLAI_EVENT,
    [DOUBLE_FISH_EVENT_ID]: DOUBLE_FISH_EVENT,
    [CTHULHU_CEMETERY_EVENT_ID]: CTHULHU_CEMETERY_EVENT,
    [KUNLUN_BONES_EVENT_ID]: KUNLUN_BONES_EVENT,
    [SAND_SEA_EVENT_ID]: SAND_SEA_EVENT,
    [EIGHT_FOOT_WOMAN_EVENT_ID]: EIGHT_FOOT_WOMAN_EVENT,
    [IMMORTAL_BOOK_OPPORTUNITY_EVENT_ID]: IMMORTAL_BOOK_OPPORTUNITY_EVENT,
  };

  for (const cultivationChapter of CULTIVATION_ROUTE_CHAPTERS) {
    events[cultivationChapter.id] = cultivationChapter.event;
  }

  for (const event of [...SPECIAL_PROLOGUE_EVENTS, ...SPECIAL_RUMOR_EVENTS]) {
    events[String(event.id)] = event;
  }

  const achievement = { ...data.achievement };
  for (const record of SITE_ACHIEVEMENTS) achievement[String(record.id)] = record;

  return {
    ...data,
    age,
    events,
    achievement,
    talents: {
      ...data.talents,
      [SHAMBHALA_TALENT_ID]: SHAMBHALA_TALENT,
      [GONGGONG_BLOODLINE_TALENT_ID]: GONGGONG_BLOODLINE_TALENT,
      [PENGLAI_TALENT_ID]: PENGLAI_TALENT,
      [DOUBLE_FISH_TALENT_ID]: DOUBLE_FISH_TALENT,
      [CTHULHU_CEMETERY_TALENT_ID]: CTHULHU_CEMETERY_TALENT,
      [KUNLUN_BONES_TALENT_ID]: KUNLUN_BONES_TALENT,
      [SAND_SEA_TALENT_ID]: SAND_SEA_TALENT,
      [EIGHT_FOOT_WOMAN_TALENT_ID]: EIGHT_FOOT_WOMAN_TALENT,
      [RED_PILL_TALENT_ID]: RED_PILL_TALENT,
    },
  };
}
