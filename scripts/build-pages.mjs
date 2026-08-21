import { spawn } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const startedAt = Date.now();
const cliPath = path.resolve("node_modules/vinext/dist/cli.js");
const outputPath = path.resolve("dist/client/index.html");
const gardenOutputPath = path.resolve("dist/client/garden/index.html");
const remakeOutputPath = path.resolve("dist/client/remake/index.html");
const remakeDataPaths = ["age", "events", "talents", "achievement", "character"]
  .map((name) => path.resolve(`dist/client/remake-data/${name}.json`));

const child = spawn(process.execPath, [cliPath, "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    WRANGLER_LOG_PATH: ".wrangler/wrangler.log",
  },
});

const exitCode = await new Promise((resolve, reject) => {
  child.once("error", reject);
  child.once("close", resolve);
});

if (exitCode === 0) process.exit(0);

// vinext 0.0.50 can hit a libuv shutdown assertion on Windows after a fully
// successful static export. Only accept that platform-specific late exit when
// this run produced a fresh, complete memorial page. Linux CI still preserves
// every non-zero build exit.
if (process.platform === "win32") {
  try {
    const [
      outputStat,
      gardenOutputStat,
      remakeOutputStat,
      html,
      gardenHtml,
      remakeHtml,
      ...remakeDataStats
    ] = await Promise.all([
      stat(outputPath),
      stat(gardenOutputPath),
      stat(remakeOutputPath),
      readFile(outputPath, "utf8"),
      readFile(gardenOutputPath, "utf8"),
      readFile(remakeOutputPath, "utf8"),
      ...remakeDataPaths.map((file) => stat(file)),
    ]);
    const isFresh =
      outputStat.mtimeMs >= startedAt - 2_000 &&
      gardenOutputStat.mtimeMs >= startedAt - 2_000 &&
      remakeOutputStat.mtimeMs >= startedAt - 2_000 &&
      remakeDataStats.every(({ size }) => size > 1_000);
    const isComplete =
      html.includes("写给张老师") &&
      html.includes("随便看看") &&
      html.includes("见面再说。") &&
      html.includes('class="privateArchive"') &&
      html.includes("这里留了一些东西 · 点击查看") &&
      html.includes("这部分显示有点问题，暂时隐藏内容。") &&
      html.includes('class="privateArchiveStored" hidden') &&
      html.includes('href="/garden/"') &&
      gardenHtml.includes("第一块小花园") &&
      gardenHtml.includes('data-memory-garden="first-garden"') &&
      html.includes('href="/remake/"') &&
      remakeHtml.includes("要不要，再写一次人生") &&
      remakeHtml.includes('data-life-remake="original-zh-cn-complete-loop"') &&
      remakeHtml.includes("</html>") &&
      gardenHtml.includes("</html>") &&
      html.includes("</html>");

    if (isFresh && isComplete) {
      console.warn(
        "Static export completed; ignored a known vinext Windows shutdown assertion.",
      );
      process.exit(0);
    }
  } catch {
    // Fall through and preserve the original failure.
  }
}

process.exit(Number(exitCode) || 1);
