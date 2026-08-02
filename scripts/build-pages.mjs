import { spawn } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const startedAt = Date.now();
const cliPath = path.resolve("node_modules/vinext/dist/cli.js");
const outputPath = path.resolve("dist/client/index.html");

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
    const [outputStat, html] = await Promise.all([
      stat(outputPath),
      readFile(outputPath, "utf8"),
    ]);
    const isFresh = outputStat.mtimeMs >= startedAt - 2_000;
    const isComplete =
      html.includes("万雨铭") &&
      html.includes("张锦") &&
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
