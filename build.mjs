/**
 * Builds the published site from src/.
 *
 * Sources:  src/registry.json (single list of styles), src/styles/*.css, src/index.html
 * Output:   public/index.html, public/registry.js, public/styles/*.css,
 *           public/styles.css (legacy bundle), public/boot.js, public/sw.js
 *
 * Every asset reference carries ?v=<build hash> so a new deploy can never pair
 * fresh HTML with a stale service-worker cache.
 */
import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, "src", "styles");
const publicDir = join(here, "public");
const stylesOut = join(publicDir, "styles");

const registry = JSON.parse(await readFile(join(here, "src", "registry.json"), "utf8"));
if (!Array.isArray(registry) || !registry.length) {
  console.error("src/registry.json must contain a non-empty array of styles");
  process.exit(1);
}

/** Removes comments and redundant whitespace without touching quoted strings or calc(). */
function minifyCss(css) {
  let out = "";
  let i = 0;
  let quote = "";
  while (i < css.length) {
    const ch = css[i];
    if (quote) {
      out += ch;
      if (ch === "\\") {
        out += css[i + 1] ?? "";
        i += 2;
        continue;
      }
      if (ch === quote) quote = "";
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      i++;
      continue;
    }
    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      i = end === -1 ? css.length : end + 2;
      continue;
    }
    if (/\s/.test(ch)) {
      let j = i;
      while (j < css.length && /\s/.test(css[j])) j++;
      const prev = out[out.length - 1] || "";
      const next = css[j] || "";
      if (!"{};:,".includes(prev) && !"{};:,".includes(next)) out += " ";
      i = j;
      continue;
    }
    out += ch;
    i++;
  }
  return out.trim();
}

const numbers = {
  0: "zero", 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven",
  8: "eight", 9: "nine", 10: "ten", 11: "eleven", 12: "twelve", 13: "thirteen",
  14: "fourteen", 15: "fifteen", 16: "sixteen", 17: "seventeen", 18: "eighteen",
  19: "nineteen", 20: "twenty", 30: "thirty", 40: "forty", 50: "fifty", 60: "sixty",
  70: "seventy", 80: "eighty", 90: "ninety",
};

/** Spells whole numbers up to 999, which is plenty for a style count. */
function spell(n) {
  if (numbers[n]) return numbers[n];
  if (n < 100) return `${numbers[Math.floor(n / 10) * 10]}-${numbers[n % 10]}`;
  const hundreds = `${numbers[Math.floor(n / 100)]} hundred`;
  const rest = n % 100;
  return rest ? `${hundreds} ${spell(rest)}` : hundreds;
}

const files = (await readdir(srcDir)).filter((f) => f.endsWith(".css"));
const baseFile = files.find((f) => f.startsWith("00-"));
const controlsFile = files.find((f) => f.startsWith("zz-"));
const skinFiles = files.filter((f) => f !== baseFile && f !== controlsFile);
const skinIds = skinFiles.map((f) => f.replace(/\.css$/, "")).sort();
const registryIds = registry.map((s) => s.id).sort();

if (skinIds.join() !== registryIds.join()) {
  const missingCss = registryIds.filter((id) => !skinIds.includes(id));
  const missingEntry = skinIds.filter((id) => !registryIds.includes(id));
  console.error("Registry and stylesheets disagree.");
  if (missingCss.length) console.error(`  registry entries without CSS: ${missingCss.join(", ")}`);
  if (missingEntry.length) console.error(`  stylesheets without registry entry: ${missingEntry.join(", ")}`);
  process.exit(1);
}

await mkdir(stylesOut, { recursive: true });

const written = new Map();
const outputName = (file) =>
  file === baseFile ? "base.css" : file === controlsFile ? "controls.css" : file;

for (const file of files) {
  const css = minifyCss((await readFile(join(srcDir, file), "utf8")).trimEnd()) + "\n";
  const name = outputName(file);
  written.set(name, css);
  await writeFile(join(stylesOut, name), css, "utf8");
}

// Legacy single bundle, so an older cached page or external link still resolves.
const ordered = [...files].sort((a, b) => {
  if (a === baseFile) return -1;
  if (b === baseFile) return 1;
  if (a === controlsFile) return 1;
  if (b === controlsFile) return -1;
  return a.localeCompare(b);
});
const bundle =
  "/* Style Lab, generated file. Edit src/styles/*.css and rebuild. */\n" +
  ordered.map((file) => written.get(outputName(file))).join("\n");
await writeFile(join(publicDir, "styles.css"), bundle, "utf8");

const appJs = await readFile(join(publicDir, "app.js"), "utf8");
const rippleJs = await readFile(join(publicDir, "ripple.js"), "utf8");
const stageJs = await readFile(join(publicDir, "stage.js"), "utf8");
const ids = registry.map((s) => s.id);
const count = registry.length;
const registryJson = JSON.stringify(registry);

const version = createHash("sha1")
  .update(ordered.map((file) => written.get(outputName(file))).join(""))
  .update(appJs)
  .update(rippleJs)
  .update(stageJs)
  .update(registryJson)
  .digest("hex")
  .slice(0, 10);

const withVersion = (path) => `${path}?v=${version}`;

const registryJs = `/* Generated by build.mjs from src/registry.json. */
window.__stylelabVersion = "${version}";
window.STYLE_REGISTRY = ${registryJson};
`;
await writeFile(join(publicDir, "registry.js"), registryJs, "utf8");

const tickerGroup = registry
  .map((style) => `<span>${style.name}</span><i aria-hidden="true">·</i>`)
  .join("\n            ");

const assetMap = [
  [`href="styles/base.css"`, `href="${withVersion("styles/base.css")}"`],
  [`href="styles/controls.css"`, `href="${withVersion("styles/controls.css")}"`],
  [`href="styles/swiss.css"`, `href="${withVersion("styles/swiss.css")}"`],
  [`src="boot.js"`, `src="${withVersion("boot.js")}"`],
  [`src="registry.js"`, `src="${withVersion("registry.js")}"`],
  [`src="app.js"`, `src="${withVersion("app.js")}"`],
  [`src="ripple.js"`, `src="${withVersion("ripple.js")}"`],
  [`src="stage.js"`, `src="${withVersion("stage.js")}"`],
];

const template = await readFile(join(here, "src", "index.html"), "utf8");
let page = template
  .replaceAll("{{CountWord}}", spell(count).charAt(0).toUpperCase() + spell(count).slice(1))
  .replaceAll("{{CountWordNb}}",
    `<span class="no-break">${spell(count).charAt(0).toUpperCase()}${spell(count).slice(1)}</span>`
  )

  .replaceAll("{{countWord}}", spell(count))
  .replaceAll("{{count}}", String(count))
  .replace(
    "{{ticker}}",
    `<div class="ticker__group">\n            ${tickerGroup}\n          </div>\n          <div class="ticker__group">\n            ${tickerGroup}\n          </div>`
  );

for (const [from, to] of assetMap) {
  if (!page.includes(from)) console.error(`Asset reference not found in template: ${from}`);
  page = page.replace(from, to);
}

if (/\{\{\w+\}\}/.test(page)) {
  const leftover = [...new Set(page.matchAll(/\{\{\w+\}\}/g))].map((m) => m[0]);
  console.error(`Unresolved template tokens: ${leftover.join(", ")}`);
  process.exit(1);
}
await writeFile(join(publicDir, "index.html"), page, "utf8");

const boot = `/* Generated by build.mjs. Picks a style and loads its sheet before first paint. */
(function () {
  var ids = ${JSON.stringify(ids)};
  var root = document.documentElement;
  var pick = "swiss";
  try {
    var fromUrl = new URLSearchParams(location.search).get("s");
    var saved = localStorage.getItem("stylelab:style");
    if (fromUrl && ids.indexOf(fromUrl) >= 0) pick = fromUrl;
    else if (saved && ids.indexOf(saved) >= 0) pick = saved;
  } catch (e) {}
  root.setAttribute("data-style", pick);
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.id = "skin-sheet";
  link.href = "styles/" + pick + ".css?v=${version}";
  document.head.appendChild(link);
})();
`;
await writeFile(join(publicDir, "boot.js"), boot, "utf8");

const precache = [
  "./",
  "index.html",
  withVersion("app.js"),
  withVersion("ripple.js"),
  withVersion("stage.js"),
  withVersion("boot.js"),
  withVersion("registry.js"),
  "favicon.svg",
  "manus-routes.json",
  withVersion("styles/base.css"),
  withVersion("styles/controls.css"),
  ...ids.map((id) => withVersion(`styles/${id}.css`)),
];

const sw = `/* Generated by build.mjs. Cache-first shell, network-first pages. */
const CACHE = "stylelab-${version}";
const ASSETS = ${JSON.stringify(precache, null, 2)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put("index.html", copy));
          return response;
        })
        .catch(() => caches.match("index.html").then((hit) => hit || caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
`;
await writeFile(join(publicDir, "sw.js"), sw, "utf8");

const bundleSize = (await stat(join(publicDir, "styles.css"))).size;
const baseSize = (await stat(join(stylesOut, "base.css"))).size;
const skinsSize = (
  await Promise.all(ids.map(async (id) => (await stat(join(stylesOut, `${id}.css`))).size))
).reduce((a, b) => a + b, 0);

console.log(`Built ${count} styles (${spell(count)}) from src/registry.json.`);
console.log(`Initial CSS: base ${baseSize} B + one skin (average ${Math.round(skinsSize / count)} B)`);
console.log(`Legacy bundle: ${bundleSize} B. Build version: ${version}`);
