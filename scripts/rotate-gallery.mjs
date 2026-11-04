/**
 * Rebuilds the README sample gallery with five styles.
 *
 * Run daily by .github/workflows/rotate.yml. It avoids repeating any style that
 * is already in the gallery, so each morning shows five different skins.
 */
import { readFile, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const readmePath = join(root, "README.md");
const appPath = join(root, "public", "app.js");
const shotDir = join(root, "assets", "screenshots");
const START = "<!-- samples:start -->";
const END = "<!-- samples:end -->";
const COUNT = 5;
const SITE = "https://tamiloreo.github.io/style-labs/?s=";

const appJs = await readFile(appPath, "utf8");
const styles = [...appJs.matchAll(/id:\s*"([a-z0-9-]+)",\s*\n\s*name:\s*"([^"]+)"/g)].map((m) => ({
  id: m[1],
  name: m[2],
}));
if (styles.length < COUNT) {
  console.error(`Only found ${styles.length} styles in public/app.js`);
  process.exit(1);
}

const available = [];
for (const style of styles) {
  try {
    await access(join(shotDir, `${style.id}.webp`));
    available.push(style);
  } catch (e) {
    console.warn(`No screenshot for ${style.id}, skipping`);
  }
}
if (available.length < COUNT) {
  console.error(`Only ${available.length} screenshots available, need ${COUNT}`);
  process.exit(1);
}

const readme = await readFile(readmePath, "utf8");
const startAt = readme.indexOf(START);
const endAt = readme.indexOf(END);
if (startAt === -1 || endAt === -1 || endAt < startAt) {
  console.error(`README is missing the ${START} / ${END} markers`);
  process.exit(1);
}

const current = readme.slice(startAt, endAt);
const shown = [...current.matchAll(/\?s=([a-z0-9-]+)/g)].map((m) => m[1]);
const pool = available.filter((style) => !shown.includes(style.id));
const deck = (pool.length >= COUNT ? pool : available).slice();

// Fisher-Yates so the order also changes.
for (let i = deck.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [deck[i], deck[j]] = [deck[j], deck[i]];
}

const picks = deck.slice(0, COUNT);

const cell = (style) =>
  `    <td><a href="${SITE}${style.id}"><img src="assets/screenshots/${style.id}.webp" alt="${style.name}"></a></td>`;
const rows = [];
for (let i = 0; i < picks.length; i += 2) {
  const pair = picks.slice(i, i + 2);
  const cells = pair.map(cell).join("\n");
  const filler = pair.length === 1 ? "\n    <td></td>" : "";
  rows.push(`  <tr>\n${cells}${filler}\n  </tr>`);
}

const block = `${START}\n<table>\n${rows.join("\n")}\n</table>\n${END}`;
const next = readme.slice(0, startAt) + block + readme.slice(endAt + END.length);

await writeFile(readmePath, next, "utf8");
console.log(`Gallery now shows: ${picks.map((p) => p.name).join(", ")}`);
