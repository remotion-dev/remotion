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
import {mkdirSync, readFileSync, readdirSync, rmSync, statSync} from "node:fs";
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
import {VERSION} from "remotion/version";
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
const probe = (src, fields) => parseMedia({src, reader: nodeReader, acknowledgeRemotionLicense: true, fields});
// A render resolving isn't proof it produced the right file, so outputs are
// checked against the number of frames they should contain.
const assertDuration = async (path, frames, fps) => {
  const {durationInSeconds} = await probe(path, {durationInSeconds: true});
  if (Math.abs(durationInSeconds - frames / fps) > 0.05) {
    throw new Error(`${path} is ${durationInSeconds.toFixed(2)}s, expected ${(frames / fps).toFixed(2)}s (${frames} frames)`);
  }
  return `${durationInSeconds.toFixed(2)}s`;
};

// --- Offline helpers from the cloud packages -------------------------------

await step("lambda getRegions()", () => `${getLambdaRegions().length} AWS regions, ${getLambdaRegions({enabledByDefaultOnly: true}).length} of them enabled by default in a new account`);
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
    // It also throws for a missing secret, body or header, so only this
    // message proves the signature check itself rejected the forged body.
    if (err.message !== "Signatures do not match") throw err;
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
  // The handlers turn every failure into an HTTP 500 and never reject, so
  // resolving proves nothing; check the status and the callback.
  if (status !== 200 || received !== payload.renderId) throw new Error(`HTTP ${status}, onSuccess got ${received}`);
  return `HTTP ${status}, onSuccess got ${received}`;
});
await step("lambda expressWebhook({testing, extraHeaders, onError, onTimeout})", async () => {
  const calls = [];
  const headers = {};
  const handler = expressWebhook({
    secret,
    // testing adds the CORS headers remotion.dev's webhook tester needs and
    // answers its OPTIONS preflight; extraHeaders go on every response.
    testing: true,
    extraHeaders: {"X-Showcase": "renderer-apis"},
    onSuccess: () => calls.push("success"),
    onError: (p) => calls.push(`onError(${p.renderId})`),
    onTimeout: (p) => calls.push(`onTimeout(${p.renderId})`),
  });
  const send = async (method, body) => {
    let status = null;
    const sig = `sha512=${createHmac("sha512", secret).update(JSON.stringify(body)).digest("hex")}`;
    const res = {setHeader: (k, v) => (headers[k] = v), status: (s) => ((status = s), res), json: () => res, end: () => res};
    await handler({method, body, header: (name) => (name === "X-Remotion-Signature" ? sig : undefined)}, res);
    return status;
  };
  const preflight = await send("OPTIONS", {});
  const errorStatus = await send("POST", {...payload, type: "error", errors: []});
  const timeoutStatus = await send("POST", {...payload, type: "timeout"});
  const summary = `OPTIONS ${preflight}, error ${errorStatus}, timeout ${timeoutStatus} · ${calls.join(", ")} · X-Showcase: ${headers["X-Showcase"]}, Access-Control-Allow-Origin: ${headers["Access-Control-Allow-Origin"]}`;
  const ok =
    preflight === 200 &&
    errorStatus === 200 &&
    timeoutStatus === 200 &&
    calls.join() === `onError(${payload.renderId}),onTimeout(${payload.renderId})` &&
    headers["X-Showcase"] === "renderer-apis" &&
    headers["Access-Control-Allow-Origin"] === "https://www.remotion.dev";
  if (!ok) throw new Error(summary);
  return summary;
});
await step("lambda appRouterWebhook()", async () => {
  let received = null;
  const handler = appRouterWebhook({secret, onSuccess: (p) => (received = p.renderId)});
  const response = await handler(
    new Request("http://localhost/webhook", {method: "POST", headers: {"X-Remotion-Signature": signature}, body: JSON.stringify(payload)}),
  );
  if (response.status !== 200 || received !== payload.renderId) throw new Error(`HTTP ${response.status}, onSuccess got ${received}`);
  return `HTTP ${response.status}, onSuccess got ${received}`;
});
await step("lambda pagesRouterWebhook()", async () => {
  let status = null;
  let received = null;
  const handler = pagesRouterWebhook({secret, onSuccess: (p) => (received = p.renderId)});
  const req = {method: "POST", body: payload, headers: {"x-remotion-signature": signature}};
  const res = {setHeader: () => undefined, status: (s) => ((status = s), res), json: () => res, end: () => res};
  await handler(req, res);
  if (status !== 200 || received !== payload.renderId) throw new Error(`HTTP ${status}, onSuccess got ${received}`);
  return `HTTP ${status}, onSuccess got ${received}`;
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

// inputProps is optional for getCompositions()/selectComposition() in v4 and
// required from v5, so it's always passed. The positional
// getCompositions(serveUrl, options) form is the pre-4.0.497 signature.
await step("renderer getCompositions()", async () => {
  const compositions = await getCompositions({...shared, inputProps: {}});
  const showcase = compositions.find((c) => c.id === "ShowcaseReel");
  // Registered with durationInFrames={300}; its calculateMetadata() returns 315.
  if (showcase?.durationInFrames !== 315) throw new Error(`ShowcaseReel is ${showcase?.durationInFrames} frames, expected 315 from calculateMetadata()`);
  return compositions.map((c) => `${c.id} (${c.durationInFrames}f)`).join(", ");
});
await step("renderer selectComposition() + renderStill()", async () => {
  const composition = await selectComposition({...shared, id: "Poster", inputProps: {}});
  const output = join(out, "poster.png");
  await renderStill({...shared, composition, output});
  return `Poster ${composition.width}×${composition.height} → out/renderer-apis/poster.png (${kb(output)})`;
});

// ShowcaseReel rather than the template's MyComp, whose component renders
// nothing: blank frames can't show that the right frames came out.
let reel = null;
await step("renderer selectComposition(ShowcaseReel)", async () => {
  reel = await selectComposition({...shared, id: "ShowcaseReel", inputProps: {}});
  return `${reel.width}×${reel.height}, ${reel.fps}fps, ${reel.durationInFrames} frames`;
});
await step("renderer selectComposition({inputProps})", async () => {
  const {props} = await selectComposition({...shared, id: "ShowcaseReel", inputProps: {title: "Hello"}});
  // inputProps are merged over defaultProps: title is replaced, subtitle keeps
  // its default.
  if (props.title !== "Hello" || props.subtitle !== reel.props.subtitle) throw new Error(`got props ${JSON.stringify(props)}`);
  return `props ${JSON.stringify(props)}`;
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
await step("renderer renderFrames({imageSequencePattern, onFrameBuffer})", async () => {
  const framesDir = join(out, "pattern-frames");
  await renderFrames({
    ...shared,
    composition: reel,
    inputProps: {},
    outputDir: framesDir,
    imageFormat: "jpeg",
    frameRange: [0, 4],
    imageSequencePattern: "reel-[frame].[ext]",
    onStart: () => undefined,
    onFrameUpdate: () => undefined,
  });
  const files = readdirSync(framesDir).sort();
  // With outputDir null, nothing is written: each frame arrives as a Buffer.
  let buffers = 0;
  let magic = null;
  await renderFrames({
    ...shared,
    composition: reel,
    inputProps: {},
    outputDir: null,
    imageFormat: "jpeg",
    frameRange: [0, 2],
    onFrameBuffer: (buffer) => {
      buffers++;
      magic ??= buffer.subarray(0, 3).toString("hex");
    },
    onStart: () => undefined,
    onFrameUpdate: () => undefined,
  });
  if (files.length !== 5 || !files.every((f) => /^reel-\d+\.jpeg$/.test(f)) || buffers !== 3 || magic !== "ffd8ff") {
    throw new Error(`files ${files.join(", ")}; ${buffers} buffers starting ${magic}`);
  }
  return `imageSequencePattern → ${files[0]} … ${files.at(-1)}; onFrameBuffer got ${buffers} JPEG buffers (ff d8 ff)`;
});
await step("renderer renderFrames({frames})", async () => {
  const framesDir = join(out, "selected-frames");
  let started = null;
  const {frameCount} = await renderFrames({
    ...shared,
    composition: reel,
    inputProps: {},
    outputDir: framesDir,
    imageFormat: "jpeg",
    frames: [0, 30, 60],
    onStart: (data) => (started = data.frameCount),
    onFrameUpdate: () => undefined,
  });
  // The files keep the source frame numbers rather than counting 0, 1, 2.
  const files = readdirSync(framesDir).sort();
  const numbers = files.map((f) => Number(/(\d+)\.jpeg$/.exec(f)?.[1]));
  if (frameCount !== 3 || started !== 3 || numbers.join() !== "0,30,60") throw new Error(`frameCount ${frameCount}, onStart ${started}, files ${files.join(", ")}`);
  return `${frameCount} frames → ${files.join(", ")}`;
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

// Encoding options, 30 frames each. Options whose effects can be read back
// independently share one render.
await step("renderer renderMedia() scale, pixelFormat, colorSpace, gopSize, metadata, enforceAudioTrack + sampleRate", async () => {
  const output = join(out, "options.mp4");
  await renderMedia({
    ...shared,
    composition: reel,
    codec: "h264",
    frameRange: [0, 29],
    scale: 0.5,
    pixelFormat: "yuv444p",
    colorSpace: "bt709",
    gopSize: 10,
    metadata: {title: "Remotion showcase"},
    // ShowcaseReel has no audio, so there is no audio track unless enforced.
    enforceAudioTrack: true,
    sampleRate: 44100,
    outputLocation: output,
  });
  // Without these options, 4.0.527 writes 1280×720 yuvj420p tagged bt470bg,
  // with one keyframe, no title tag, and no audio track (48000Hz when enforced).
  const {dimensions, slowKeyframes, metadata, audioCodec, sampleRate} = await probe(output, {
    dimensions: true,
    slowKeyframes: true,
    metadata: true,
    audioCodec: true,
    sampleRate: true,
  });
  const {pixelFormat, colorSpace} = await getVideoMetadata(output);
  const keyframes = slowKeyframes.map((k) => k.presentationTimeInSeconds.toFixed(2)).join(", ");
  const title = metadata.find((m) => m.key === "title")?.value;
  if (dimensions.width !== 640 || dimensions.height !== 360) throw new Error(`scale 0.5 gave ${dimensions.width}×${dimensions.height}, expected 640×360`);
  if (pixelFormat !== "yuv444p") throw new Error(`pixelFormat is ${pixelFormat}, expected yuv444p`);
  if (colorSpace !== "bt709") throw new Error(`colorSpace is ${colorSpace}, expected bt709`);
  // gopSize 10 over 30 frames at 30fps: a keyframe every 1/3s.
  if (keyframes !== "0.00, 0.33, 0.67") throw new Error(`keyframes at ${keyframes}s, expected 0.00, 0.33, 0.67`);
  if (title !== "Remotion showcase") throw new Error(`title tag is ${title}`);
  if (audioCodec !== "aac" || sampleRate !== 44100) throw new Error(`audio track is ${audioCodec} at ${sampleRate}Hz, expected aac at 44100Hz`);
  return `${dimensions.width}×${dimensions.height}, ${pixelFormat}, ${colorSpace}, keyframes at ${keyframes}s, title "${title}", ${audioCodec} ${sampleRate}Hz`;
});
await step("renderer renderMedia() vp9 + opus, multi-range frameRange", async () => {
  const output = join(out, "vp9-opus.webm");
  await renderMedia({
    ...shared,
    composition: reel,
    codec: "vp9",
    audioCodec: "opus",
    enforceAudioTrack: true,
    frameRange: [
      [0, 14],
      [30, 44],
    ],
    outputLocation: output,
  });
  const {container, videoCodec, audioCodec} = await probe(output, {container: true, videoCodec: true, audioCodec: true});
  if (container !== "webm" || videoCodec !== "vp9" || audioCodec !== "opus") throw new Error(`got ${container} with ${videoCodec}/${audioCodec}, expected webm with vp9/opus`);
  // Two 15-frame ranges: 30 frames in total.
  const duration = await assertDuration(output, 30, reel.fps);
  return `${container} with ${videoCodec}/${audioCodec}, frames 0-14 + 30-44 → ${duration} (${kb(output)})`;
});
await step("renderer renderMedia() videoBitrate + x264Preset + audioBitrate", async () => {
  const sizes = {};
  for (const [label, videoBitrate, x264Preset, audioBitrate] of [["low", "150k", "ultrafast", "32k"], ["high", "3M", "slow", "192k"]]) {
    const output = join(out, `bitrate-${label}.mp4`);
    // videoBitrate replaces crf; the two can't be combined.
    await renderMedia({...shared, composition: reel, codec: "h264", videoBitrate, x264Preset, audioBitrate, enforceAudioTrack: true, frameRange: [0, 29], outputLocation: output});
    sizes[label] = statSync(output).size;
  }
  if (sizes.high < sizes.low * 3) throw new Error(`3M/slow is ${sizes.high} bytes, 150k/ultrafast is ${sizes.low} bytes`);
  return `150k ultrafast: ${(sizes.low / 1024).toFixed(0)} KB, 3M slow: ${(sizes.high / 1024).toFixed(0)} KB`;
});
await step("renderer renderMedia() gif, everyNthFrame, numberOfGifLoops", async () => {
  const output = join(out, "reel.gif");
  await renderMedia({...shared, composition: reel, codec: "gif", everyNthFrame: 3, numberOfGifLoops: 2, frameRange: [0, 29], outputLocation: output});
  const gif = readFileSync(output);
  // Every frame of a GIF starts with a Graphic Control Extension (21 f9 04),
  // and the NETSCAPE2.0 block stores the loop count as a little-endian uint16.
  const frames = gif.toString("hex").split("21f904").length - 1;
  const netscape = gif.indexOf("NETSCAPE2.0");
  const loops = netscape === -1 ? "none" : gif.readUInt16LE(netscape + 13);
  if (gif.toString("ascii", 0, 6) !== "GIF89a" || frames !== 10) throw new Error(`header ${gif.toString("ascii", 0, 6)}, ${frames} frames`);
  return `GIF89a, 30 frames at everyNthFrame 3 → ${frames} frames, NETSCAPE loop count ${loops} (${kb(output)})`;
});
await step("renderer renderMedia() crf 10 vs 40", async () => {
  const sizes = {};
  for (const crf of [10, 40]) {
    const output = join(out, `crf-${crf}.mp4`);
    await renderMedia({...shared, composition: reel, codec: "h264", muted: true, crf, frameRange: [0, 29], outputLocation: output});
    sizes[crf] = statSync(output).size;
  }
  // Same 30 frames; a lower crf means higher quality and a bigger file.
  if (sizes[10] < sizes[40] * 2) throw new Error(`crf 10 is ${sizes[10]} bytes, crf 40 is ${sizes[40]} bytes`);
  return `crf 10: ${(sizes[10] / 1024).toFixed(0)} KB, crf 40: ${(sizes[40] / 1024).toFixed(0)} KB`;
});
await step("renderer renderStill() frame + scale", async () => {
  const still = async (name, frame) => {
    const output = join(out, `reel-${name}.png`);
    await renderStill({...shared, composition: reel, frame, scale: 0.5, output});
    return readFileSync(output);
  };
  const first = await still("first", 0);
  const last = await still("last", reel.durationInFrames - 1);
  const minusOne = await still("minus-one", -1);
  // A PNG's IHDR chunk holds its width and height at bytes 16-23.
  const [width, height] = [first.readUInt32BE(16), first.readUInt32BE(20)];
  if (width !== 640 || height !== 360) throw new Error(`scale 0.5 gave ${width}×${height}, expected 640×360`);
  if (first.equals(last)) throw new Error("frame 0 and the last frame are identical");
  // Negative frames count back from the end.
  if (!minusOne.equals(last)) throw new Error(`frame -1 differs from frame ${reel.durationInFrames - 1}`);
  return `${width}×${height} PNGs; frame -1 is byte-identical to frame ${reel.durationInFrames - 1}, frame 0 differs`;
});
await step("renderer renderStill() imageFormat jpeg/webp/pdf", async () => {
  const formats = {
    jpeg: ["image/jpeg", (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff],
    webp: ["image/webp", (b) => b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP"],
    pdf: ["application/pdf", (b) => b.toString("latin1", 0, 5) === "%PDF-"],
  };
  const results = [];
  for (const [imageFormat, [expectedType, hasMagic]] of Object.entries(formats)) {
    const output = join(out, `reel-frame-100.${imageFormat}`);
    const {contentType} = await renderStill({...shared, composition: reel, frame: 100, imageFormat, output});
    if (contentType !== expectedType || !hasMagic(readFileSync(output))) throw new Error(`${imageFormat}: contentType ${contentType}, starts with ${readFileSync(output).subarray(0, 12).toString("hex")}`);
    results.push(`${imageFormat} (${contentType}, ${kb(output)})`);
  }
  return results.join(", ");
});
await step("renderer renderStill() onArtifact", async () => {
  // ShowcaseReel emits no artifacts. ExtendedReel's CoreEnvironmentScene
  // (scene 17, starting at 17 × (75 - 15) = 1020) emits an <Artifact> on its
  // first frame.
  const extended = await selectComposition({...shared, id: "ExtendedReel", inputProps: {}});
  const artifacts = [];
  await renderStill({...shared, composition: extended, frame: 1020, output: join(out, "extended-1020.png"), onArtifact: (a) => artifacts.push(a)});
  const [artifact] = artifacts;
  const version = artifact ? JSON.parse(String(artifact.content)).version : null;
  if (artifacts.length !== 1 || artifact.filename !== "core-api-scene-env.json" || version !== VERSION) {
    throw new Error(`got ${artifacts.length} artifact(s): ${artifacts.map((a) => a.filename).join(", ")} (version ${version})`);
  }
  return `${artifact.filename}, version ${version}`;
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
// docs/findings.md.
await step("renderer getSilentParts()", async () => {
  const {audibleParts, silentParts, durationInSeconds} = await getSilentParts({
    src: join(publicDir, "sample-clip.mp4"),
    // Quieter than -30dB for at least 0.5s counts as silence (defaults: -20dB, 1s).
    noiseThresholdInDecibels: -30,
    minDurationInSeconds: 0.5,
  });
  // Its audio track is silence, so all of it should be one silent part.
  if (audibleParts.length !== 0 || silentParts.length !== 1) throw new Error(`${audibleParts.length} audible, ${silentParts.length} silent part(s), expected 0 and 1`);
  const [{startInSeconds, endInSeconds}] = silentParts;
  return `sample-clip.mp4 (${durationInSeconds.toFixed(2)}s): 0 audible, 1 silent part (${startInSeconds.toFixed(2)}-${endInSeconds.toFixed(2)}s)`;
});

await browser?.close({silent: true});
console.log(failures === 0 ? "\nAll steps passed." : `\n${failures} step(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
