/**
 * Rebuild all six README samples from the registry and available screenshots.
 * Prefer six styles absent from the previous gallery. Every cell is replaced.
 */
import { readFile, writeFile, access } from "node:fs/promises";
import { createHash, randomInt } from "node:crypto";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const START = "<!-- samples:start -->";
export const END = "<!-- samples:end -->";
export const COUNT = 6;
const SITE = "https://tamiloreo.github.io/style-labs/?s=";

export function galleryRange(readme) {
  const start = readme.indexOf(START);
  const end = readme.indexOf(END, start);
  if (start < 0 || end < start || readme.indexOf(START, start + START.length) >= 0) {
    throw new Error("README must contain one ordered samples:start / samples:end block");
  }
  return { start, end, block: readme.slice(start, end + END.length) };
}

export function currentIds(readme) {
  const { block } = galleryRange(readme);
  // Read both links and image filenames, so an out-of-sync cell is not retained.
  return new Set([
    ...[...block.matchAll(/\?s=([a-z0-9-]+)/g)].map((m) => m[1]),
    ...[...block.matchAll(/assets\/screenshots\/([a-z0-9-]+)\.webp/g)].map((m) => m[1]),
  ]);
}

export function pickStyles(available, shown, draw = randomInt) {
  const unique = [...new Map(available.map((style) => [style.id, style])).values()];
  if (unique.length < COUNT) throw new Error(`Need ${COUNT} distinct screenshots`);
  const shuffle = (items) => {
    const deck = items.slice();
    for (let i = deck.length - 1; i > 0; i--) {
      const j = draw(i + 1);
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };
  const fresh = shuffle(unique.filter((style) => !shown.has(style.id)));
  const repeats = fresh.length < COUNT ? shuffle(unique.filter((style) => shown.has(style.id))) : [];
  return [...fresh, ...repeats].slice(0, COUNT);
}

const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[c]);

export function renderGallery(readme, picks) {
  if (picks.length !== COUNT || new Set(picks.map((style) => style.id)).size !== COUNT) {
    throw new Error("Gallery must contain exactly six distinct styles");
  }
  if (picks.some((style) => !/^[a-z0-9-]+$/.test(style.id))) throw new Error("Invalid style ID");
  const { start, end } = galleryRange(readme);
  const cells = picks.map((style) => {
    const version = style.imageVersion ? `?v=${encodeURIComponent(style.imageVersion)}` : "";
    return `    <td><a href="${SITE}${style.id}"><img src="assets/screenshots/${style.id}.webp${version}" alt="${escape(style.name)}"></a></td>`;
  });
  const rows = [];
  for (let i = 0; i < COUNT; i += 2) rows.push(`  <tr>\n${cells.slice(i, i + 2).join("\n")}\n  </tr>`);
  const block = `${START}\n<table>\n${rows.join("\n")}\n</table>\n${END}`;
  return readme.slice(0, start) + block + readme.slice(end + END.length);
}

/** Guards the rendered block, because this script is what CI actually runs. */
export function verifyGallery(readme) {
  const { block } = galleryRange(readme);
  const cells = [...block.matchAll(
    /<td><a href="[^" ]+\?s=([a-z0-9-]+)"><img src="assets\/screenshots\/([a-z0-9-]+)\.webp(?:\?v=[^"]+)?"/g
  )];
  if (cells.length !== COUNT) throw new Error(`Gallery rendered ${cells.length} cells, expected ${COUNT}`);
  if ((block.match(/<tr>/g) || []).length !== COUNT / 2) throw new Error("Gallery must fill three rows");
  const ids = cells.map((cell) => cell[1]);
  if (new Set(ids).size !== COUNT) throw new Error("Gallery repeated a style");
  for (const [, link, image] of cells) {
    if (link !== image) throw new Error(`Gallery link ${link} does not match image ${image}`);
  }
  return ids;
}

export async function rotateGallery(projectRoot = root) {
  const registry = JSON.parse(await readFile(join(projectRoot, "src", "registry.json"), "utf8"));
  if (!Array.isArray(registry)) throw new Error("Registry must be an array");
  const available = [];
  for (const style of registry) {
    const path = join(projectRoot, "assets", "screenshots", `${style.id}.webp`);
    try {
      await access(path);
    } catch {
      console.warn(`No screenshot for ${style.id}, skipping`);
      continue;
    }
    const imageVersion = createHash("sha256").update(await readFile(path)).digest("hex").slice(0, 10);
    available.push({ ...style, imageVersion });
  }
  const path = join(projectRoot, "README.md");
  const readme = await readFile(path, "utf8");
  const shown = currentIds(readme);
  const picks = pickStyles(available, shown);
  const next = renderGallery(readme, picks);
  const ids = verifyGallery(next);
  const fresh = available.filter((style) => !shown.has(style.id)).length;
  if (fresh >= COUNT && ids.some((id) => shown.has(id))) {
    throw new Error("Rotation retained a previous sample despite six new options");
  }
  await writeFile(path, next, "utf8");
  console.log(`All six samples replaced: ${picks.map((style) => style.name).join(", ")}`);
  return picks;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await rotateGallery();
}
