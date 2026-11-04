/**
 * Concatenates the style sources into public/styles.css.
 * Base structure first, then one file per design style.
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, "src", "styles");
const outFile = join(here, "public", "styles.css");

const files = (await readdir(srcDir)).filter((f) => f.endsWith(".css")).sort();

if (!files.length) {
  console.error("No style files found in src/styles");
  process.exit(1);
}

const parts = await Promise.all(
  files.map(async (file) => {
    const body = (await readFile(join(srcDir, file), "utf8")).trimEnd();
    return `/* ${file} */\n${body}\n`;
  })
);

const banner = `/* Style Lab, generated file. Edit src/styles/*.css and rebuild. */\n`;
const output = banner + "\n" + parts.join("\n");

await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, output, "utf8");

console.log(`Built ${files.length} style sheets into public/styles.css (${output.length} bytes)`);
