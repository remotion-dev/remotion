// Saves Noto animated emoji (https://googlefonts.github.io/noto-emoji-animation/)
// as Lottie JSON in public/emoji/<name>.json, for <NotoEmoji> in src/brand/.
// They're licensed CC BY 4.0: credit "Noto Emoji Animation by Google, CC BY
// 4.0" in a video's description when it uses them.
//
//   node scripts/fetch-noto-emoji.mjs                the default set below
//   node scripts/fetch-noto-emoji.mjs rocket fire    more, by name
//
// Names are @remotion/animated-emoji's (getAvailableEmojis(), 411 of them),
// which carry the codepoints the Noto CDN uses. Files already saved are
// skipped. The files come from fonts.gstatic.com, where the Noto site serves
// them. Behind a proxy that Node's fetch doesn't pick up by itself, run with
// NODE_USE_ENV_PROXY=1.
import {existsSync, mkdirSync, writeFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {getAvailableEmojis} from "@remotion/animated-emoji";

// Picked for FinHub's videos: money and decisions, calls to action, reactions,
// hands (folded hands for "cảm ơn"), and celebrations. The set has no house,
// key or chart emoji.
const DEFAULT_SET = [
  "money-with-wings",
  "money-face",
  "gem-stone",
  "balance-scale",
  "light-bulb",
  "direct-hit",
  "alarm-clock",
  "bell",
  "check-mark",
  "cross-mark",
  "exclamation",
  "question",
  "new",
  "free",
  "plus-sign",
  "globe-showing-asia-australia",
  "rocket",
  "chequered-flag",
  "smile",
  "blush",
  "thinking-face",
  "mind-blown",
  "star-struck",
  "partying-face",
  "hug-face",
  "eyes",
  "thumbs-up",
  "clap",
  "wave",
  "folded-hands",
  "raising-hands",
  "crossed-fingers",
  "muscle",
  "party-popper",
  "confetti-ball",
  "sparkles",
  "fire",
  "100",
  "red-heart",
];

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "emoji");
const codepoints = new Map(getAvailableEmojis().map((emoji) => [emoji.name, emoji.codepoint]));
const names = process.argv.length > 2 ? process.argv.slice(2) : DEFAULT_SET;

const unknown = names.filter((name) => !codepoints.has(name));
if (unknown.length > 0) {
  console.error(`Unknown emoji: ${unknown.join(", ")}. Use a name from @remotion/animated-emoji's getAvailableEmojis().`);
  process.exit(1);
}

mkdirSync(outDir, {recursive: true});
let failures = 0;
for (const name of names) {
  const file = join(outDir, `${name}.json`);
  if (existsSync(file)) {
    console.log(`= ${name} (already saved)`);
    continue;
  }
  const url = `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoints.get(name)}/lottie.json`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const lottie = JSON.parse(text);
    // A Lottie file has a frame rate and layers; anything else is an error page.
    if (typeof lottie.fr !== "number" || !Array.isArray(lottie.layers)) throw new Error("not a Lottie file");
    writeFileSync(file, text);
    console.log(`+ ${name}: ${lottie.w}×${lottie.h}, ${((lottie.op - lottie.ip) / lottie.fr).toFixed(2)}s, ${(text.length / 1024).toFixed(0)} KB`);
  } catch (err) {
    failures++;
    console.error(`✗ ${name}: ${err.message} (${url})`);
  }
}
process.exit(failures === 0 ? 0 : 1);
