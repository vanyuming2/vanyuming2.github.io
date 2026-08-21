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
const lifeLines: Partial<Record<number, string>> = {};
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
