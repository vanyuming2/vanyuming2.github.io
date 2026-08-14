"use client";

import { useEffect, useRef, useState } from "react";
import type { BufferGeometry, Material, Object3D } from "three";

import {
  GARDEN_GRID_SIZE,
  gardenObjects,
  gardenTiles,
  type GardenObject,
  type GardenTileKind,
} from "./garden-data";
import styles from "./garden.module.css";

type SceneState = "loading" | "ready" | "error";

const GARDEN_CENTER = (GARDEN_GRID_SIZE - 1) / 2;

export default function GardenScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sceneState, setSceneState] = useState<SceneState>("loading");

  useEffect(() => {
    let cancelled = false;
    let disposeScene = () => {};

    const startScene = async () => {
      try {
        const [THREE, roundedBoxModule] = await Promise.all([
          import("three"),
          import("three/addons/geometries/RoundedBoxGeometry.js"),
        ]);

        if (cancelled) return;

        const host = hostRef.current;
        const canvas = canvasRef.current;
        if (!host || !canvas) return;

        const mobileQuery = window.matchMedia("(max-width: 720px)");
        const reducedMotionQuery = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );
        let isMobile = mobileQuery.matches;
        let reducedMotion = reducedMotionQuery.matches;
        let isOnscreen = true;
        let animationFrame = 0;
        let lastFrameTime = 0;

        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: false,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.setClearColor(0x151a16, 1);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#151a16");
        scene.fog = new THREE.FogExp2("#151a16", 0.025);

        const camera = new THREE.OrthographicCamera(-6, 6, 5, -5, 0.1, 80);
        const cameraTarget = new THREE.Vector3(0, 0.18, 0);
        camera.position.set(9.4, 10.8, 9.4);
        camera.lookAt(cameraTarget);

        const makeMaterial = (color: string) =>
          new THREE.MeshStandardMaterial({
            color,
            flatShading: true,
            metalness: 0,
            roughness: 0.82,
          });

        const materials = {
          islandSide: makeMaterial("#59462d"),
          grass: makeMaterial("#9dbb3e"),
          soil: makeMaterial("#8c5937"),
          flowerSoil: makeMaterial("#805032"),
          stone: makeMaterial("#d7d0be"),
          memorial: makeMaterial("#c7b978"),
          sand: makeMaterial("#d6b35e"),
          wood: makeMaterial("#a36734"),
          paleWood: makeMaterial("#c99852"),
          darkWood: makeMaterial("#68412a"),
          deepLeaf: makeMaterial("#405c30"),
          midLeaf: makeMaterial("#688340"),
          freshLeaf: makeMaterial("#9dae42"),
          flowerPink: makeMaterial("#e88ea4"),
          flowerCoral: makeMaterial("#e77a62"),
          flowerCream: makeMaterial("#f0d991"),
          gooseWhite: makeMaterial("#f1efe1"),
          gooseShade: makeMaterial("#c9c5b3"),
          orange: makeMaterial("#e79a36"),
          coral: makeMaterial("#e47962"),
          cream: makeMaterial("#eee5cf"),
          charcoal: makeMaterial("#31362f"),
          water: new THREE.MeshStandardMaterial({
            color: "#7fb5b4",
            flatShading: true,
            metalness: 0,
            opacity: 0.82,
            roughness: 0.38,
            transparent: true,
          }),
          glass: new THREE.MeshStandardMaterial({
            color: "#ffdf82",
            emissive: "#ffb43a",
            emissiveIntensity: 1.35,
            opacity: 0.88,
            roughness: 0.3,
            transparent: true,
          }),
        };

        const starMaterial = new THREE.MeshStandardMaterial({
          color: "#ffd66b",
          emissive: "#ffab31",
          emissiveIntensity: 1.45,
          flatShading: true,
          metalness: 0,
          roughness: 0.5,
        });

        const island = new THREE.Group();
        island.name = "our-little-garden";
        scene.add(island);

        const RoundedBoxGeometry = roundedBoxModule.RoundedBoxGeometry;

        const rounded = (
          width: number,
          height: number,
          depth: number,
          material: Material,
          radius = 0.06,
        ) => {
          const geometry = new RoundedBoxGeometry(
            width,
            height,
            depth,
            2,
            Math.min(radius, width / 4, height / 4, depth / 4),
          );
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          return mesh;
        };

        const markShadows = (object: Object3D, cast = true) => {
          object.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            child.castShadow = cast;
            child.receiveShadow = true;
          });
        };

        const toWorld = (column: number, row: number) => ({
          x: column - GARDEN_CENTER,
          z: row - GARDEN_CENTER,
        });

        const surfaceAt = (column: number, row: number) => {
          const tile = gardenTiles.find(
            (candidate) =>
              candidate.column === Math.round(column) &&
              candidate.row === Math.round(row),
          );
          if (!tile) return 0.16;
          if (tile.kind === "water") return tile.elevation + 0.08;
          return tile.elevation + 0.16;
        };

        const tileMaterial = (kind: GardenTileKind) => {
          switch (kind) {
            case "soil":
              return materials.soil;
            case "flower-soil":
              return materials.flowerSoil;
            case "stone":
              return materials.stone;
            case "memorial":
              return materials.memorial;
            case "water":
              return materials.water;
            case "sand":
              return materials.sand;
            case "wood":
              return materials.wood;
            case "entry":
              return materials.paleWood;
            default:
              return materials.grass;
          }
        };

        const dummy = new THREE.Object3D();
        const baseGeometry = new RoundedBoxGeometry(0.965, 0.54, 0.965, 1, 0.065);
        const baseTiles = new THREE.InstancedMesh(
          baseGeometry,
          materials.islandSide,
          gardenTiles.length,
        );
        gardenTiles.forEach((tile, index) => {
          const position = toWorld(tile.column, tile.row);
          dummy.position.set(position.x, -0.35, position.z);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          baseTiles.setMatrixAt(index, dummy.matrix);
        });
        baseTiles.instanceMatrix.needsUpdate = true;
        baseTiles.castShadow = true;
        baseTiles.receiveShadow = true;
        island.add(baseTiles);

        const tileKinds = Array.from(
          new Set(gardenTiles.map((tile) => tile.kind)),
        );
        tileKinds.forEach((kind) => {
          const matchingTiles = gardenTiles.filter((tile) => tile.kind === kind);
          const height = kind === "water" ? 0.12 : 0.24;
          const geometry = new RoundedBoxGeometry(0.94, height, 0.94, 1, 0.055);
          const mesh = new THREE.InstancedMesh(
            geometry,
            tileMaterial(kind),
            matchingTiles.length,
          );

          matchingTiles.forEach((tile, index) => {
            const position = toWorld(tile.column, tile.row);
            const centerY =
              tile.elevation + (kind === "water" ? 0.02 : 0.04);
            dummy.position.set(position.x, centerY, position.z);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            mesh.setMatrixAt(index, dummy.matrix);
          });

          mesh.instanceMatrix.needsUpdate = true;
          mesh.castShadow = kind !== "water";
          mesh.receiveShadow = true;
          island.add(mesh);
        });

        const starShape = (outerRadius: number, innerRadius: number) => {
          const shape = new THREE.Shape();
          for (let index = 0; index < 10; index += 1) {
            const angle = Math.PI / 2 + (index * Math.PI) / 5;
            const radius = index % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (index === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
          }
          shape.closePath();
          return shape;
        };

        const createStarGeometry = (
          outerRadius: number,
          innerRadius: number,
          depth: number,
        ) => {
          const geometry = new THREE.ExtrudeGeometry(
            starShape(outerRadius, innerRadius),
            {
              bevelEnabled: true,
              bevelSegments: 1,
              bevelSize: Math.min(0.035, depth / 3),
              bevelThickness: Math.min(0.035, depth / 3),
              depth,
              steps: 1,
            },
          );
          geometry.center();
          return geometry;
        };

        const animatedStar = new THREE.Group();
        let starLight: InstanceType<typeof THREE.PointLight> | null = null;
        const swayObjects: Object3D[] = [];
        const waterRings: Array<{
          mesh: InstanceType<typeof THREE.Mesh>;
          material: InstanceType<typeof THREE.MeshBasicMaterial>;
          offset: number;
        }> = [];
        let lanternLightCount = 0;

        const makePineTree = () => {
          const group = new THREE.Group();
          const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.11, 0.15, 0.62, 7),
            materials.darkWood,
          );
          trunk.position.y = 0.31;
          group.add(trunk);

          [
            { y: 0.62, radius: 0.5, height: 0.72, material: materials.deepLeaf },
            { y: 0.91, radius: 0.42, height: 0.66, material: materials.midLeaf },
            { y: 1.17, radius: 0.33, height: 0.58, material: materials.deepLeaf },
          ].forEach((layer) => {
            const crown = new THREE.Mesh(
              new THREE.ConeGeometry(layer.radius, layer.height, 8),
              layer.material,
            );
            crown.position.y = layer.y;
            crown.rotation.y = 0.18;
            group.add(crown);
          });
          swayObjects.push(group);
          return group;
        };

        const makeRoundTree = () => {
          const group = new THREE.Group();
          const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.13, 0.18, 1.02, 7),
            materials.darkWood,
          );
          trunk.position.y = 0.51;
          group.add(trunk);

          [
            [-0.24, 1.17, 0.05, 0.46, materials.deepLeaf],
            [0.18, 1.24, 0.03, 0.5, materials.midLeaf],
            [0.02, 1.52, -0.05, 0.46, materials.freshLeaf],
            [0.32, 1.48, 0.12, 0.34, materials.midLeaf],
          ].forEach(([x, y, z, radius, material]) => {
            const crown = new THREE.Mesh(
              new THREE.DodecahedronGeometry(radius as number, 1),
              material as Material,
            );
            crown.position.set(x as number, y as number, z as number);
            group.add(crown);
          });
          swayObjects.push(group);
          return group;
        };

        const makeStarLamp = () => {
          const group = new THREE.Group();
          const plinth = new THREE.Mesh(
            new THREE.CylinderGeometry(0.45, 0.52, 0.22, 10),
            materials.paleWood,
          );
          plinth.position.y = 0.11;
          group.add(plinth);

          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.31, 0.055, 6, 18),
            materials.cream,
          );
          ring.position.y = 0.25;
          ring.rotation.x = Math.PI / 2;
          group.add(ring);

          const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.09, 0.42, 8),
            materials.paleWood,
          );
          post.position.y = 0.49;
          group.add(post);

          const star = new THREE.Mesh(
            createStarGeometry(0.38, 0.19, 0.13),
            starMaterial,
          );
          animatedStar.position.y = 0.84;
          animatedStar.rotation.y = Math.PI / 4;
          animatedStar.add(star);
          group.add(animatedStar);

          starLight = new THREE.PointLight("#ffb33d", 2.1, 4.2, 2);
          starLight.position.y = 0.86;
          group.add(starLight);
          return group;
        };

        const makeSchoolDesk = () => {
          const group = new THREE.Group();
          const top = rounded(1.18, 0.12, 0.62, materials.paleWood, 0.045);
          top.position.y = 0.72;
          group.add(top);

          [-0.44, 0.44].forEach((x) => {
            [-0.2, 0.2].forEach((z) => {
              const leg = rounded(0.09, 0.65, 0.09, materials.darkWood, 0.025);
              leg.position.set(x, 0.35, z);
              group.add(leg);
            });
          });

          [-0.58, 0.58].forEach((z) => {
            const seat = rounded(0.9, 0.11, 0.27, materials.wood, 0.045);
            seat.position.set(0, 0.4, z);
            group.add(seat);
            [-0.32, 0.32].forEach((x) => {
              const leg = rounded(0.08, 0.35, 0.08, materials.darkWood, 0.02);
              leg.position.set(x, 0.19, z);
              group.add(leg);
            });
          });
          return group;
        };

        const makeGoose = () => {
          const group = new THREE.Group();
          const body = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.32, 1),
            materials.gooseWhite,
          );
          body.position.y = 0.32;
          body.scale.set(1.22, 0.78, 0.82);
          group.add(body);

          const wing = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.2, 1),
            materials.gooseShade,
          );
          wing.position.set(0.18, 0.37, 0.02);
          wing.scale.set(0.42, 0.65, 1.12);
          group.add(wing);

          const neck = new THREE.Mesh(
            new THREE.CylinderGeometry(0.075, 0.095, 0.43, 8),
            materials.gooseWhite,
          );
          neck.position.set(0, 0.59, -0.25);
          neck.rotation.x = -0.18;
          group.add(neck);

          const head = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.15, 1),
            materials.gooseWhite,
          );
          head.position.set(0, 0.82, -0.3);
          group.add(head);

          const beak = new THREE.Mesh(
            new THREE.ConeGeometry(0.09, 0.18, 4),
            materials.orange,
          );
          beak.position.set(0, 0.8, -0.48);
          beak.rotation.x = -Math.PI / 2;
          beak.rotation.y = Math.PI / 4;
          beak.scale.y = 0.72;
          group.add(beak);

          [-0.12, 0.12].forEach((x) => {
            const foot = rounded(0.12, 0.035, 0.19, materials.orange, 0.018);
            foot.position.set(x, 0.05, -0.03);
            group.add(foot);
          });
          return group;
        };

        const makeStarfish = () => {
          const group = new THREE.Group();
          const starfish = new THREE.Mesh(
            createStarGeometry(0.31, 0.13, 0.07),
            materials.coral,
          );
          starfish.position.y = 0.08;
          starfish.rotation.x = -Math.PI / 2;
          starfish.rotation.z = 0.1;
          group.add(starfish);

          [
            [-0.3, -0.16, 0.1],
            [0.34, 0.14, 0.08],
          ].forEach(([x, z, size]) => {
            const stone = new THREE.Mesh(
              new THREE.DodecahedronGeometry(size, 0),
              materials.cream,
            );
            stone.position.set(x, size * 0.62, z);
            stone.scale.y = 0.65;
            group.add(stone);
          });
          return group;
        };

        const makeMailbox = () => {
          const group = new THREE.Group();
          const post = rounded(0.13, 0.72, 0.13, materials.darkWood, 0.03);
          post.position.y = 0.36;
          group.add(post);

          const body = rounded(0.54, 0.4, 0.38, materials.cream, 0.1);
          body.position.set(0, 0.82, 0);
          group.add(body);

          const roof = rounded(0.58, 0.13, 0.42, materials.flowerCoral, 0.055);
          roof.position.set(0, 1.05, 0);
          group.add(roof);

          const slot = rounded(0.27, 0.035, 0.025, materials.darkWood, 0.01);
          slot.position.set(0, 0.88, 0.2);
          group.add(slot);

          const flagPost = rounded(0.045, 0.35, 0.045, materials.flowerCoral, 0.012);
          flagPost.position.set(0.34, 0.92, 0);
          group.add(flagPost);
          const flag = rounded(0.2, 0.13, 0.04, materials.flowerCoral, 0.02);
          flag.position.set(0.41, 1.08, 0);
          group.add(flag);
          return group;
        };

        const makeFlowerBed = () => {
          const group = new THREE.Group();
          const flowerMaterials = [
            materials.flowerPink,
            materials.flowerCoral,
            materials.flowerCream,
          ];
          const positions = [
            [-0.55, -0.34],
            [-0.2, -0.42],
            [0.18, -0.32],
            [0.5, -0.4],
            [-0.46, 0.02],
            [-0.08, 0],
            [0.31, 0.02],
            [0.58, 0.12],
            [-0.31, 0.38],
            [0.12, 0.35],
            [0.5, 0.42],
          ];

          positions.forEach(([x, z], index) => {
            const flower = new THREE.Group();
            const stem = new THREE.Mesh(
              new THREE.CylinderGeometry(0.018, 0.025, 0.26, 5),
              materials.deepLeaf,
            );
            stem.position.y = 0.13;
            flower.add(stem);

            const head = new THREE.Mesh(
              new THREE.DodecahedronGeometry(0.095, 0),
              flowerMaterials[index % flowerMaterials.length],
            );
            head.position.y = 0.29;
            head.scale.y = 0.75;
            flower.add(head);
            flower.position.set(x, 0, z);
            flower.scale.setScalar(0.86 + (index % 3) * 0.08);
            group.add(flower);
            swayObjects.push(flower);
          });
          return group;
        };

        const makeFence = () => {
          const group = new THREE.Group();
          for (let index = 0; index < 6; index += 1) {
            const post = rounded(0.11, 0.58, 0.11, materials.paleWood, 0.03);
            post.position.set((index - 2.5) * 0.62, 0.29, 0);
            group.add(post);
          }
          [0.2, 0.43].forEach((y) => {
            const rail = rounded(3.2, 0.09, 0.08, materials.wood, 0.025);
            rail.position.set(0, y, 0.01);
            group.add(rail);
          });
          return group;
        };

        const makeBench = () => {
          const group = new THREE.Group();
          const seat = rounded(1.16, 0.13, 0.42, materials.wood, 0.055);
          seat.position.y = 0.42;
          group.add(seat);

          const back = rounded(1.16, 0.48, 0.1, materials.paleWood, 0.045);
          back.position.set(0, 0.68, 0.18);
          back.rotation.x = -0.08;
          group.add(back);

          [-0.42, 0.42].forEach((x) => {
            const leg = rounded(0.09, 0.4, 0.09, materials.darkWood, 0.02);
            leg.position.set(x, 0.2, 0);
            group.add(leg);
          });

          const cushion = rounded(0.43, 0.12, 0.34, starMaterial, 0.08);
          cushion.position.set(0.27, 0.52, -0.02);
          cushion.rotation.y = 0.08;
          group.add(cushion);
          return group;
        };

        const makeTeaTable = () => {
          const group = new THREE.Group();
          const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.09, 0.14, 0.42, 8),
            materials.darkWood,
          );
          stem.position.y = 0.21;
          group.add(stem);

          const top = new THREE.Mesh(
            new THREE.CylinderGeometry(0.47, 0.47, 0.12, 12),
            materials.paleWood,
          );
          top.position.y = 0.46;
          group.add(top);

          [-0.16, 0.16].forEach((x, index) => {
            const cup = new THREE.Mesh(
              new THREE.CylinderGeometry(0.075, 0.065, 0.13, 8),
              index === 0 ? materials.cream : materials.flowerPink,
            );
            cup.position.set(x, 0.59, 0);
            group.add(cup);
          });
          return group;
        };

        const makePottedPlant = () => {
          const group = new THREE.Group();
          const pot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.19, 0.32, 7),
            materials.flowerCoral,
          );
          pot.position.y = 0.16;
          group.add(pot);

          [
            [-0.16, 0.52, -0.02, -0.55],
            [0.14, 0.59, 0.02, 0.48],
            [0, 0.68, -0.05, 0],
            [0.08, 0.48, 0.14, 0.22],
          ].forEach(([x, y, z, rotation]) => {
            const leaf = new THREE.Mesh(
              new THREE.DodecahedronGeometry(0.2, 1),
              materials.freshLeaf,
            );
            leaf.position.set(x, y, z);
            leaf.scale.set(0.48, 1.18, 0.3);
            leaf.rotation.z = rotation;
            group.add(leaf);
          });
          swayObjects.push(group);
          return group;
        };

        const makeLantern = () => {
          const group = new THREE.Group();
          const base = rounded(0.34, 0.1, 0.34, materials.darkWood, 0.035);
          base.position.y = 0.05;
          group.add(base);
          const cap = rounded(0.31, 0.08, 0.31, materials.darkWood, 0.03);
          cap.position.y = 0.62;
          group.add(cap);

          [-0.13, 0.13].forEach((x) => {
            [-0.13, 0.13].forEach((z) => {
              const post = rounded(0.035, 0.52, 0.035, materials.charcoal, 0.01);
              post.position.set(x, 0.34, z);
              group.add(post);
            });
          });

          const glow = rounded(0.18, 0.35, 0.18, materials.glass, 0.06);
          glow.position.y = 0.34;
          glow.castShadow = false;
          group.add(glow);

          if (lanternLightCount === 0) {
            const light = new THREE.PointLight("#ffd36a", 0.82, 2.4, 2);
            light.position.y = 0.36;
            group.add(light);
          }
          lanternLightCount += 1;
          return group;
        };

        const makeWildGrass = () => {
          const group = new THREE.Group();
          [-0.22, -0.08, 0.08, 0.23].forEach((x, index) => {
            const blade = new THREE.Mesh(
              new THREE.ConeGeometry(0.055, 0.38 + (index % 2) * 0.09, 5),
              index % 2 ? materials.freshLeaf : materials.midLeaf,
            );
            blade.position.set(x, 0.19, (index - 1.5) * 0.04);
            blade.rotation.z = (index - 1.5) * 0.12;
            group.add(blade);
          });
          swayObjects.push(group);
          return group;
        };

        const makeStones = () => {
          const group = new THREE.Group();
          [
            [-0.24, 0.12, 0.19],
            [0.08, 0.1, 0.15],
            [0.28, 0.05, 0.1],
          ].forEach(([x, z, size], index) => {
            const stone = new THREE.Mesh(
              new THREE.DodecahedronGeometry(size, 0),
              index % 2 ? materials.stone : materials.cream,
            );
            stone.position.set(x, size * 0.62, z);
            stone.scale.y = 0.65;
            stone.rotation.set(0.2, index * 0.6, 0.1);
            group.add(stone);
          });
          return group;
        };

        const makeGardenObject = (object: GardenObject) => {
          switch (object.kind) {
            case "star-lamp":
              return makeStarLamp();
            case "school-desk":
              return makeSchoolDesk();
            case "white-goose":
              return makeGoose();
            case "starfish":
              return makeStarfish();
            case "mailbox":
              return makeMailbox();
            case "pine-tree":
              return makePineTree();
            case "round-tree":
              return makeRoundTree();
            case "flower-bed":
              return makeFlowerBed();
            case "fence":
              return makeFence();
            case "bench":
              return makeBench();
            case "tea-table":
              return makeTeaTable();
            case "potted-plant":
              return makePottedPlant();
            case "lantern":
              return makeLantern();
            case "wild-grass":
              return makeWildGrass();
            case "stones":
              return makeStones();
          }
        };

        gardenObjects.forEach((object) => {
          const model = makeGardenObject(object);
          const position = toWorld(object.column, object.row);
          model.position.set(
            position.x,
            surfaceAt(object.column, object.row),
            position.z,
          );
          model.rotation.y = object.rotation ?? 0;
          model.scale.setScalar(object.scale ?? 1);
          model.userData.memoryId = object.id;
          markShadows(model);
          island.add(model);
        });

        // A simple stone rim makes the four water tiles read as one small pond.
        const pondCenter = toWorld(0.5, 4.5);
        const pondRim = new THREE.Group();
        [
          [0, -1.02, 2.08, 0.12],
          [0, 1.02, 2.08, 0.12],
        ].forEach(([x, z, width, depth]) => {
          const edge = rounded(width, 0.17, depth, materials.cream, 0.045);
          edge.position.set(x, 0.08, z);
          pondRim.add(edge);
        });
        [
          [-1.02, 0],
          [1.02, 0],
        ].forEach(([x, z]) => {
          const edge = rounded(0.12, 0.17, 2.08, materials.cream, 0.045);
          edge.position.set(x, 0.08, z);
          pondRim.add(edge);
        });
        pondRim.position.set(pondCenter.x, 0.02, pondCenter.z);
        markShadows(pondRim);
        island.add(pondRim);

        [0, 2.25].forEach((offset) => {
          const material = new THREE.MeshBasicMaterial({
            color: "#d8f0dc",
            opacity: 0.24,
            transparent: true,
          });
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.22, 0.015, 5, 24),
            material,
          );
          ring.position.set(pondCenter.x - 0.18, 0.11, pondCenter.z + 0.15);
          ring.rotation.x = Math.PI / 2;
          ring.castShadow = false;
          island.add(ring);
          waterRings.push({ mesh: ring, material, offset });
        });

        // A loose strand of lights carries the warm handmade feeling of the reference.
        const stringLights = new THREE.Group();
        const lightStart = toWorld(2.35, 2.15);
        const lightEnd = toWorld(5.65, 2.15);
        [lightStart.x, lightEnd.x].forEach((x) => {
          const pole = rounded(0.07, 1.32, 0.07, materials.darkWood, 0.018);
          pole.position.set(x, 0.66, lightStart.z);
          stringLights.add(pole);
        });
        for (let index = 0; index < 9; index += 1) {
          const progress = index / 8;
          const bulb = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.055, 1),
            materials.glass,
          );
          bulb.position.set(
            THREE.MathUtils.lerp(lightStart.x, lightEnd.x, progress),
            1.28 - Math.sin(progress * Math.PI) * 0.2,
            lightStart.z,
          );
          bulb.castShadow = false;
          stringLights.add(bulb);
        }
        island.add(stringLights);

        const halo = new THREE.Mesh(
          new THREE.CircleGeometry(5.2, 48),
          new THREE.MeshBasicMaterial({
            color: "#778449",
            depthWrite: false,
            opacity: 0.075,
            transparent: true,
          }),
        );
        halo.position.y = -0.82;
        halo.rotation.x = -Math.PI / 2;
        halo.scale.set(1.25, 0.72, 1);
        scene.add(halo);

        const hemisphere = new THREE.HemisphereLight("#d9e1c5", "#3a2f24", 1.25);
        scene.add(hemisphere);

        const keyLight = new THREE.DirectionalLight("#fff1c5", 2.15);
        keyLight.position.set(6, 11, 7);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(isMobile ? 512 : 1024, isMobile ? 512 : 1024);
        keyLight.shadow.camera.left = -7;
        keyLight.shadow.camera.right = 7;
        keyLight.shadow.camera.top = 7;
        keyLight.shadow.camera.bottom = -7;
        keyLight.shadow.camera.near = 1;
        keyLight.shadow.camera.far = 28;
        keyLight.shadow.bias = -0.0008;
        scene.add(keyLight);

        const fillLight = new THREE.AmbientLight("#93866a", 0.22);
        scene.add(fillLight);

        const seededRandom = (() => {
          let seed = 41729;
          return () => {
            seed += 0x6d2b79f5;
            let value = seed;
            value = Math.imul(value ^ (value >>> 15), value | 1);
            value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
            return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
          };
        })();

        const starPositions: number[] = [];
        for (let index = 0; index < 74; index += 1) {
          const angle = seededRandom() * Math.PI * 2;
          const distance = 9 + seededRandom() * 18;
          starPositions.push(
            Math.cos(angle) * distance,
            -1 + seededRandom() * 17,
            Math.sin(angle) * distance,
          );
        }
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(starPositions, 3),
        );
        const starField = new THREE.Points(
          starGeometry,
          new THREE.PointsMaterial({
            color: "#fff3c4",
            opacity: 0.62,
            size: 0.085,
            sizeAttenuation: true,
            transparent: true,
          }),
        );
        scene.add(starField);

        const fireflyPositions: number[] = [];
        for (let index = 0; index < (isMobile ? 9 : 14); index += 1) {
          fireflyPositions.push(
            (seededRandom() - 0.5) * 6.4,
            0.55 + seededRandom() * 1.25,
            (seededRandom() - 0.5) * 5.8,
          );
        }
        const fireflyGeometry = new THREE.BufferGeometry();
        fireflyGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(fireflyPositions, 3),
        );
        const fireflyMaterial = new THREE.PointsMaterial({
          blending: THREE.AdditiveBlending,
          color: "#ffd66b",
          depthWrite: false,
          opacity: 0.72,
          size: 0.11,
          sizeAttenuation: true,
          transparent: true,
        });
        const fireflies = new THREE.Points(fireflyGeometry, fireflyMaterial);
        island.add(fireflies);

        const render = () => renderer.render(scene, camera);

        const resize = () => {
          const width = Math.max(1, host.clientWidth);
          const height = Math.max(1, host.clientHeight);
          const aspect = width / height;
          const viewWidth = width <= 720 ? 12.7 : 12.2;
          const viewHeight = Math.max(9.6, viewWidth / aspect);

          isMobile = mobileQuery.matches;
          renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5),
          );
          renderer.setSize(width, height, false);
          camera.left = -viewWidth / 2;
          camera.right = viewWidth / 2;
          camera.top = viewHeight / 2;
          camera.bottom = -viewHeight / 2;
          camera.updateProjectionMatrix();
          render();
        };

        const animate = (time: number) => {
          animationFrame = window.requestAnimationFrame(animate);
          if (reducedMotion || !isOnscreen || document.hidden) return;
          if (time - lastFrameTime < 1000 / 30) return;
          lastFrameTime = time;

          const seconds = time / 1000;
          island.position.y = Math.sin(seconds * 0.72) * 0.035;
          animatedStar.scale.setScalar(1 + Math.sin(seconds * 1.8) * 0.025);
          starMaterial.emissiveIntensity = 1.42 + Math.sin(seconds * 1.8) * 0.26;
          if (starLight) starLight.intensity = 2.05 + Math.sin(seconds * 1.8) * 0.34;

          swayObjects.forEach((object, index) => {
            object.rotation.z =
              Math.sin(seconds * (0.7 + (index % 4) * 0.08) + index) * 0.012;
          });

          waterRings.forEach(({ mesh, material, offset }) => {
            const progress = ((seconds + offset) % 4.5) / 4.5;
            mesh.scale.setScalar(0.65 + progress * 1.8);
            material.opacity = (1 - progress) * 0.23;
          });

          fireflies.rotation.y = seconds * 0.035;
          fireflies.position.y = Math.sin(seconds * 0.9) * 0.08;
          fireflyMaterial.opacity = 0.58 + Math.sin(seconds * 1.35) * 0.16;
          starField.rotation.y = seconds * 0.0025;
          render();
        };

        const handleReducedMotionChange = () => {
          reducedMotion = reducedMotionQuery.matches;
          if (reducedMotion) {
            island.position.y = 0;
            animatedStar.scale.setScalar(1);
            swayObjects.forEach((object) => {
              object.rotation.z = 0;
            });
            render();
          }
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);

        const intersectionObserver = new IntersectionObserver(
          ([entry]) => {
            isOnscreen = entry?.isIntersecting ?? true;
          },
          { threshold: 0.02 },
        );
        intersectionObserver.observe(host);

        const handleVisibilityChange = () => {
          if (!document.hidden) render();
        };

        mobileQuery.addEventListener("change", resize);
        reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        resize();
        render();
        animationFrame = window.requestAnimationFrame(animate);
        setSceneState("ready");

        disposeScene = () => {
          window.cancelAnimationFrame(animationFrame);
          resizeObserver.disconnect();
          intersectionObserver.disconnect();
          mobileQuery.removeEventListener("change", resize);
          reducedMotionQuery.removeEventListener(
            "change",
            handleReducedMotionChange,
          );
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );

          const geometries = new Set<BufferGeometry>();
          const disposableMaterials = new Set<Material>();
          scene.traverse((object) => {
            const renderable = object as Object3D & {
              geometry?: BufferGeometry;
              material?: Material | Material[];
            };
            if (renderable.geometry) geometries.add(renderable.geometry);
            if (Array.isArray(renderable.material)) {
              renderable.material.forEach((material) =>
                disposableMaterials.add(material),
              );
            } else if (renderable.material) {
              disposableMaterials.add(renderable.material);
            }
          });
          geometries.forEach((geometry) => geometry.dispose());
          disposableMaterials.forEach((material) => material.dispose());
          renderer.renderLists.dispose();
          renderer.dispose();
        };
      } catch (error) {
        console.error("Unable to start the memory garden", error);
        if (!cancelled) setSceneState("error");
      }
    };

    void startScene();

    return () => {
      cancelled = true;
      disposeScene();
    };
  }, []);

  return (
    <div
      className={styles.sceneHost}
      data-scene-state={sceneState}
      ref={hostRef}
    >
      <canvas aria-hidden="true" className={styles.gardenCanvas} ref={canvasRef} />

      <p className={styles.sceneDescription}>
        星空中漂浮着一座低多边形小花园。花园里有池塘边的大白鹅、沙地上的海星、两个人的课桌、暖黄星星灯、花圃、茶桌和一只小邮箱。
      </p>

      {sceneState !== "ready" && (
        <div className={styles.sceneStatus} role="status" aria-live="polite">
          <span aria-hidden="true">✦</span>
          <p>
            {sceneState === "error"
              ? "这台设备暂时画不出花园，但它还好好地在这里。"
              : "小花园正在慢慢亮起来…"}
          </p>
        </div>
      )}
    </div>
  );
}
