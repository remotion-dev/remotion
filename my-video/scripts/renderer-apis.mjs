// Exercises the Node-side Remotion APIs that can't run inside a scene, for
// real, against this project: @remotion/bundler, @remotion/renderer, the
// offline helpers of the cloud packages (@remotion/lambda, @remotion/cloudrun),
// @remotion/install-whisper-cpp's toCaptions(), @remotion/studio-protocol's
// Studio-discovery helpers and @remotion/media-parser's Node readers/writers.
//
// Every step prints its real outcome (✔ with the result, ✘ with the error)
// and the script exits non-zero if any step failed. Output goes to
// out/renderer-apis/.
//
// Usage (see "Rendering environments without a GPU" in AGENTS.md):
//   node scripts/renderer-apis.mjs --browser-executable=/path/to/chrome [--gl=swangle]
//
// Not exercised, because they need credentials, a license key or network
// access this environment doesn't have: renderMediaOnLambda() and the rest of
// @remotion/lambda's AWS calls, @remotion/cloudrun's GCP calls, everything in
// @remotion/vercel (every export talks to a live Vercel sandbox),
// @remotion/licensing, and install-whisper-cpp's installWhisperCpp() /
// downloadWhisperModel() / transcribe(). ensureFfmpeg(), ensureFfprobe() and
// getCanExtractFramesFast() are listed on remotion.dev/docs/api but don't
// exist in @remotion/renderer 4.x: the compositor ships its own ffmpeg.

import {execFileSync} from "node:child_process";
import {createHmac} from "node:crypto";
import {mkdirSync, rmSync, statSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {getRegions as getCloudRunRegions, speculateServiceName} from "@remotion/cloudrun";
import {bundle} from "@remotion/bundler";
import {toCaptions} from "@remotion/install-whisper-cpp";
import {estimatePrice, getRegions as getLambdaRegions, validateWebhookSignature} from "@remotion/lambda";
// These live in @remotion/lambda-client, re-exported as @remotion/lambda/client,
// not in the @remotion/lambda entry point.
import {appRouterWebhook, expressWebhook, pagesRouterWebhook, speculateFunctionName} from "@remotion/lambda/client";
import {downloadAndParseMedia, parseMedia} from "@remotion/media-parser";
import {nodeReader} from "@remotion/media-parser/node";
import {nodeWriter} from "@remotion/media-parser/node-writer";
import {parseMediaOnServerWorker} from "@remotion/media-parser/server-worker";
import {
  combineChunks,
  ensureBrowser,
  getCompositions,
  getSilentParts,
  getVideoMetadata,
  makeCancelSignal,
  openBrowser,
  renderFrames,
  renderMedia,
  renderStill,
  selectComposition,
  stitchFramesToVideo,
} from "@remotion/renderer";
import {addElementLibraryToStudio, createElementPayload, installInStudio} from "@remotion/studio-protocol";
import {bundlerOverride} from "../bundler-override.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(projectRoot, "out", "renderer-apis");
rmSync(out, {recursive: true, force: true});
mkdirSync(out, {recursive: true});

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=") ?? null;
const browserExecutable = arg("browser-executable");
const gl = arg("gl");
const chromiumOptions = gl ? {gl} : {};

let failures = 0;
const step = async (label, fn) => {
  try {
    const result = await fn();
    console.log(`✔ ${label}: ${result}`);
  } catch (err) {
    failures++;
    console.log(`✘ ${label}: ${err instanceof Error ? err.message : String(err)}`);
  }
};
const kb = (path) => `${(statSync(path).size / 1024).toFixed(0)} KB`;
// A render resolving isn't proof it produced the right file, so outputs are
// checked against the number of frames they should contain.
const assertDuration = async (path, frames, fps) => {
  const {durationInSeconds} = await parseMedia({src: path, reader: nodeReader, acknowledgeRemotionLicense: true, fields: {durationInSeconds: true}});
  if (Math.abs(durationInSeconds - frames / fps) > 0.05) {
    throw new Error(`${path} is ${durationInSeconds.toFixed(2)}s, expected ${(frames / fps).toFixed(2)}s (${frames} frames)`);
  }
  return `${durationInSeconds.toFixed(2)}s`;
};

// --- Offline helpers from the cloud packages -------------------------------

await step("lambda getRegions()", () => `${getLambdaRegions().length} AWS regions`);
await step("lambda speculateFunctionName()", () => speculateFunctionName({memorySizeInMb: 2048, diskSizeInMb: 2048, timeoutInSeconds: 120}));
await step("lambda estimatePrice()", () => {
  const usd = estimatePrice({region: "us-east-1", memorySizeInMb: 2048, diskSizeInMb: 2048, lambdasInvoked: 10, durationInMilliseconds: 60_000});
  return `$${usd.toFixed(4)} for 10 invocations, 60s total at 2048MB`;
});

const secret = "local-test-secret";
const payload = {type: "success", renderId: "local-test", bucketName: "none", expectedBucketOwner: "none", outputUrl: null, outputFile: null};
const signature = `sha512=${createHmac("sha512", secret).update(JSON.stringify(payload)).digest("hex")}`;
await step("lambda validateWebhookSignature() (valid)", () => {
  validateWebhookSignature({secret, body: payload, signatureHeader: signature});
  return "accepted";
});
await step("lambda validateWebhookSignature() (tampered)", () => {
  try {
    validateWebhookSignature({secret, body: {...payload, renderId: "forged"}, signatureHeader: signature});
  } catch (err) {
    return `rejected: ${err.message}`;
  }
  throw new Error("a tampered body was accepted");
});
await step("lambda expressWebhook()", async () => {
  let received = null;
  let status = null;
  const handler = expressWebhook({secret, onSuccess: (p) => (received = p.renderId)});
  const req = {method: "POST", body: payload, header: (name) => (name === "X-Remotion-Signature" ? signature : undefined)};
  const res = {setHeader: () => undefined, status: (s) => ((status = s), res), json: () => res, end: () => res};
  await handler(req, res);
  return `HTTP ${status}, onSuccess got ${received}`;
});
await step("lambda appRouterWebhook()", async () => {
  const handler = appRouterWebhook({secret, onSuccess: () => undefined});
  const response = await handler(
    new Request("http://localhost/webhook", {method: "POST", headers: {"X-Remotion-Signature": signature}, body: JSON.stringify(payload)}),
  );
  return `HTTP ${response.status}`;
});
await step("lambda pagesRouterWebhook()", async () => {
  let status = null;
  const handler = pagesRouterWebhook({secret, onSuccess: () => undefined});
  const req = {method: "POST", body: payload, headers: {"x-remotion-signature": signature}};
  const res = {setHeader: () => undefined, status: (s) => ((status = s), res), json: () => res, end: () => res};
  await handler(req, res);
  return `HTTP ${status}`;
});
await step("cloudrun getRegions()", () => `${getCloudRunRegions().length} GCP regions`);
await step("cloudrun speculateServiceName()", () => speculateServiceName({memoryLimit: "2Gi", cpuLimit: "1.0", timeoutSeconds: 300}));

// --- whisper.cpp output → captions ------------------------------------------

await step("install-whisper-cpp toCaptions()", () => {
  // The shape `transcribe({tokenLevelTimestamps: true})` returns, hand-built.
  const token = (text, from, to) => ({text, timestamps: {from: "", to: ""}, offsets: {from, to}, id: 0, p: 0.9, t_dtw: -1});
  const segment = (text, from, to) => ({timestamps: {from: "", to: ""}, offsets: {from, to}, text, tokens: [token(text, from, to)]});
  const {captions} = toCaptions({
    whisperCppOutput: {
      systeminfo: "",
      model: {type: "base", multilingual: false, vocab: 0, audio: {ctx: 0, state: 0, head: 0, layer: 0}, text: {ctx: 0, state: 0, head: 0, layer: 0}, mels: 80, ftype: 1},
      params: {model: "ggml-base.en.bin", language: "en", translate: false},
      result: {language: "en"},
      transcription: [segment(" Real", 0, 300), segment(" speech", 340, 700), segment(" to", 740, 900), segment(" text.", 940, 1300)],
    },
  });
  return `${captions.length} captions: "${captions.map((c) => c.text).join("")}"`;
});

// --- @remotion/studio-protocol: Studio discovery ----------------------------

const elementPayload = createElementPayload({
  displayName: "Pulse",
  slug: "pulse",
  sourceCode: "export const Pulse: React.FC = () => null;",
  dependencies: [],
  dimensions: null,
  durationInFrames: 60,
});
// No Studio is running, so both should resolve to a typed failure, not throw.
await step("studio-protocol installInStudio()", async () => JSON.stringify(await installInStudio({payload: elementPayload})));
await step("studio-protocol addElementLibraryToStudio()", async () =>
  JSON.stringify(await addElementLibraryToStudio({url: "https://example.com/library.json", displayName: "Example"})),
);

// --- @remotion/media-parser in Node -----------------------------------------

const publicDir = join(projectRoot, "public");
await step("media-parser parseMedia(nodeReader)", async () => {
  const r = await parseMedia({src: join(publicDir, "sample-clip.mp4"), reader: nodeReader, acknowledgeRemotionLicense: true, fields: {container: true, videoCodec: true, durationInSeconds: true}});
  return `${r.container} · ${r.videoCodec} · ${r.durationInSeconds.toFixed(2)}s`;
});
await step("media-parser downloadAndParseMedia(nodeWriter)", async () => {
  const copy = join(out, "copy.webm");
  const r = await downloadAndParseMedia({
    src: join(publicDir, "sample-clip.webm"),
    reader: nodeReader,
    writer: nodeWriter(copy),
    acknowledgeRemotionLicense: true,
    fields: {container: true, dimensions: true},
  });
  return `${r.container} ${r.dimensions.width}×${r.dimensions.height}, copied to out/renderer-apis/copy.webm (${kb(copy)})`;
});
await step("media-parser parseMediaOnServerWorker()", async () => {
  const src = join(publicDir, "sample-tone.wav");
  if (typeof Worker !== "undefined") {
    const r = await parseMediaOnServerWorker({src, acknowledgeRemotionLicense: true, fields: {sampleRate: true, numberOfAudioChannels: true}});
    return `${r.sampleRate}Hz · ${r.numberOfAudioChannels}ch`;
  }
  // It needs a global, web-standard Worker. Bun and Deno have one; Node
  // doesn't (worker_threads is a different API), so run it under Bun.
  const code = `import {parseMediaOnServerWorker} from "@remotion/media-parser/server-worker";
const r = await parseMediaOnServerWorker({src: ${JSON.stringify(src)}, acknowledgeRemotionLicense: true, fields: {sampleRate: true, numberOfAudioChannels: true}});
console.log(r.sampleRate + "Hz · " + r.numberOfAudioChannels + "ch");
process.exit(0);`;
  return `${execFileSync("bun", ["-e", code], {cwd: projectRoot, encoding: "utf8"}).trim()} (under Bun: Node has no global Worker)`;
});

// --- @remotion/bundler + @remotion/renderer ---------------------------------

let serveUrl = null;
await step("bundler bundle()", async () => {
  // remotion.config.ts doesn't apply to the Node APIs, so rspack and the
  // skia/tailwind override are passed explicitly.
  serveUrl = await bundle({entryPoint: join(projectRoot, "src", "index.ts"), rspack: true, bundlerOverride});
  return serveUrl;
});
await step("renderer ensureBrowser()", async () => JSON.stringify(await ensureBrowser({browserExecutable})));
let browser = null;
await step("renderer openBrowser()", async () => {
  browser = await openBrowser("chrome", {browserExecutable, chromiumOptions});
  return "opened; reused by every call below";
});
const shared = {serveUrl, puppeteerInstance: browser, browserExecutable, chromiumOptions};

await step("renderer getCompositions()", async () => (await getCompositions(serveUrl, shared)).map((c) => `${c.id} (${c.durationInFrames}f)`).join(", "));
await step("renderer selectComposition() + renderStill()", async () => {
  const composition = await selectComposition({...shared, id: "Poster"});
  const output = join(out, "poster.png");
  await renderStill({...shared, composition, output});
  return `Poster ${composition.width}×${composition.height} → out/renderer-apis/poster.png (${kb(output)})`;
});

// ShowcaseReel rather than the template's MyComp, whose component renders
// nothing: blank frames can't show that the right frames came out.
let reel = null;
await step("renderer selectComposition(ShowcaseReel)", async () => {
  reel = await selectComposition({...shared, id: "ShowcaseReel"});
  return `${reel.width}×${reel.height}, ${reel.fps}fps, ${reel.durationInFrames} frames`;
});
await step("renderer renderFrames() + stitchFramesToVideo()", async () => {
  const framesDir = join(out, "frames");
  const {assetsInfo, frameCount} = await renderFrames({
    ...shared,
    composition: reel,
    inputProps: {},
    outputDir: framesDir,
    imageFormat: "jpeg",
    frameRange: [0, 29],
    onStart: () => undefined,
    onFrameUpdate: () => undefined,
  });
  const output = join(out, "stitched.mp4");
  await stitchFramesToVideo({assetsInfo, fps: reel.fps, width: reel.width, height: reel.height, outputLocation: output});
  const duration = await assertDuration(output, frameCount, reel.fps);
  return `${frameCount} JPEG frames stitched → out/renderer-apis/stitched.mp4 (${duration}, ${kb(output)})`;
});

// h264 chunks are combined by byte-level concatenation (ffmpeg's concat:
// protocol), which only works for a streamable container. So, like Lambda,
// chunks are rendered as "h264-ts" (MPEG-TS) and only the final file is MP4.
// Given .mp4 chunks, combineChunks() quietly keeps just the first one.
const chunks = [join(out, "chunk-0.ts"), join(out, "chunk-1.ts")];
await step("renderer renderMedia() ×2 chunks + combineChunks()", async () => {
  const framesPerChunk = 30;
  for (let i = 0; i < chunks.length; i++) {
    await renderMedia({
      ...shared,
      composition: reel,
      codec: "h264-ts",
      muted: true,
      frameRange: [i * framesPerChunk, (i + 1) * framesPerChunk - 1],
      outputLocation: chunks[i],
    });
  }
  const output = join(out, "combined.mp4");
  await combineChunks({
    outputLocation: output,
    videoFiles: chunks,
    audioFiles: [],
    codec: "h264",
    audioCodec: null,
    fps: reel.fps,
    framesPerChunk,
    preferLossless: false,
    compositionDurationInFrames: reel.durationInFrames,
    // Only the first 60 frames were rendered.
    frameRange: [0, framesPerChunk * chunks.length - 1],
  });
  const duration = await assertDuration(output, framesPerChunk * chunks.length, reel.fps);
  return `2 h264-ts chunks of ${framesPerChunk} frames → out/renderer-apis/combined.mp4 (${duration}, ${kb(output)})`;
});
await step("renderer makeCancelSignal()", async () => {
  const {cancelSignal, cancel} = makeCancelSignal();
  try {
    await renderMedia({
      ...shared,
      composition: reel,
      codec: "h264",
      muted: true,
      cancelSignal,
      outputLocation: join(out, "cancelled.mp4"),
      onProgress: ({renderedFrames}) => {
        if (renderedFrames >= 5) cancel();
      },
    });
  } catch (err) {
    // Only the cancellation counts; any other rejection is a real failure.
    if (!/cancel/i.test(err.message)) throw err;
    return `renderMedia() rejected after cancel(): ${err.message}`;
  }
  throw new Error("renderMedia() finished despite cancel()");
});
await step("renderer getVideoMetadata() (deprecated)", async () => {
  const m = await getVideoMetadata(join(out, "combined.mp4"));
  return `combined.mp4: ${m.width}×${m.height}, ${m.fps}fps, ${m.durationInSeconds.toFixed(2)}s, ${m.codec}`;
});
// Run on the .mp4's AAC track, not sample-tone.wav: in 4.0.527 the compositor
// fails on plain WAV files ("Invalid argument") because it hands ffmpeg's
// abuffer a channel_layout of 0x0 when the header has no channel mask. See
// AGENTS.md.
await step("renderer getSilentParts()", async () => {
  const {audibleParts, silentParts, durationInSeconds} = await getSilentParts({src: join(publicDir, "sample-clip.mp4")});
  return `sample-clip.mp4 (${durationInSeconds.toFixed(2)}s): ${audibleParts.length} audible, ${silentParts.length} silent part(s) (its audio track is silence)`;
});

await browser?.close({silent: true});
console.log(failures === 0 ? "\nAll steps passed." : `\n${failures} step(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
