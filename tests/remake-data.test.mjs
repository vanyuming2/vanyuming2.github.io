import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const sourceDirectory = new URL("../public/remake-data/", import.meta.url);

async function load(name, directory = sourceDirectory) {
  return JSON.parse(await readFile(new URL(`${name}.json`, directory), "utf8"));
}

function reference(value) {
  const [id, rawWeight] = String(value).split("*");
  return { id, weight: rawWeight === undefined ? 1 : Number(rawWeight) };
}

test("contains the configured Simplified Chinese Life Restart data", async () => {
  const [ages, events, talents, achievements, characters] = await Promise.all([
    load("age"),
    load("events"),
    load("talents"),
    load("achievement"),
    load("character"),
  ]);

  assert.equal(Object.keys(ages).length, 501);
  assert.equal(Object.keys(events).length, 1719);
  assert.equal(Object.keys(talents).length, 184);
  assert.equal(Object.keys(achievements).length, 165);
  assert.equal(Object.keys(characters).length, 100);
  assert.equal(talents[1001].name, "随身玉佩");
  assert.equal(events[10000].event, "你死了。");
  assert.equal(events[10770], undefined);
  assert.equal(achievements[101].name, "既视感");
  assert.equal(Number(ages[500].age), 500);
});

test("all age, branch, talent and character references resolve", async () => {
  const [ages, events, talents, characters] = await Promise.all([
    load("age"),
    load("events"),
    load("talents"),
    load("character"),
  ]);

  for (const age of Object.values(ages)) {
    for (const item of age.event ?? []) {
      const { id, weight } = reference(item);
      assert.ok(events[id], `age ${age.age} references missing event ${id}`);
      assert.ok(Number.isFinite(weight) && weight > 0, `event ${id} has invalid weight ${weight}`);
    }
  }

  for (const event of Object.values(events)) {
    for (const branch of event.branch ?? []) {
      const separator = String(branch).lastIndexOf(":");
      assert.ok(separator > 0, `event ${event.id} has malformed branch ${branch}`);
      const target = String(branch).slice(separator + 1);
      assert.ok(events[target], `event ${event.id} branches to missing event ${target}`);
    }
  }

  for (const talent of Object.values(talents)) {
    for (const excluded of talent.exclude ?? []) {
      assert.ok(talents[String(excluded)], `talent ${talent.id} excludes missing talent ${excluded}`);
    }
    for (const replacement of talent.replacement?.talent ?? []) {
      const { id, weight } = reference(replacement);
      assert.ok(talents[id], `talent ${talent.id} replaces with missing talent ${id}`);
      assert.ok(Number.isFinite(weight) && weight > 0);
    }
  }

  for (const character of Object.values(characters)) {
    for (const talentId of character.talent ?? []) {
      assert.ok(talents[String(talentId)], `character ${character.id} references missing talent ${talentId}`);
    }
  }
});

test("the static export publishes the data and the full MIT notice", async () => {
  const publishedDirectory = new URL("../dist/client/remake-data/", import.meta.url);
  for (const name of ["age", "events", "talents", "achievement", "character"]) {
    await access(new URL(`${name}.json`, publishedDirectory));
    const [sourceInfo, publishedInfo] = await Promise.all([
      stat(new URL(`${name}.json`, sourceDirectory)),
      stat(new URL(`${name}.json`, publishedDirectory)),
    ]);
    assert.equal(publishedInfo.size, sourceInfo.size);
  }

  const notice = await readFile(new URL("dist/client/third-party-notices.txt", root), "utf8");
  assert.match(notice, /Simplified Chinese data/);
  assert.match(notice, /Copyright \(c\) 2021 神戸小鳥/);
  assert.match(notice, /THE SOFTWARE IS PROVIDED "AS IS"/);
});
