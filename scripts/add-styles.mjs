/**
 * Appends the approved website styles to src/registry.json.
 * Run once with: node scripts/add-styles.mjs
 */
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../src/registry.json", import.meta.url);
const registry = JSON.parse(await readFile(path, "utf8"));
const have = new Set(registry.map((s) => s.id));

const additions = [
  {
    id: "retro-desktop",
    name: "Retro desktop",
    note: "Windows, bevels, taskbar",
    swatch: ["#cdd3cb", "#e6e6de", "#000080"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Arimo:wght@400;700&family=IBM+Plex+Mono:wght@400;600&display=swap",
  },
  {
    id: "skeuomorphism",
    name: "Skeuomorphism",
    note: "Leather, stitching, real objects",
    swatch: ["#ded0b4", "#4a3222", "#a8863f"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Inter:wght@400;500;600&display=swap",
  },
  {
    id: "constructivism",
    name: "Constructivism",
    note: "Diagonal planes, block type",
    swatch: ["#e9e3d5", "#c8291e", "#141414"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Inter:wght@400;500;600&display=swap",
  },
  {
    id: "op-art",
    name: "Op Art",
    note: "Warped lines, optical vibration",
    swatch: ["#f4f1e8", "#111111", "#e4572e"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600&display=swap",
  },
  {
    id: "risograph-overprint",
    name: "Risograph",
    note: "Separated inks, off-register",
    swatch: ["#f2ecdc", "#1f4fbf", "#ff4a1c"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=IBM+Plex+Mono:wght@400;600&display=swap",
  },
  {
    id: "comic-sequence",
    name: "Comic layout",
    note: "Panels, gutters, speech",
    swatch: ["#fdf6e3", "#111111", "#ffd23f"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700&display=swap",
  },
  {
    id: "kinetic-typography",
    name: "Kinetic type",
    note: "Letters that move and stretch",
    swatch: ["#0d0d0d", "#d7ff3e", "#f4f2ec"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800;900&family=Inter:wght@400;500&display=swap",
  },
  {
    id: "data-scrollytelling",
    name: "Scrollytelling",
    note: "Pinned charts, story steps",
    swatch: ["#ffffff", "#1b4dff", "#14161a"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap",
  },
  {
    id: "relationship-graph",
    name: "Relationship graph",
    note: "Nodes, edges, context drawers",
    swatch: ["#0b1020", "#7cf5d0", "#4d7cff"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
  },
  {
    id: "material-expressive",
    name: "Material Expressive",
    note: "Shape contrast, grouped actions",
    swatch: ["#f6f1ff", "#6750a4", "#ffd8e4"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;800&family=Inter:wght@400;500;600&display=swap",
  },
  {
    id: "industrial-wayfinding",
    name: "Wayfinding",
    note: "Sign families, arrows, zones",
    swatch: ["#f2efe6", "#111111", "#e8b425"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600&display=swap",
  },
  {
    id: "conversational-navigation",
    name: "Conversational",
    note: "Dialogue turns, reply chips",
    swatch: ["#f7f8fb", "#2f6bff", "#14161c"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Inter:wght@400;500&display=swap",
  },
  {
    id: "administrative-form",
    name: "Administrative form",
    note: "Numbered fields, ruled entries",
    swatch: ["#f4f1e8", "#14171a", "#a8322a"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap",
  },
  {
    id: "concrete-poetry",
    name: "Concrete poetry",
    note: "Words form the composition",
    swatch: ["#f5c518", "#111111", "#fbf8ef"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&display=swap",
  },
  {
    id: "zoomable-canvas",
    name: "Zoomable canvas",
    note: "Pan, zoom, coordinates",
    swatch: ["#f2f2ef", "#1b1c1e", "#e2542c"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
  },
  {
    id: "banknote-engraving",
    name: "Banknote engraving",
    note: "Guilloche, serials, seals",
    swatch: ["#0c3a2c", "#eae4d2", "#a8823c"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,700&family=Spectral:wght@400;500&display=swap",
  },
  {
    id: "card-catalogue",
    name: "Card catalogue",
    note: "Ruled cards, A to Z tabs",
    swatch: ["#f7f1df", "#23201c", "#b4472f"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Public+Sans:wght@300;400;600&display=swap",
  },
  {
    id: "timetable-grid",
    name: "Timetable grid",
    note: "Rows of services, time axis",
    swatch: ["#fbf8f1", "#17202a", "#c75146"],
    fonts:
      "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=Source+Sans+3:wght@400;600&display=swap",
  },
];

let added = 0;
for (const entry of additions) {
  if (have.has(entry.id)) continue;
  registry.push(entry);
  have.add(entry.id);
  added += 1;
}

await writeFile(path, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
console.log(`Added ${added}. Registry now holds ${registry.length} styles.`);
