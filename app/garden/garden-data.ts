export const GARDEN_GRID_SIZE = 8;

export type GardenTileKind =
  | "grass"
  | "soil"
  | "flower-soil"
  | "stone"
  | "memorial"
  | "water"
  | "sand"
  | "wood"
  | "entry";

export type GardenTile = {
  column: number;
  row: number;
  kind: GardenTileKind;
  elevation: number;
};

export type GardenObjectKind =
  | "star-lamp"
  | "school-desk"
  | "white-goose"
  | "starfish"
  | "mailbox"
  | "pine-tree"
  | "round-tree"
  | "flower-bed"
  | "fence"
  | "bench"
  | "tea-table"
  | "potted-plant"
  | "lantern"
  | "wild-grass"
  | "stones";

export type GardenObject = {
  id: string;
  kind: GardenObjectKind;
  column: number;
  row: number;
  rotation?: number;
  scale?: number;
};

const tileLegend: Record<string, GardenTileKind> = {
  g: "grass",
  t: "soil",
  f: "flower-soil",
  p: "stone",
  c: "memorial",
  w: "water",
  s: "sand",
  d: "wood",
  e: "entry",
};

const tileElevations: Partial<Record<GardenTileKind, number>> = {
  "flower-soil": 0.08,
  memorial: 0.18,
  water: -0.08,
  entry: 0.05,
};

// Kept as a tiny text map so the garden can grow without rebuilding the scene.
const tileRows = [
  "-tgggff-",
  "ttgddffg",
  "ggppppgg",
  "ggpcppgg",
  "wwpppgss",
  "wwggggss",
  "gggggggg",
  "-ggeegg-",
] as const;

export const gardenTiles: readonly GardenTile[] = tileRows.flatMap(
  (rowTiles, row) =>
    Array.from(rowTiles).flatMap((token, column) => {
      const kind = tileLegend[token];
      if (!kind) return [];

      return [
        {
          column,
          row,
          kind,
          elevation: tileElevations[kind] ?? 0,
        },
      ];
    }),
);

// Every object has its own id and grid position. Later, placing, rotating and
// saving the garden can work directly with this same data shape.
export const gardenObjects: readonly GardenObject[] = [
  { id: "zero-seventeen", kind: "star-lamp", column: 3, row: 3 },
  {
    id: "shared-desk",
    kind: "school-desk",
    column: 3.5,
    row: 1,
    rotation: 0,
  },
  {
    id: "pond-goose",
    kind: "white-goose",
    column: 1.75,
    row: 5.25,
    rotation: -0.5,
    scale: 0.92,
  },
  {
    id: "island-starfish",
    kind: "starfish",
    column: 6.55,
    row: 4.7,
    rotation: 0.35,
  },
  {
    id: "memory-mailbox",
    kind: "mailbox",
    column: 4.35,
    row: 7,
    rotation: -0.08,
  },
  {
    id: "pine-one",
    kind: "pine-tree",
    column: 0.25,
    row: 1.05,
    scale: 0.92,
  },
  {
    id: "pine-two",
    kind: "pine-tree",
    column: 1.22,
    row: 0.15,
    scale: 1.12,
  },
  {
    id: "round-tree",
    kind: "round-tree",
    column: 7,
    row: 1.15,
    scale: 1.02,
  },
  {
    id: "small-flower-bed",
    kind: "flower-bed",
    column: 5.45,
    row: 0.55,
  },
  {
    id: "back-fence",
    kind: "fence",
    column: 4.15,
    row: -0.05,
  },
  {
    id: "two-person-bench",
    kind: "bench",
    column: 5.05,
    row: 3.05,
    rotation: 0.12,
  },
  {
    id: "little-tea-table",
    kind: "tea-table",
    column: 3.55,
    row: 5.35,
  },
  {
    id: "front-pot",
    kind: "potted-plant",
    column: 1.35,
    row: 6.75,
    scale: 0.9,
  },
  {
    id: "pond-lantern",
    kind: "lantern",
    column: 2.05,
    row: 3.75,
    scale: 0.92,
  },
  {
    id: "flower-lantern",
    kind: "lantern",
    column: 6.3,
    row: 2.05,
    scale: 0.78,
  },
  {
    id: "quiet-grass",
    kind: "wild-grass",
    column: 5.7,
    row: 6.35,
  },
  {
    id: "pond-stones",
    kind: "stones",
    column: 0.45,
    row: 6.25,
    rotation: 0.4,
  },
] as const;
