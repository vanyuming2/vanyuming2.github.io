import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const command = process.argv[2];
if (command !== "dev" && command !== "start") {
  console.error("Expected either dev or start.");
  process.exit(1);
}

const cliPath = path.resolve("node_modules/vinext/dist/cli.js");
const child = spawn(process.execPath, [cliPath, command], {
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

process.exit(Number(exitCode) || 0);
