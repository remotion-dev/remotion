// Regenerates public/sample-clip.mp4, public/sample-clip.gif and
// public/sample-tone.wav — locally-synthesized stand-ins for real footage
// and audio, used by the ExtendedReel composition's MediaScene and
// AudioScene. They exist so those scenes don't depend on network access to
// stock media; if you have real footage/audio to demo instead, just point
// those scenes' staticFile() calls at your own public/ assets.
//
// Requires an installed Remotion Studio/browser (see "Rendering environments
// without a GPU" in AGENTS.md if `npx remotion render` fails to launch
// Chromium here) and ffmpeg. Remotion's own bundled ffmpeg binary is reused
// so no separate ffmpeg install is required — whichever
// @remotion/compositor-<platform> optional dependency npm installed for this
// machine is found automatically rather than the exact package name being
// hand-built (gnu vs. musl, in particular, isn't reliably detectable from
// Node alone).
//
// Usage: node scripts/generate-sample-media.mjs [-- extra flags for `remotion render`]
// e.g. in a GPU-less environment (see AGENTS.md):
//   node scripts/generate-sample-media.mjs -- --browser-executable=/tmp/headless-shell-swiftshader --gl=swangle

import {execFileSync} from "node:child_process";
import {existsSync, readdirSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(projectRoot, "public");

const remotionScope = join(projectRoot, "node_modules", "@remotion");
const compositorDir = readdirSync(remotionScope, {withFileTypes: true})
  .filter((e) => e.isDirectory() && e.name.startsWith("compositor-"))
  .map((e) => join(remotionScope, e.name))[0];

const ffmpeg = compositorDir
  ? join(compositorDir, process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg")
  : null;

if (!ffmpeg || !existsSync(ffmpeg)) {
  console.error(
    "Could not find a @remotion/compositor-* package's bundled ffmpeg under node_modules/@remotion. Run `npm i` first, or edit this script to point at an ffmpeg binary on your machine.",
  );
  process.exit(1);
}

const run = (cmd, args) => {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, {stdio: "inherit"});
};

// 1. Render the SourceClipGenerator composition (registered in Root.tsx
// alongside the two reels, but not part of either — see the comment there)
// to a real MP4.
const extraRenderArgs = process.argv.slice(2);
run("npx", [
  "remotion",
  "render",
  "SourceClipGenerator",
  join(publicDir, "sample-clip.mp4"),
  ...extraRenderArgs,
]);

// 2. Convert it to a small palette-optimized GIF.
run(ffmpeg, [
  "-y",
  "-i",
  join(publicDir, "sample-clip.mp4"),
  "-t",
  "1.5",
  "-r",
  "12",
  "-vf",
  "scale=240:-1,split[a][b];[a]palettegen[p];[b][p]paletteuse",
  join(publicDir, "sample-clip.gif"),
]);

// 3. Synthesize a two-tone sine wave as a stand-in for a real voice/music
// track.
run(ffmpeg, [
  "-y",
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=220:duration=3",
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=330:duration=3",
  "-filter_complex",
  "[0:a][1:a]amix=inputs=2:duration=first,volume=2[a]",
  "-map",
  "[a]",
  "-c:a",
  "pcm_s16le",
  join(publicDir, "sample-tone.wav"),
]);

console.log("Done. Regenerated public/sample-clip.mp4, sample-clip.gif and sample-tone.wav.");
