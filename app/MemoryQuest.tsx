"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { memoryMoments, type MemoryMoment } from "./memory-moments";

type Point = {
  x: number;
  y: number;
};

type DirectionName = "up" | "right" | "down" | "left";

type Direction = Point & {
  name: DirectionName;
};

type GameStatus = "ready" | "playing" | "failed" | "complete";

type FireworkBurst = {
  id: number;
  x: number;
  y: number;
};

const BOARD_COLUMNS = 14;
const BOARD_ROWS = 10;
const MEMORY_GOAL = memoryMoments.length;
const GAME_TICK_MS = 270;
const SNAKE_MOTION_MS = 230;
const FIREWORK_PARTICLES = 12;

const DIRECTIONS: Record<DirectionName, Direction> = {
  up: { name: "up", x: 0, y: -1 },
  right: { name: "right", x: 1, y: 0 },
  down: { name: "down", x: 0, y: 1 },
  left: { name: "left", x: -1, y: 0 },
};

const KEY_DIRECTIONS: Record<string, DirectionName> = {
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowRight: "right",
  d: "right",
  D: "right",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
};

const INITIAL_SNAKE: readonly Point[] = [
  { x: 6, y: 5 },
  { x: 5, y: 5 },
  { x: 4, y: 5 },
];

const INITIAL_TARGET: Point = { x: 10, y: 5 };

function cloneInitialSnake() {
  return INITIAL_SNAKE.map((point) => ({ ...point }));
}

function pointsMatch(first: Point, second: Point) {
  return first.x === second.x && first.y === second.y;
}

function isOpposite(first: Direction, second: Direction) {
  return first.x + second.x === 0 && first.y + second.y === 0;
}

function wrapCoordinate(value: number, maximum: number) {
  return ((value - 1 + maximum) % maximum) + 1;
}

function areDirectNeighbors(first: Point, second: Point) {
  return Math.abs(first.x - second.x) + Math.abs(first.y - second.y) === 1;
}

function pickOpenTargetCell(snake: readonly Point[]): Point {
  const openCells: Point[] = [];

  for (let y = 1; y <= BOARD_ROWS; y += 1) {
    for (let x = 1; x <= BOARD_COLUMNS; x += 1) {
      const point = { x, y };
      if (!snake.some((segment) => pointsMatch(segment, point))) {
        openCells.push(point);
      }
    }
  }

  return (
    openCells[Math.floor(Math.random() * openCells.length)] ?? INITIAL_TARGET
  );
}

function getMomentEdgeStyle(moment: MemoryMoment) {
  return {
    "--memory-edge-offset": `${moment.offset}%`,
  } as CSSProperties;
}

function getParticleStyle(index: number) {
  return {
    "--memory-particle-angle": `${index * (360 / FIREWORK_PARTICLES)}deg`,
    "--memory-particle-distance": `${34 + (index % 3) * 8}px`,
    "--memory-particle-delay": `${(index % 4) * 18}ms`,
  } as CSSProperties;
}

function getFacingAngle(facing: DirectionName) {
  if (facing === "down") return Math.PI / 2;
  if (facing === "left") return Math.PI;
  if (facing === "up") return -Math.PI / 2;
  return 0;
}

function StarlightSnake({
  snake,
  facing,
}: {
  snake: readonly Point[];
  facing: DirectionName;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previousSnakeRef = useRef<Point[]>(
    snake.map((segment) => ({ ...segment })),
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const previousSnake = previousSnakeRef.current;
    previousSnakeRef.current = snake.map((segment) => ({ ...segment }));

    const startSnake = snake.map((target, index) => {
      const previous =
        previousSnake[Math.min(index, previousSnake.length - 1)] ?? target;
      const crossedEdge =
        Math.abs(previous.x - target.x) > 1 ||
        Math.abs(previous.y - target.y) > 1;

      return crossedEdge ? { ...target } : { ...previous };
    });

    let latestSnake = startSnake;
    let animationFrame = 0;

    const drawSnake = (points: readonly Point[]) => {
      const bounds = canvas.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.max(1, Math.round(bounds.width * pixelRatio));
      const pixelHeight = Math.max(1, Math.round(bounds.height * pixelRatio));

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      const context = canvas.getContext("2d");
      if (!context) return;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, bounds.width, bounds.height);
      context.imageSmoothingEnabled = true;

      const cellWidth = bounds.width / BOARD_COLUMNS;
      const cellHeight = bounds.height / BOARD_ROWS;
      const cellSize = Math.min(cellWidth, cellHeight);
      const bodyWidth = cellSize * 0.48;
      const toCanvasPoint = (point: Point) => ({
        x: (point.x - 0.5) * cellWidth,
        y: (point.y - 0.5) * cellHeight,
      });

      const runs: Point[][] = [];
      points.forEach((point, index) => {
        const previousTarget = snake[index - 1];
        const currentTarget = snake[index];
        const startsNewRun =
          index === 0 ||
          !previousTarget ||
          !currentTarget ||
          !areDirectNeighbors(previousTarget, currentTarget);

        if (startsNewRun) {
          runs.push([point]);
        } else {
          runs[runs.length - 1].push(point);
        }
      });

      const smoothRun = (run: readonly Point[]) => {
        let smoothed = run.map(toCanvasPoint);

        for (let pass = 0; pass < 2 && smoothed.length > 2; pass += 1) {
          const refined: Point[] = [smoothed[0]];

          for (let index = 0; index < smoothed.length - 1; index += 1) {
            const current = smoothed[index];
            const next = smoothed[index + 1];
            refined.push(
              {
                x: current.x * 0.75 + next.x * 0.25,
                y: current.y * 0.75 + next.y * 0.25,
              },
              {
                x: current.x * 0.25 + next.x * 0.75,
                y: current.y * 0.25 + next.y * 0.75,
              },
            );
          }

          refined.push(smoothed[smoothed.length - 1]);
          smoothed = refined;
        }

        const sampled: Point[] = [];
        smoothed.forEach((current, index) => {
          const next = smoothed[index + 1];
          if (!next) {
            if (sampled.length === 0) sampled.push(current);
            return;
          }

          if (index === 0) sampled.push(current);
          for (let step = 1; step <= 8; step += 1) {
            const progress = step / 8;
            sampled.push({
              x: current.x + (next.x - current.x) * progress,
              y: current.y + (next.y - current.y) * progress,
            });
          }
        });

        return sampled;
      };

      const canvasRuns = runs.map(smoothRun);
      const totalLength = canvasRuns.reduce((total, run) => {
        return run.slice(1).reduce((runLength, point, index) => {
          const previous = run[index];
          return runLength + Math.hypot(point.x - previous.x, point.y - previous.y);
        }, total);
      }, 0);
      const getBodyWidth = (progress: number) => {
        const taper = Math.max(0, Math.min(1, (progress - 0.55) / 0.45));
        const smoothTaper = taper * taper * (3 - 2 * taper);
        return bodyWidth * (1 - smoothTaper * 0.72);
      };
      const bodySegments: Array<{
        from: Point;
        to: Point;
        width: number;
      }> = [];
      let travelled = 0;

      canvasRuns.forEach((run) => {
        run.slice(1).forEach((point, index) => {
          const previous = run[index];
          const length = Math.hypot(
            point.x - previous.x,
            point.y - previous.y,
          );
          if (length <= 0) return;

          const progress =
            totalLength > 0 ? (travelled + length / 2) / totalLength : 0;
          bodySegments.push({
            from: previous,
            to: point,
            width: getBodyWidth(progress),
          });
          travelled += length;
        });
      });

      context.save();
      context.fillStyle = "#b8a36c";
      context.strokeStyle = "#b8a36c";
      context.lineCap = "round";
      context.lineJoin = "round";
      context.shadowColor = "rgba(16, 14, 9, 0.22)";
      context.shadowBlur = cellSize * 0.08;

      for (let index = bodySegments.length - 1; index >= 0; index -= 1) {
        const segment = bodySegments[index];
        context.beginPath();
        context.moveTo(segment.from.x, segment.from.y);
        context.lineTo(segment.to.x, segment.to.y);
        context.lineWidth = segment.width;
        context.stroke();
      }

      canvasRuns.forEach((run, index) => {
        if (run.length !== 1) return;
        const point = run[0];
        const progress = canvasRuns.length === 1 ? 0 : index / (canvasRuns.length - 1);
        const width = getBodyWidth(progress);
        context.beginPath();
        context.arc(point.x, point.y, width / 2, 0, Math.PI * 2);
        context.fill();
      });
      context.restore();

      const head = points[0];
      if (!head) return;

      const headPoint = toCanvasPoint(head);
      context.save();
      context.translate(headPoint.x, headPoint.y);
      context.rotate(getFacingAngle(facing));
      context.beginPath();
      context.ellipse(
        0,
        0,
        cellSize * 0.42,
        cellSize * 0.3,
        0,
        0,
        Math.PI * 2,
      );
      context.fillStyle = "#e3bd59";
      context.shadowColor = "rgba(244, 201, 93, 0.3)";
      context.shadowBlur = cellSize * 0.2;
      context.fill();
      context.shadowBlur = 0;
      context.strokeStyle = "rgba(255, 242, 198, 0.32)";
      context.lineWidth = Math.max(1, cellSize * 0.025);
      context.stroke();

      const eyeRadius = Math.max(1.2, cellSize * 0.04);
      context.fillStyle = "#3c3324";
      context.beginPath();
      context.arc(
        cellSize * 0.16,
        -cellSize * 0.12,
        eyeRadius,
        0,
        Math.PI * 2,
      );
      context.arc(
        cellSize * 0.16,
        cellSize * 0.12,
        eyeRadius,
        0,
        Math.PI * 2,
      );
      context.fill();
      context.restore();
    };

    const resizeObserver = new ResizeObserver(() => drawSnake(latestSnake));
    resizeObserver.observe(canvas);

    const startedAt = performance.now();
    const animate = (time: number) => {
      const progress = Math.min((time - startedAt) / SNAKE_MOTION_MS, 1);
      latestSnake = snake.map((target, index) => {
        const start = startSnake[index] ?? target;
        return {
          x: start.x + (target.x - start.x) * progress,
          y: start.y + (target.y - start.y) * progress,
        };
      });
      drawSnake(latestSnake);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [facing, snake]);

  return <canvas ref={canvasRef} className="starlightSnakeCanvas" aria-hidden />;
}

export default function MemoryQuest() {
  const invitationTitleId = useId();
  const gameTitleId = useId();
  const launchButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const burstIdRef = useRef(0);
  const burstTimersRef = useRef<number[]>([]);

  const snakeRef = useRef<Point[]>(cloneInitialSnake());
  const targetRef = useRef<Point>(INITIAL_TARGET);
  const scoreRef = useRef(0);
  const directionRef = useRef<Direction>(DIRECTIONS.right);
  const turnLockedRef = useRef(false);

  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [bursts, setBursts] = useState<FireworkBurst[]>([]);
  const [announcement, setAnnouncement] = useState(
    `页面边缘藏着 ${memoryMoments.length} 件小东西。`,
  );
  const [activeMoment, setActiveMoment] = useState<MemoryMoment | null>(null);
  const [gameOpen, setGameOpen] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>("ready");
  const [snake, setSnake] = useState<Point[]>(cloneInitialSnake);
  const [target, setTarget] = useState<Point>(INITIAL_TARGET);
  const [score, setScore] = useState(0);
  const [facing, setFacing] = useState<DirectionName>("right");

  const allMomentsCollected = collectedIds.length === memoryMoments.length;
  const currentTarget =
    memoryMoments[Math.min(score, memoryMoments.length - 1)];

  useEffect(() => {
    if (!activeMoment) return;

    const messageTimer = window.setTimeout(() => setActiveMoment(null), 6_200);
    return () => window.clearTimeout(messageTimer);
  }, [activeMoment]);

  const resetGame = useCallback((nextStatus: GameStatus = "playing") => {
    const freshSnake = cloneInitialSnake();
    const freshTarget = { ...INITIAL_TARGET };

    snakeRef.current = freshSnake;
    targetRef.current = freshTarget;
    scoreRef.current = 0;
    directionRef.current = DIRECTIONS.right;
    turnLockedRef.current = false;

    setSnake(freshSnake);
    setTarget(freshTarget);
    setScore(0);
    setFacing("right");
    setGameStatus(nextStatus);

    if (nextStatus === "playing") {
      setAnnouncement("新的一局开始了，去收集五件小回忆吧。");
    }
  }, []);

  const closeGame = useCallback(() => {
    setGameOpen(false);
    turnLockedRef.current = false;
    window.setTimeout(() => launchButtonRef.current?.focus(), 0);
  }, []);

  const queueDirection = useCallback(
    (nextDirectionName: DirectionName) => {
      if (gameStatus !== "playing" || turnLockedRef.current) return;

      const nextDirection = DIRECTIONS[nextDirectionName];
      if (isOpposite(directionRef.current, nextDirection)) return;

      directionRef.current = nextDirection;
      turnLockedRef.current = true;
    },
    [gameStatus],
  );

  const advanceGame = useCallback(() => {
    const currentSnake = snakeRef.current;
    const currentHead = currentSnake[0];
    const direction = directionRef.current;
    setFacing(direction.name);
    const nextHead = {
      x: wrapCoordinate(currentHead.x + direction.x, BOARD_COLUMNS),
      y: wrapCoordinate(currentHead.y + direction.y, BOARD_ROWS),
    };
    const foundTarget = pointsMatch(nextHead, targetRef.current);
    const bodyToCheck = foundTarget
      ? currentSnake
      : currentSnake.slice(0, -1);

    turnLockedRef.current = false;

    if (bodyToCheck.some((segment) => pointsMatch(segment, nextHead))) {
      setGameStatus("failed");
      setAnnouncement("小蛇绕成了一个结，再试一次吧。");
      return;
    }

    const nextSnake = foundTarget
      ? [nextHead, ...currentSnake]
      : [nextHead, ...currentSnake.slice(0, -1)];

    snakeRef.current = nextSnake;
    setSnake(nextSnake);

    if (!foundTarget) return;

    const nextScore = scoreRef.current + 1;
    scoreRef.current = nextScore;
    setScore(nextScore);

    if (nextScore >= MEMORY_GOAL) {
      setGameStatus("complete");
      setAnnouncement("五件小回忆都收集好了。最后一件事，留到我们见面以后再写。");
      return;
    }

    const nextTarget = pickOpenTargetCell(nextSnake);
    targetRef.current = nextTarget;
    setTarget(nextTarget);
    setAnnouncement(`收到了第 ${nextScore} 件小回忆。`);
  }, []);

  useEffect(() => {
    if (!gameOpen || gameStatus !== "playing") return;

    const intervalId = window.setInterval(advanceGame, GAME_TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [advanceGame, gameOpen, gameStatus]);

  useEffect(() => {
    if (!gameOpen) return;

    const focusTimer = window.setTimeout(() => dialogRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [gameOpen]);

  useEffect(() => {
    if (!gameOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeGame();
        return;
      }

      const nextDirection = KEY_DIRECTIONS[event.key];
      if (!nextDirection) return;

      event.preventDefault();
      queueDirection(nextDirection);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeGame, gameOpen, queueDirection]);

  useEffect(
    () => () => {
      burstTimersRef.current.forEach((timerId) =>
        window.clearTimeout(timerId),
      );
    },
    [],
  );

  const collectMoment = (
    event: ReactMouseEvent<HTMLButtonElement>,
    moment: MemoryMoment,
  ) => {
    if (collectedIds.includes(moment.id)) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const burst: FireworkBurst = {
      id: burstIdRef.current,
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    };
    burstIdRef.current += 1;

    setCollectedIds((current) => [...current, moment.id]);
    setBursts((current) => [...current, burst]);
    setActiveMoment(moment);
    setAnnouncement(`找到了${moment.label}。${moment.hint}`);

    const timerId = window.setTimeout(() => {
      setBursts((current) =>
        current.filter((candidate) => candidate.id !== burst.id),
      );
    }, 1_200);
    burstTimersRef.current.push(timerId);
  };

  const openGame = () => {
    if (gameStatus === "ready") resetGame("playing");
    setGameOpen(true);
  };

  const resetWholeQuest = () => {
    setCollectedIds([]);
    setBursts([]);
    setActiveMoment(null);
    setGameOpen(false);
    resetGame("ready");
    setAnnouncement("五件小东西已经重新藏好了。");
  };

  const launchLabel =
    gameStatus === "complete"
      ? "再看一眼最后一句"
      : gameStatus === "playing"
        ? "继续找小回忆"
        : gameStatus === "failed"
          ? "回到回忆小游戏"
          : "去收集五件小回忆";

  return (
    <section
      className="memoryQuest"
      data-complete={allMomentsCollected ? "true" : "false"}
      data-started={collectedIds.length > 0 ? "true" : "false"}
      aria-label="藏在页面边缘的小回忆"
    >
      <p className="memoryQuestProgress">
        找到 <strong>{collectedIds.length}</strong> / {memoryMoments.length}
      </p>

      <div className="memoryMomentEdges">
        {memoryMoments.map((moment) => {
          if (collectedIds.includes(moment.id)) return null;

          return (
            <button
              className={`memoryMomentButton memoryMomentButton--${moment.edge}`}
              data-edge={moment.edge}
              data-moment-id={moment.id}
              key={moment.id}
              onClick={(event) => collectMoment(event, moment)}
              style={getMomentEdgeStyle(moment)}
              type="button"
              aria-label={`收集${moment.label}：${moment.hint}`}
            >
              <span className="memoryMomentImage" aria-hidden="true">
                <span className="memoryMomentFallback">
                  {moment.fallbackGlyph}
                </span>
                {/* The image paths are deliberately data-driven and replaceable. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  draggable={false}
                  height="64"
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                  }}
                  src={moment.imagePath}
                  width="64"
                />
              </span>
              <span className="memoryMomentLabel">{moment.label}</span>
              <span className="memoryMomentHint">{moment.hint}</span>
            </button>
          );
        })}
      </div>

      <div className="memoryFireworkLayer" aria-hidden="true">
        {bursts.map((burst) => (
          <span
            className="memoryFireworkBurst"
            key={burst.id}
            style={{ left: burst.x, top: burst.y }}
          >
            <i className="memoryFireworkCore" />
            {Array.from({ length: FIREWORK_PARTICLES }, (_, index) => (
              <i
                className="memoryFireworkParticle"
                key={index}
                style={getParticleStyle(index)}
              />
            ))}
          </span>
        ))}
      </div>

      {activeMoment && (
        <aside className="memoryMomentToast" role="status">
          <span>{activeMoment.label}</span>
          <p>{activeMoment.hint}</p>
        </aside>
      )}

      <p
        className="memoryQuestAnnouncement srOnly"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>

      {allMomentsCollected && (
        <aside
          className="memoryQuestInvitation"
          aria-labelledby={invitationTitleId}
        >
          <p>五件小东西都找到了</p>
          <h2 id={invitationTitleId}>再陪我把这些小回忆找回来，好吗？</h2>
          <span>很短的一局，五件就好。</span>
          <div className="memoryQuestInvitationActions">
            <button
              ref={launchButtonRef}
              className="memoryQuestLaunchButton"
              onClick={openGame}
              type="button"
            >
              {launchLabel}
            </button>
            <button
              className="memoryQuestResetButton"
              onClick={resetWholeQuest}
              type="button"
            >
              重新找一遍
            </button>
          </div>
        </aside>
      )}

      {gameOpen && (
        <div
          className="starlightGameBackdrop"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeGame();
          }}
          role="presentation"
        >
          <div
            ref={dialogRef}
            className="starlightGameDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={gameTitleId}
            tabIndex={-1}
          >
            <header className="starlightGameHeader">
              <div>
                <p>一小局就好</p>
                <h2 id={gameTitleId}>收集五件小回忆</h2>
              </div>
              <button
                className="starlightGameClose"
                onClick={closeGame}
                type="button"
                aria-label="关闭回忆小游戏"
              >
                <span aria-hidden="true">×</span>
              </button>
            </header>

            <div className="starlightGameMeta">
              <p>
                回忆 <strong>{score}</strong> / {MEMORY_GOAL}
              </p>
              <p>方向键或 W A S D；走到边缘会从另一边回来。</p>
            </div>

            <div className="starlightBoardFrame">
              <div
                className="starlightBoard"
                style={
                  {
                    "--starlight-columns": BOARD_COLUMNS,
                    "--starlight-rows": BOARD_ROWS,
                  } as CSSProperties
                }
                aria-label={`回忆游戏区域，已经收集 ${score} 件，共需 ${MEMORY_GOAL} 件；当前目标是${currentTarget.label}`}
              >
                <span
                  className="starlightFood"
                  style={{
                    gridColumnStart: target.x,
                    gridRowStart: target.y,
                  }}
                  aria-hidden="true"
                >
                  <span className="starlightFoodFallback" hidden>
                    {currentTarget.fallbackGlyph}
                  </span>
                  {/* The mini game reads from the same replaceable icon config. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    draggable={false}
                    height="48"
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                      const fallback = event.currentTarget.previousElementSibling;
                      if (fallback instanceof HTMLElement) fallback.hidden = false;
                    }}
                    src={currentTarget.imagePath}
                    width="48"
                  />
                </span>

                <StarlightSnake snake={snake} facing={facing} />
              </div>

              {gameStatus === "failed" && (
                <div className="starlightGameState starlightGameState--failed">
                  <p>小蛇绕成了一个结。</p>
                  <button onClick={() => resetGame("playing")} type="button">
                    再试一次
                  </button>
                </div>
              )}

              {gameStatus === "complete" && (
                <div
                  className="starlightGameState starlightGameState--complete"
                  role="status"
                >
                  <span aria-hidden="true">★</span>
                  <p>最后一件事，留到我们见面以后再写。</p>
                </div>
              )}
            </div>

            <div
              className="starlightDirectionPad"
              aria-label="手机方向控制"
            >
              {(["up", "left", "down", "right"] as DirectionName[]).map(
                (directionName) => (
                  <button
                    className={`starlightDirectionButton starlightDirectionButton--${directionName}`}
                    disabled={gameStatus !== "playing"}
                    key={directionName}
                    onClick={() => queueDirection(directionName)}
                    type="button"
                    aria-label={
                      directionName === "up"
                        ? "向上"
                        : directionName === "right"
                          ? "向右"
                          : directionName === "down"
                            ? "向下"
                            : "向左"
                    }
                  >
                    <span aria-hidden="true">
                      {directionName === "up"
                        ? "↑"
                        : directionName === "right"
                          ? "→"
                          : directionName === "down"
                            ? "↓"
                            : "←"}
                    </span>
                  </button>
                ),
              )}
            </div>

            <footer className="starlightGameFooter">
              <button
                className="starlightGameReset"
                onClick={() => resetGame("playing")}
                type="button"
              >
                重置这一局
              </button>
              <button
                className="starlightGameLeave"
                onClick={closeGame}
                type="button"
              >
                先放在这里
              </button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}
