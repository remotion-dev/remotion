// Writes out/videos/<slug>/<slug>.srt for a MortgageReel video: the same cut,
// paced captions the render shows, shifted by the cover card.
//   node scripts/export-srt.mjs <slug>
// Imports src/mortgage/timeline.ts directly through Node's native type
// stripping (Node 22.18+/24), so that file must stay import-free.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const FPS = 30;
const MAX_WORDS = 7;
const MAX_MS = 2500;

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/export-srt.mjs <slug>");
  process.exit(1);
}
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public", "videos", slug);
const read = (f) => {
  try {
    return JSON.parse(readFileSync(join(dir, f), "utf8"));
  } catch (err) {
    console.error(`Cannot read public/videos/${slug}/${f}: ${err.message}`);
    process.exit(1);
  }
};
const { buildTimeline, TALK_START_FRAME } = await import(
  pathToFileURL(join(root, "src", "mortgage", "timeline.ts")).href
);
const { captions } = buildTimeline(read("words.json"), read("edit.json"), FPS);
const offset = (TALK_START_FRAME * 1000) / FPS;

const groups = [];
for (const c of captions) {
  const g = groups[groups.length - 1];
  if (g && g.words.length < MAX_WORDS && c.endMs - g.startMs <= MAX_MS) {
    g.words.push(c.text.trim());
    g.endMs = c.endMs;
  } else groups.push({ startMs: c.startMs, endMs: c.endMs, words: [c.text.trim()] });
}

const ts = (ms) => {
  const t = Math.max(0, Math.round(ms + offset));
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(t / 3600000))}:${p(Math.floor(t / 60000) % 60)}:${p(Math.floor(t / 1000) % 60)},${p(t % 1000, 3)}`;
};
const srt = groups
  .map((g, i) => {
    // Never overlap the next cue.
    const end = Math.min(g.endMs, groups[i + 1]?.startMs ?? Infinity);
    return `${i + 1}\n${ts(g.startMs)} --> ${ts(end)}\n${g.words.join(" ")}\n`;
  })
  .join("\n");

const outDir = join(root, "out", "videos", slug);
mkdirSync(outDir, { recursive: true });
const out = join(outDir, `${slug}.srt`);
writeFileSync(out, srt, "utf8");
console.log(`${out} (${groups.length} cues)`);
