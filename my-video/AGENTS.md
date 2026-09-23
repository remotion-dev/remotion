# my-video

A Remotion project: videos are written as React components and rendered to MP4/WebM. Remotion and all `@remotion/*` packages are pinned to the same version (see `package.json`) — keep them in lockstep when upgrading (`npx remotion upgrade`).

## Commands

```console
npm i                 # install dependencies
npm run dev           # Remotion Studio preview (http://localhost:3000)
npm run lint          # ESLint + TypeScript check — run before committing
npx remotion render   # render a composition to a video file
```

Rendering and Studio need Node.js and a Chrome/Chromium download; they work in Claude Code, Claude Cowork and local terminals, but not in claude.ai chat.

## Project structure

- `src/index.ts` — entry point, registers the root component
- `src/Root.tsx` — every `<Composition>` must be registered here
- `src/Composition.tsx` — the `MyComp` composition (1280×720 @ 30fps)
- `src/showcase/` — reference reels exercising most of the installed `@remotion/*` packages: `ShowcaseReel` (transitions incl. `useTransitionProgress()`, shapes, motion blur, noise, captions incl. SRT parse/serialize and an ElevenLabs-transcript conversion, paths, rough-notation, animation-utils), `ExtendedReel` (effects, media/gif/preload/mac-cursors, video-matting, media-utils audio, whisper-webgpu, lottie, animated-emoji, `@remotion/three` twice — a rotating mesh (`ThreeScene`) and real extruded 3D typography (`ThreeTextScene`, adapted from [remotion-dev/3d-text](https://github.com/remotion-dev/3d-text) — see below), skia, rive (API surface only — see below), layout-utils/rounded-text-box/fonts, sfx, gsap, core `remotion` fundamentals (every `Easing` curve, `<Series>`/`<Loop>`/`<Freeze>`/`random()`), the SVG half of core `remotion`'s `Interactive.*` family (used in `RouteScene`, alongside the HTML half already in `CoreEnvironmentScene`), core media/canvas components, `@remotion/media-parser` and `@remotion/webcodecs` run for real in the render browser (`MediaToolsScene`), a video as a Three.js texture (`ThreeScene`'s `VideoTexturePlane`), core environment/introspection APIs incl. `getStaticFiles()`/`watchStaticFile()`/`useBufferState()`/`Experimental.useIsPlayer()`, and every `interpolate()` option in `InterpolateScene` — easing arrays, `posterize`, all four extrapolate types, `output: "perceptual-scale"`, CSS-string/`outputType`/font-weight/tuple outputs and the two exported option validators), and `FullReel` (both combined into one video, plus the complete `@remotion/transitions` presentation catalog — every built-in presentation and `springTiming()` — and a `zMatrix()`-driven outro wordmark). Point at a scene here as a worked example before writing a new one from scratch.
- `scripts/renderer-apis.mjs` — the Node-side APIs that can't run in a scene (`@remotion/bundler`, `@remotion/renderer`, the offline `@remotion/lambda`/`@remotion/cloudrun` helpers, whisper.cpp's `toCaptions()`, media-parser's Node readers/writers), run for real: `node scripts/renderer-apis.mjs --browser-executable=… --gl=swangle`. Every step prints its real outcome, and render outputs are checked for the right duration.
- `player-demo/` — a standalone web page embedding `@remotion/player`'s `<Player>` (with its ref API and events) and `<Thumbnail>`s of `ShowcaseReel`. They can't live inside a composition (`<Thumbnail>` sets the global `window.remotion_isPlayer`), so this is the one part of the showcase that isn't a video. `node player-demo/build.mjs [--serve]`; see its README.
- `bundler-override.mjs` — the skia/tailwind bundler override, shared by `remotion.config.ts` and that script's `bundle()` call (the Node APIs don't read `remotion.config.ts`)
- `src/index.css` — Tailwind v4 is enabled (`@import "tailwindcss"`)
- `public/` — static assets, referenced with `staticFile()`, including `sample-clip.mp4`/`.gif`/`.webm` (the `.webm` is a VP9 copy for anything that decodes through WebCodecs, see below), `sample-tone.wav`, `sample-lottie.json` (locally-generated stand-ins used by `ExtendedReel`; regenerate the media ones with `node scripts/generate-sample-media.mjs`), `bangers.woff2` (a real font file copied from this monorepo's own `packages/example/public/`, used by `RoundedTextBoxScene` to demonstrate `@remotion/fonts`' `loadFont()` — a genuinely different function from `@remotion/google-fonts`' same-named one), and `rubik-bold-typeface.json` (a three.js typeface JSON — Rubik Bold, OFL-licensed, exported from Google's Rubik font — copied from [remotion-dev/3d-text](https://github.com/remotion-dev/3d-text)'s `src/Bold.json`, loaded by `ThreeTextScene` via `FontLoader.loadAsync()`)
- `.claude/elements/` — local copy of the [Remotion Elements](https://www.remotion.dev/elements/) gallery, drop-in components to copy into a scene (see "Elements" below)
- `out/`, `build/`, `node_modules/`, `remotion-video-skill.zip` — generated, never commit

## Rendering environments without a GPU

`@remotion/effects` and `@remotion/three` (and anything else using a canvas-based component's `effects` prop, or `<ThreeCanvas>`) need a working WebGL2 context. On a machine with a real GPU this needs nothing beyond `Config.setChromiumOpenGlRenderer('angle')` (or `--gl=angle` on the CLI) per the `light-leaks.md`/`3d.md` guides.

In a GPU-less sandbox, Chromium's software WebGL fallback additionally needs `--enable-unsafe-swiftshader`, which Remotion's CLI doesn't expose directly (only `--gl=angle` combined with the unreleased v5-breaking-changes flag adds it automatically). Work around this without touching that project-wide flag by pointing `--browser-executable` at a tiny wrapper script that forwards to the real browser binary with the flag always included:

```sh
cat > /tmp/headless-shell-swiftshader <<'EOF'
#!/bin/sh
exec /path/to/your/headless_shell --enable-unsafe-swiftshader "$@"
EOF
chmod +x /tmp/headless-shell-swiftshader
npx remotion render ExtendedReel out/extended-reel.mp4 --browser-executable=/tmp/headless-shell-swiftshader --gl=swangle
```

Without this, effects/`<ThreeCanvas>` scenes render as solid black — Chromium accepts the render silently rather than erroring, so check with `--log=verbose` for the "Automatic fallback to software WebGL has been deprecated" warning if a canvas-based scene comes out blank.

## `<ThreeWebGPUCanvas>` and HTML-in-canvas need a newer Chrome than this sandbox ships

`@remotion/three/webgpu`'s `<ThreeWebGPUCanvas>` (Three.js's experimental WebGPU renderer) throws a real `GPUTextureViewDescriptor`/`swizzle` API-mismatch error inside Three.js's own async `compileAsync()` under this sandbox's software WebGPU implementation. It happens outside React's render lifecycle, so no error boundary or try/catch can recover from it — it aborts the whole render. `ThreeScene` therefore only uses `<ThreeCanvas>`; see its header comment for the full story of the (unsuccessful) error-boundary attempt.

Core `HtmlInCanvas` and anything built on it need Chrome 149+ with `chrome://flags/#canvas-draw-element` enabled (see `html-in-canvas.md`) — this sandbox's headless Chromium is 141. That includes most of `@remotion/transitions`' catalog: besides this project's custom circle-reveal shader, `bookFlip`, `crossZoom`, `crosswarp`, `dissolve`, `dreamyZoom`, `filmBurn`, `linearBlur`, `ripple`, `swap`, `zoomBlur`, `zoomInOut` and `blurSlide` are ALL built with `makeHtmlInCanvasPresentation()` internally (check each's source under `packages/transitions/src/presentations/`) — only `fade`, `slide`, `wipe`, `flip`, `clockWipe`, `iris`, `none` and `pushCut` render with plain CSS (20 built-ins in total). `iris` (`@remotion/transitions/iris`, a CSS `clip-path` circle) was missed by an earlier audit that called the catalog complete; `FullReel` now uses the real one, and the custom shader was renamed from `irisWipe` to `circleReveal` so the two aren't confused. `CoreMediaScene` checks `HtmlInCanvas.isSupported()` before rendering it directly; `FullReel`'s `src/showcase/htmlInCanvasPresentation.ts` wraps every canvas-based presentation in the same capability check, falling back to a plain `fade()` when it's unsupported rather than throwing mid-render — the same honest-fallback pattern as the network-dependent packages below.

## `ThreeTextScene`: extruded 3D text via `three-stdlib`, not `three/examples/jsm`

`ThreeTextScene` is a second, genuinely different `@remotion/three` technique from `ThreeScene`'s rotating mesh: real extruded 3D typography, adapted from Remotion's own [remotion-dev/3d-text](https://github.com/remotion-dev/3d-text) template repo (`FontLoader` parses a self-hosted three.js typeface JSON into a `Font`; `TextGeometry` extrudes each character; `@react-three/fiber`'s `extend()` registers the custom geometry). Two things needed fixing from the original template rather than copying it verbatim:

- **Import path**: the template imports `TextGeometry` from `three-stdlib` and `FontLoader` from `three/examples/jsm/loaders/FontLoader.js`. The `three` version installed here (0.185.1) ships **zero** `.d.ts` files anywhere under `examples/jsm` — not just for these two, checked `GLTFLoader.js` too — so importing either addon straight from `three/examples/jsm/*` fails `tsc` with `TS7016`. `three-stdlib` (the standard, actively-maintained, typed companion package to `@react-three/fiber`) ships both with real `.d.ts` files, so this project imports both `FontLoader` and `TextGeometry` from there and takes `three-stdlib` as a real dependency instead. Separately, `three` itself (the core package, not its `examples/jsm` addons) also ships no `.d.ts` at all in this version — Remotion's own monorepo packages (`packages/three`, `packages/example`, etc.) all carry `@types/three` as an explicit dependency for exactly this reason, so this project now does too, pinned to match the installed `three` version exactly.
- **Canvas background/scale**: the template targets a square 1080×1080 composition with `<ThreeCanvas orthographic camera={{zoom: 90, near: -40}} style={{backgroundColor: 'white'}}>`. Ported as-is into this project's 1280×720 (16:9) reels, the wider aspect ratio put far more of the extruded letters' deep side faces into view, and a white canvas background clashed with every other scene's dark theme (and made the bottom caption unreadable where it crossed onto white). Tuned `zoom` down to 55 and swapped the canvas background for `palette.bg` — same technique, same math, fit to this project's own frame and visual language.

## `@remotion/rive` can hang a render, not just fail it

`<RemotionRiveCanvas>` fetches its Rive WASM runtime from a URL hardcoded inside the package itself (`https://unpkg.com/@rive-app/canvas-advanced@.../rive.wasm`) — not the `src` prop, and not configurable — so it fails in any network-restricted sandbox for every `.riv` file, same root cause as the `remotion.media` block below. What makes this one different: on a real render test (the exact sample URL from the package's own docs, `<RemotionRiveCanvas>` wrapped in a React error boundary), the component's fetch-failure branch never calls `continueRender()`/`cancelRender()` on its own mount-time `delayRender()` handle — it only sets local error state, which a later render re-throws (an error boundary *can* catch that re-throw, unlike the `<ThreeWebGPUCanvas>` crash above). But the dangling `delayRender()` handle from the failed fetch is never released, and a real render attempt hung in a re-render loop for 90+ seconds with no sign of resolving on its own. `RiveScene` therefore doesn't render `<RemotionRiveCanvas>` at all here — it explains the API and the failure mode as static text (see the scene's own comment for the full story).

## Core `remotion` exports that can't be shown in a render

- **`MediaPlaybackError`** is thrown by core `<Video>` when the browser's own `<video>` element errors, and a real render test showed there's no safe way to catch one in a rendered video. With no `onError` prop, a broken `src` (a local 404 was used) throws `MediaPlaybackError` from inside a native `error` event listener, outside React's render lifecycle. A React error boundary wrapped around the `<Video>` did **not** catch it, and the whole render aborted. With `onError` passed, the throw is suppressed, but `<Video>`'s own "Loading duration" `delayRender()` is never cleared on that failure, so the render times out after ~28s instead. That's the same shape of problem as `@remotion/rive` above. No scene triggers it; point any `<Video>` at a source you know is good.
- **`Experimental.Clipper` and `Experimental.Null`** are removed-API stubs: both components unconditionally throw ("has been removed as of Remotion v4.0.228"), so rendering either aborts the render. Only `Experimental.useIsPlayer()` is live, and `CoreEnvironmentScene` uses it.
- **`getStaticFiles()` and `watchStaticFile()`** do work in a render: `CoreEnvironmentScene` lists all of `public/`. But `watchStaticFile()` is a no-op outside the Studio (it logs a warning and returns a no-op `cancel`), so its callback only ever fires while editing in the Studio. Both move to `@remotion/studio` in v5.
- **`useBufferState().delayPlayback()`** is a deliberate no-op during a CLI render (it only pauses Studio/Player playback), so pairing it with an async load, as `CoreEnvironmentScene` does with `prefetch()`, can't stall a render.
- **`springTiming()` inside a `TransitionSeries`** lasts as long as the spring takes to settle (~23 frames for `damping: 200` at 30fps) unless you pass `durationInFrames`. `FullReel`'s duration formula assumes every transition is 15 frames, so the reel ended on 8 blank frames until `springT` was pinned with `durationInFrames: TRANSITION_DURATION`. Compute durations with `timing.getDurationInFrames({fps})` or pin them.

## Option-level behavior found while wiring props

These came up while adding the less obvious props and options to each scene. Each one was checked against the installed package or a real render.

- **`<Img onImageError>` must unmount the `<Img>`.** Its loading `delayRender()` is only released when the component unmounts, so a callback that logs the error and leaves the `<Img>` mounted still times the render out (~28s in a real test). Swapping in a fallback, as `CoreMediaScene`'s `ImgFallbackTile` does, finished in ~5s. Pair it with `maxRetries={0}` if you don't want the retries.
- **`<TransitionSeries.Overlay>` doesn't shorten the timeline.** Unlike a `<TransitionSeries.Transition>`, an overlay sits centered on the cut between two sequences and takes no frames away. `FullReel` has one, so its duration formula subtracts 15 frames for every cut *except* the overlay: `SCENE_COUNT * 75 - (SCENE_COUNT - 1 - OVERLAY_COUNT) * 15` = 1410.
- **`createTikTokStyleCaptions()` only starts a new page at a token that begins with a space.** Tokens must be `" word"`, not `"word "`. `sampleCaptions.ts` used trailing spaces, so the whole transcript came out as one page that ran off-screen; it's fixed now and `CaptionsScene` shows three pages.
- **`useVideoConfig()` inside a `<Sequence>` returns that sequence's `durationInFrames`** (and `width`/`height`, if the sequence sets them), not the composition's. `CutFlash` relies on this to fade over whatever length the overlay gives it.
- **`prefetch()` resolves immediately during a render**, so its `onProgress` callback never fires there. `CoreEnvironmentScene`'s counter stays at 0 in a CLI render and only moves in the Studio or Player.
- **`useRemotionEnvironment()` / `getRemotionEnvironment()` return `isStudio: undefined` during a CLI render**, not `false`, even though the type says `boolean`. `isStudio`, `isPlayer` and `isReadOnlyStudio` are copied straight from `window.remotion_*` globals that are never set while rendering (`packages/core/src/get-remotion-environment.ts`). Check them for truthiness, never `=== false`. `CoreEnvironmentScene` prints the raw value, which is why its readout says `isStudio=undefined`.
- **`<Circle box>` defaults to `"around"`** (an ellipse circumscribing the text), and every rough-notation annotation except `<Box>` (7) defaults to `strokeWidth` 20. At that width, `OutroScene`'s circle buried "Claude Cowork", so it passes `strokeWidth={6}`.
- **`springTiming({reverse: true})`** plays the spring backwards: progress still goes 0→1, but starts slow and finishes fast. It is pinned with `durationInFrames` for the reason in the section above.

Options that are wired but have no visible effect here, or are left out on purpose:

- `blur({horizontal, vertical})` in `EffectsScene`: the chain starts from a flat `<Solid>`, so there's nothing to blur along either axis.
- `vignette({mode: "alpha"})`: fades to transparent rather than to a color. The page behind this scene is the same dark color, so it would look identical to the `color` mode already shown.
- `useGsapTimeline(build, {dependencies})`: rebuilds the timeline when the listed values change. `GsapScene`'s timeline reads no props or state, so it passes none.
- `@remotion/media-utils`' `channel` option: picks one channel of a multi-channel file. `sample-tone.wav` is mono (checked: 1 channel, 44.1kHz), so a stereo asset would be needed to show it.
- `<Artifact>` with `Uint8Array` content or `downloadBehavior`: `CoreEnvironmentScene` emits a text artifact only. Binary content and download behavior only matter for the file written next to the render, not for anything drawn in the frame.
- `random(null)`: returns a real `Math.random()` value, which is exactly the nondeterminism the seeded `random()` exists to avoid.

## WebCodecs, media decoding and the Node-side APIs

Found while closing the gaps a cross-check against remotion.dev/docs/api turned up. Each was confirmed with a real render or run.

- **This environment's Chromium can't decode H.264 or AAC through WebCodecs.** `@remotion/media`'s `<Video>` then falls back to `<OffthreadVideo>` without telling you: the warning is only logged from the main tab. `MediaScene` had been rendering through that fallback all along. Anything WebCodecs-based (`<Video>`, `@remotion/media-parser` decoding, `@remotion/webcodecs`, a video texture) now uses `public/sample-clip.webm` (VP9), and `MediaScene` passes `disallowFallbackToOffthreadVideo` so a regression fails the render instead of hiding. `canReencodeVideoTrack()`/`canReencodeAudioTrack()` report `false` for the H.264/AAC `.mp4`, which `MediaToolsScene` shows.
- **`<Html5Video>`'s old "hang" was H.264, not the component.** Given the `.mp4`, the browser errors immediately (`DEMUXER_ERROR_NO_SUPPORTED_STREAMS`). But during a render `<Html5Video>` never calls `onError`: `packages/core/src/video/VideoForRendering.tsx` returns early when it's set. So the render just waits out its ~28s `delayRender()`. With the `.webm`, 9 full renders and 6 stills finished with no timeouts. But a decodable `<video>` in the frame blanks canvas-based components beside it, the same as `preloadVideo()` above: in `CoreMediaScene`, `<AnimatedImage>` and `<CanvasImage>` came out white. So it plays dimmed behind `CaptionsScene`'s captions, which has no canvases. It isn't frame-perfect (Remotion's own `video-tags.mdx` says so): 2–11 of 90 frames repeated the previously rendered frame, and frame 0 sometimes came out blank.
- **Inside `<ThreeCanvas>` that fallback is fatal.** `<OffthreadVideo>` renders an `<Img>`, and react-three-fiber rejects it ("Img is not part of the THREE namespace").
- **`preloadVideo()` can blank a render.** It leaves a hidden `<video preload="auto">` in the page. With a clip this Chromium can decode, every canvas-based component in the scene (`<Gif>`, `<Video>`) rendered blank. Preloading only helps Studio/Player playback, so `MediaScene` skips it while rendering.
- **`useOffthreadVideoTexture()`/`useVideoTexture()` are deprecated.** The documented replacement is a headless `<Video>` whose `onVideoFrame` draws into a `CanvasTexture` (`VideoTexturePlane.tsx`).
- **`<Thumbnail>` (`@remotion/player`) can't be nested in a composition.** It sets the global `window.remotion_isPlayer = true` in a layout effect with no cleanup, and the outer render depends on that flag being `false`. It's for embedding in a web app, like `<Player>`, so no scene renders it.
- **`lightLeak()` covers everything around `progress: 0.5`** (the leak grows in, then retracts), and **`starburst()` ignores its input** (it generates rays), so it goes first in a chain. The standalone `@remotion/light-leaks` and `@remotion/starburst` packages are the deprecated ones.
- **media-parser URL handling:** `parseMediaOnWebWorker()` needs an absolute URL, because a worker has nothing to resolve `/public/…` against. `universalReader` treats a leading `/` as a filesystem path and calls Node's `fs`, which fails in the browser. `parseMedia()` itself is deprecated in favour of Mediabunny.
- **Node side, from `scripts/renderer-apis.mjs`:**
  - `bundle()` ignores `remotion.config.ts`, so it needs `rspack: true` and the override passed explicitly (`bundler-override.mjs`).
  - `speculateFunctionName()` and the three webhook handlers come from `@remotion/lambda/client`, not `@remotion/lambda`.
  - `parseMediaOnServerWorker()` needs a global web-standard `Worker`, which Bun and Deno have and Node doesn't. The script runs that step under Bun.
  - `combineChunks()` with `codec: "h264"` joins chunks by byte concatenation, so the chunks must be rendered as `h264-ts`, as Lambda does. Given `.mp4` chunks it resolves normally but keeps only the first chunk (30 of 60 frames here). Pass `frameRange` if the chunks cover part of the composition.
  - `installInStudio()`/`addElementLibraryToStudio()` return `{success: false, code: "unsupported-origin"}` outside an HTTPS or local-dev page.
- **`getSilentParts()` fails on plain WAV files (an upstream bug in 4.0.527).** In `packages/compositor/rust/get_silent_parts.rs`, the `abuffer` filter gets `channel_layout=0x{decoder.channel_layout().bits()}`. A WAV header without a channel mask gives `0x0`, which ffmpeg rejects ("Compositor error: Invalid argument"), for mono and stereo alike. AAC in an mp4 works. The fix would be to fall back to the default layout for the channel count. The script runs it on the `.mp4` instead.
- **Listed on remotion.dev/docs/api but absent from 4.0.527:**
  - `ensureFfmpeg()`, `ensureFfprobe()` and `getCanExtractFramesFast()` (the compositor ships its own ffmpeg);
  - `downloadVideoMattingModel()` and `@remotion/whisper-webgpu`'s `downloadWhisperModel()`, which are newer upstream.
  - The index's `getAvailableEmoji()` is a typo for `getAvailableEmojis()`.
- **Not exercised, because they need credentials, a license key or network:**
  - the AWS calls of `@remotion/lambda` and the GCP calls of `@remotion/cloudrun`;
  - all of `@remotion/vercel`;
  - `@remotion/licensing`;
  - `installWhisperCpp()`/`downloadWhisperModel()`/`transcribe()`.

## `@remotion/video-matting`, `@remotion/whisper-webgpu` and `@remotion/sfx` all need network access to `remotion.media`

The first two run a real ML model locally in the browser (background removal and speech transcription respectively), downloaded from `remotion.media` on first use; `@remotion/sfx`'s exports are plain `https://remotion.media/*.wav` URLs meant for `<Audio src={...}>`. All three need outbound network access to that one host, which a sandboxed environment may block the same way it can block `fonts.gstatic.com` (see the `@remotion/google-fonts` note below) — here it fails with `net::ERR_CERT_AUTHORITY_INVALID`. WebGPU itself works fine through the swiftshader wrapper above — verify with `canUseVideoMatting()`/`canUseWhisperWebGpu()` — the model/audio download is the separate, blocked part. `VideoMattingScene`/`BrowserTranscriptionScene`/`SfxScene` all check reachability and show a graceful fallback message on failure rather than assuming success — this is also just correct production behavior, since the download can fail for a real user too (flaky network, an unsupported browser), not something specific to a restricted sandbox.

## `@remotion/google-fonts` fails inside the render browser even though `curl` reaches it fine

`fonts.gstatic.com` answers a plain `curl` from this sandbox with a real 200 (font files download successfully) — but that's a different network path from the actual rendering Chromium. A real render test calling `loadFont()` from `@remotion/google-fonts/Poppins` (and separately `/Inter`) at module scope crashed every render that touched the font with an uncaught `TypeError: Failed to fetch`, from `net::ERR_CERT_AUTHORITY_INVALID` deep inside the package's own fetch — the same failure mode as `remotion.media`/`unpkg.com`/`cdn.rive.app` elsewhere in this doc, just reached from a host that looks reachable if you only check with `curl`. Worse than those: the failure isn't behind a `waitUntilDone()` you can `.catch()` — tried that too, same crash — so there's no safe way to attempt a real Google Font load here at all. `font.ts` exports a system font stack instead (`poppins`), used everywhere in this project; `RoundedTextBoxScene`'s `getAvailableFonts()` call is the one real `@remotion/google-fonts` API that's actually exercised, since it's a pure catalog list with no network involved. Swap `font.ts` for the real `loadFont()` only when rendering somewhere with unrestricted network access to `fonts.gstatic.com` from the browser itself, not just from a shell.

## `@remotion/animated-emoji` assets are not bundled with the package

Unlike `@remotion/google-fonts` (which fetches from a CDN at build time), `@remotion/animated-emoji`'s video files aren't shipped in the npm package at all — the package only knows how to play them via `<Loop>` + `<OffthreadVideo transparent>`. You have to copy the specific emoji's `.mp4`/`.webm` pair yourself, once, from [remotion-dev/animated-emoji](https://github.com/remotion-dev/animated-emoji)'s `public/` folder into this project's `public/`. Don't `git clone`/sparse-checkout that repo's `public/` folder directly — it's ~2GB of every emoji; fetch only the two files you need (e.g. via the GitHub API or a shallow single-file fetch). `AnimatedEmojiScene` uses `star-struck-0.5x` this way — fully offline at render time, no CDN dependency.

## `@remotion/skia` needs extra bundler aliasing on rspack

The docs' `enableSkia()` setup (`remotion.config.ts` webpack override + `LoadSkia()` before `registerRoot()` in `src/index.ts`) assumes `@shopify/react-native-skia`'s old 0.x line. The version that resolves today (2.x, peer range `>=0.1.191`) publishes a React Native/Metro build as its `main`/`module` entry that unconditionally imports the real `react-native` package — broken in any browser bundle — and only exposes a working web build via its `"react-native"` package.json field, a convention Metro/RN tooling reads automatically but plain webpack/rspack does not. `enableSkia()` only takes care of extension resolution (`.web.tsx` siblings) once you're inside that source tree; getting there at all needs an explicit `resolve.alias` redirecting the bare `@shopify/react-native-skia` import to its own `src` (see `remotion.config.ts`). Even inside `src`, a few cross-platform files (e.g. `Platform/IPlatform.ts`) still import the real `react-native` package for APIs the web build doesn't need — aliased to `react-native-web` (installed as a dependency) for the bundler, and stubbed out for `tsc` via ambient `declare module` shims in `src/skia-shims.d.ts` (ambient shims can't fix a real lint issue like an unused import in a pulled-in third-party file, which is why `src/index.ts` imports `LoadSkia` from the narrower `.../src/web/LoadSkiaWeb` path rather than the `.../src/web` barrel).

None of this needs network access — `canvaskit-wasm`'s ~8MB `.wasm` binary ships in `node_modules` and `enableSkia()`'s webpack plugin emits it as a local bundled asset.

## Third-party API keys (e.g. ElevenLabs voiceover)

`@remotion/elevenlabs` is a Speech-to-Text→`Caption[]` converter (`elevenLabsTranscriptToCaptions()`), not a text-to-speech package — don't confuse the two. `CaptionsScene` demonstrates the converter itself against a hand-built mock transcript (no network needed — the exact shape a real ElevenLabs STT call returns with `timestamps_granularity: "word"`), since this sandbox can't call ElevenLabs' API for a real one. For generating voiceover audio, `scripts/generate-voiceover.mjs` calls ElevenLabs' TTS REST API directly and writes MP3s to `public/voiceover/`, following the `voiceover.md` skill guide. Copy `.env.example` to `.env.local` and fill in `ELEVENLABS_API_KEY`, then run `node scripts/generate-voiceover.mjs`.

The API key is only ever read inside that standalone script, never inside a `.tsx` component: components get bundled for the browser, and Remotion's CLI exposes `.env`/`.env.local` to that bundle's `process.env` (see `env-variables.mdx`), so a key referenced from a component would ship inside the render output. This pre-generate-once-then-read-the-static-file pattern is how to wire up any other third-party API (image/video generation, other TTS providers, etc.) safely.

## Skills

`.claude/skills/` contains the official Remotion agent skills (vendored from this monorepo's `packages/skills`, matching the pinned Remotion version). Start with `remotion-best-practices` — it routes to the specific skill for the task (creating compositions, markup/animation, captions, maps, rendering, Studio). Follow them when writing any Remotion markup.

When upgrading Remotion, re-vendor the skills so guidance matches the installed version:

```console
node scripts/vendor-skills.mjs   # defaults to ../packages/skills/skills; pass another source path if needed
```

The script copies the skills without their symlinks (which break on Windows checkouts and inflate zip bundles), rewrites sibling-skill links accordingly, and fails if any relative link is broken. Do not copy the skills by hand.

`node scripts/build-chat-skill.mjs` packages `chat-skill/SKILL.md` plus these skills into `remotion-video-skill.zip` for upload to claude.ai (Claude Chat and account-wide Cowork). Rebuild it after re-vendoring.

## Elements

`.claude/elements/` is a local copy of the official [Remotion Elements](https://www.remotion.dev/elements/) gallery (vendored from this monorepo's `packages/docs/elements`) — 40 small, self-contained, drop-in components across 11 categories (audio, backgrounds, captions, commerce, data, layouts, maps, overlays, storytelling, text, youtube). `.claude/elements/CATALOG.md` lists every one with its description. Elements are designed to be copied and edited directly (not installed as a dependency): pick one from the catalog, copy its `.tsx` file (and `initial-props.ts` if present) into `src/showcase/`, and adapt it — check the file's own imports for any package to install first.

Re-vendor after pulling upstream changes to `packages/docs/elements`:

```console
node scripts/vendor-elements.mjs   # defaults to ../packages/docs/elements; pass another source path if needed
```

## Conventions

- Register new compositions in `src/Root.tsx`; one component per file under `src/`.
- Drive all animation from `useCurrentFrame()`/`interpolate()`/`spring()` — never from wall-clock time.
- In components, take `delayRender`/`continueRender`/`cancelRender` from `useDelayRender()` (render-scoped, the documented recommendation) rather than importing the global functions; every scene here does.
- Users may edit files between conversations (including visually in Remotion Studio); treat surprising diffs as intentional and don't overwrite them.
- Run `npm run lint` before committing.
