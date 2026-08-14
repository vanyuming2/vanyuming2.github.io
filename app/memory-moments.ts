export type MemoryMomentEdge = "top" | "right" | "bottom" | "left";

export type MemoryMoment = {
  id: string;
  imagePath: string;
  fallbackGlyph: string;
  label: string;
  hint: string;
  edge: MemoryMomentEdge;
  offset: number;
};

export const memoryMoments = [
  {
    id: "white-goose",
    imagePath: "/memory-moments/white-goose.png?v=20260807",
    fallbackGlyph: "鹅",
    label: "大白鹅",
    hint: "那只大白鹅一出现，我就想起我们玩过的那局游戏。",
    edge: "left",
    offset: 24,
  },
  {
    id: "starfish",
    imagePath: "/memory-moments/starfish.png?v=20260807",
    fallbackGlyph: "★",
    label: "海星",
    hint: "这颗海星，替我们记着那次海岛旅行。",
    edge: "bottom",
    offset: 18,
  },
  {
    id: "textbook",
    imagePath: "/memory-moments/textbook.png?v=20260807",
    fallbackGlyph: "书",
    label: "课本",
    hint: "故事最早的一页，还夹在课本里。",
    edge: "right",
    offset: 27,
  },
  {
    id: "chat-bubble",
    imagePath: "/memory-moments/chat-bubble.png?v=20260807",
    fallbackGlyph: "…",
    label: "聊天气泡",
    hint: "后来，我们从一句近况又聊了起来。",
    edge: "right",
    offset: 70,
  },
  {
    id: "moonlit-night",
    imagePath: "/memory-moments/moonlit-night.png?v=20260807",
    fallbackGlyph: "月",
    label: "月夜",
    hint: "凌晨 00:17，月亮替我记着。",
    edge: "top",
    offset: 74,
  },
] as const satisfies readonly MemoryMoment[];
