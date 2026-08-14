import { readFile, writeFile } from "node:fs/promises";

const dataDirectory = new URL("../public/remake-data/", import.meta.url);
const removedEventIds = new Set(["10770"]);

const [age, events] = await Promise.all([
  readFile(new URL("age.json", dataDirectory), "utf8").then(JSON.parse),
  readFile(new URL("events.json", dataDirectory), "utf8").then(JSON.parse),
]);

for (const eventId of removedEventIds) delete events[eventId];

for (const record of Object.values(age)) {
  if (!Array.isArray(record.event)) continue;
  record.event = record.event.filter((entry) => {
    const eventId = String(entry).split("*", 1)[0];
    return !removedEventIds.has(eventId);
  });
}

await Promise.all([
  writeFile(new URL("age.json", dataDirectory), `${JSON.stringify(age)}\n`, "utf8"),
  writeFile(new URL("events.json", dataDirectory), `${JSON.stringify(events)}\n`, "utf8"),
]);

console.log(`Removed remake event IDs: ${[...removedEventIds].join(", ")}`);
