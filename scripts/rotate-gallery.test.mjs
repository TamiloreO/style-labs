import test from "node:test";
import assert from "node:assert/strict";
import { START, END, currentIds, pickStyles, renderGallery } from "./rotate-gallery.mjs";

const styles = Array.from({ length: 24 }, (_, i) => ({
  id: `skin-${i}`, name: `Style ${i}`, imageVersion: `hash${i}`,
}));
const initial = `# Keep this intro\n${START}\n<table>\n${styles.slice(0, 6).map((s) =>
  `<td><a href="https://tamiloreo.github.io/style-labs/?s=${s.id}"><img src="assets/screenshots/${s.id}.webp" alt="${s.name}"></a></td>`).join("\n")}\n</table>\n${END}\n## Keep this license\n`;
const deterministicDraw = (max) => Math.floor(max / 3);

test("all six slots change, not only the first, across consecutive rotations", () => {
  let readme = initial;
  for (let round = 0; round < 2; round++) {
    const before = currentIds(readme);
    const picks = pickStyles(styles, before, deterministicDraw);
    assert.equal(picks.length, 6);
    assert.equal(new Set(picks.map((s) => s.id)).size, 6);
    assert.ok(picks.every((s) => !before.has(s.id)));
    const next = renderGallery(readme, picks);
    const cells = [...next.matchAll(/<td><a href="[^" ]+\?s=([a-z0-9-]+)"><img src="assets\/screenshots\/([a-z0-9-]+)\.webp\?v=([^"]+)"/g)];
    assert.equal(cells.length, 6);
    assert.equal((next.match(/<tr>/g) || []).length, 3);
    cells.forEach((cell, i) => {
      assert.equal(cell[1], picks[i].id);
      assert.equal(cell[2], picks[i].id);
      assert.equal(cell[3], picks[i].imageVersion);
      assert.ok(!before.has(cell[1]), `slot ${i + 1} was retained`);
    });
    assert.equal(next.split(START)[0], initial.split(START)[0]);
    assert.equal(next.split(END)[1], initial.split(END)[1]);
    readme = next;
  }
});

test("sampling is not restricted to the leading six registry entries", () => {
  const picks = pickStyles(styles, new Set(), () => 0);
  assert.ok(picks.some((s) => Number(s.id.slice(5)) >= 6));
});

test("small catalogues maximize fresh styles without duplicate images", () => {
  const picks = pickStyles(styles.slice(0, 8), new Set(styles.slice(0, 6).map((s) => s.id)), deterministicDraw);
  assert.equal(picks.length, 6);
  assert.equal(new Set(picks.map((s) => s.id)).size, 6);
  assert.ok(picks.some((s) => s.id === "skin-6"));
  assert.ok(picks.some((s) => s.id === "skin-7"));
});

test("broken markers and invalid six-image sets fail without writing", () => {
  assert.throws(() => renderGallery("no markers", styles.slice(0, 6)));
  assert.throws(() => renderGallery(initial, styles.slice(0, 5)));
  assert.throws(() => renderGallery(initial, Array(6).fill(styles[0])));
});
