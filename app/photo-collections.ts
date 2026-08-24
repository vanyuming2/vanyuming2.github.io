export type PhotoDoodleType =
  | "arrow"
  | "cat-ears"
  | "circle"
  | "crown"
  | "goose"
  | "mustache"
  | "scribble"
  | "spark"
  | "speech"
  | "starfish"
  | "tape"
  | "underline";

export type PhotoDoodleTone = "chalk" | "rose" | "warm";

export type PhotoDoodlePlacement = {
  type: PhotoDoodleType;
  x: number;
  y: number;
  rotate?: number;
  scale?: number;
  tone?: PhotoDoodleTone;
};

export type PhotoCollectionItem = {
  id: string;
  label: string;
  imagePath: string;
  mobileImagePath: string;
  placeholderPath: string;
  caption: string;
  doodles: readonly PhotoDoodlePlacement[];
};

export type PhotoCollection = {
  id: "life" | "styled";
  title: string;
  description: string;
  items: readonly PhotoCollectionItem[];
};

export const lifeCount = 83;
export const styledCount = 27;

// 之后逐张补台词时，只需要在这里按图片编号填写。
const lifeLines: Partial<Record<number, string>> = {
  1: "很小的车，能放在手掌里那种。",
  2: "太呆了，25 年还是不太会摆造型，但是打光弥补了这一点",
  3: "正面照让龙骑的大眼萌更明显了……",
  4: "耄耋是合肥的",
  5: "一叶障目了",
  6: "梦里出现的场景，广场上有座桂林峰丛那种山，长城像蛇一样盘踞其中，下面是一个办公区，进去了就要上班。",
  7: "上海动物园的绿网，千禧年风格",
  8: "究极空我",
  9: "初代，玩耍……",
  10: "无敌玩家",
  11: "先驱者来着，因为过于古怪被日本人狠狠嘲讽",
  12: "2020 年宿舍下的猫尾巴",
  13: "肥猫",
  14: "很妖娆的龙，属于龙的早期形象，应该是汉代还是唐代的。2018 年摄于陕西历史博物馆，2023 年再去时发现没了。",
  15: "如果你是龙，也好……",
  16: "西安钟楼，去了八百回",
  17: "西电毕业礼物",
  18: "三花狗，摄于潘集 2021",
  19: "这家主人养的狗和猫是一个色系的，离谱，宛如哼哈二将，一起上来求模",
  20: "2022 年西安家属区，熬穿了去吃早饭看到的",
  21: "额",
  22: "优雅的十二生肖",
  23: "龙骑 SIC，随手一摆",
  24: "水豚",
  25: "破败的神秘小院",
  26: "内景",
  27: "深圳 2025，那个时候还在上学",
  28: "香港，感觉有点嘉豪",
  29: "华为心情墙，不开心居多",
  30: "漂亮的鸟联组，应该是老鹰、凤凰、狮鹫拼接的",
  31: "NTC 底座扭蛋，太行了",
  32: "友人来拍，狭小的出租屋很欢乐",
  33: "一号，二号",
  34: "硬装，贵州的大熊猫",
  35: "贵州的亭子，听说是太平天国年间所建",
  36: "硬装结束，蛋糕",
  37: "有你有我，我上电视了！",
  38: "清风徐来，水波不兴",
  39: "……",
  40: "英语学习∠",
  41: "……",
  42: "国宾馆醋鱼，300 多一盘还是难吃，证明了根本就没有好吃的醋鱼",
  43: "练秋湖夜色",
  44: "霸占我的桌面",
  45: "你长得很像听泉鉴宝你知道吗",
  46: "毛茸茸",
  47: "你好胖，你的脑袋像拼上去的一样",
  48: "困了？",
  49: "睡了",
  50: "枯山水",
  51: "西交夜景，摄于 2026 年 2 月",
  52: "淮南",
  53: "……",
  54: "你倒是睡得香了",
  55: "随便一掰就很帅了",
  56: "捏人",
  57: "路人鱼，我想复刻蟹堡王的 3D 模型",
};
const styledLines: Partial<Record<number, string>> = {};

// 涂鸦与照片分离保存。以后只需要按编号覆盖位置，不必改图片本身。
const lifeDoodleOverrides: Partial<Record<number, readonly PhotoDoodlePlacement[]>> = {};
const styledDoodleOverrides: Partial<Record<number, readonly PhotoDoodlePlacement[]>> = {};

const doodlePresets: readonly (readonly PhotoDoodlePlacement[])[] = [
  [{ type: "spark", x: 79, y: 61, rotate: 7, scale: 0.8, tone: "warm" }],
  [
    { type: "underline", x: 32, y: 82, rotate: -3, scale: 1.15, tone: "rose" },
    { type: "starfish", x: 82, y: 72, rotate: 11, scale: 0.72, tone: "warm" },
  ],
  [{ type: "speech", x: 76, y: 69, rotate: -4, scale: 0.82, tone: "chalk" }],
  [
    { type: "tape", x: 18, y: 57, rotate: -9, scale: 0.86, tone: "warm" },
    { type: "arrow", x: 79, y: 82, rotate: 8, scale: 0.82, tone: "rose" },
  ],
  [{ type: "goose", x: 82, y: 74, rotate: 3, scale: 0.74, tone: "chalk" }],
  [{ type: "circle", x: 25, y: 77, rotate: -7, scale: 0.9, tone: "rose" }],
  [
    { type: "crown", x: 77, y: 61, rotate: 9, scale: 0.72, tone: "warm" },
    { type: "scribble", x: 27, y: 85, rotate: -2, scale: 1.05, tone: "chalk" },
  ],
  [{ type: "starfish", x: 81, y: 72, rotate: -10, scale: 0.78, tone: "warm" }],
];

function createItems(
  prefix: "life" | "styled",
  count: number,
  labelPrefix: string,
  lines: Partial<Record<number, string>>,
  doodleOverrides: Partial<Record<number, readonly PhotoDoodlePlacement[]>>,
): PhotoCollectionItem[] {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const paddedNumber = String(number).padStart(3, "0");
    return {
      id: `${prefix}-${paddedNumber}`,
      label: `${labelPrefix} ${String(number).padStart(2, "0")}`,
      imagePath: `/photo-gallery/${prefix}/${prefix}-${paddedNumber}.webp`,
      mobileImagePath: `/photo-gallery/${prefix}/${prefix}-${paddedNumber}-mobile.webp`,
      placeholderPath: `/photo-placeholders/${prefix}/${prefix}-${paddedNumber}.webp`,
      caption: lines[number] ?? "",
      doodles: doodleOverrides[number] ?? doodlePresets[index % doodlePresets.length],
    };
  });
}

export const photoCollections: readonly PhotoCollection[] = [
  {
    id: "life",
    title: "生活中的图片",
    description: "随手拍下的日常。",
    items: createItems("life", lifeCount, "生活", lifeLines, lifeDoodleOverrides),
  },
  {
    id: "styled",
    title: "风格化图片",
    description: "经过风格化处理的画面。",
    items: createItems("styled", styledCount, "风格", styledLines, styledDoodleOverrides),
  },
];
