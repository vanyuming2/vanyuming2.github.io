import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("exports the finished memorial page", async () => {
  const html = await readFile(new URL("dist/client/index.html", root), "utf8");

  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /万雨铭/);
  assert.match(html, /张锦/);
  assert.match(html, /2026\.04\.29/);
  assert.match(html, /00:17/);
  assert.match(html, /从那一刻起，时间有了温度。/);
  assert.match(html, /https:\/\/vanyuming2\.github\.io\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Starter Project/);
});

test("keeps the timer exact and accessible", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(page, /2026-04-29T00:17:00\+08:00/);
  assert.match(page, /Date\.now\(\)/);
  assert.match(page, /visibilitychange/);
  assert.match(page, /aria-live="polite"/);
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("includes the GitHub Pages assets", async () => {
  const ogPath = new URL("dist/client/og.png", root);
  const noJekyllPath = new URL("dist/client/.nojekyll", root);

  await Promise.all([access(ogPath), access(noJekyllPath)]);
  assert.ok((await stat(ogPath)).size > 100_000);
});
