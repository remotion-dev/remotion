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
- `src/showcase/` — reference reels exercising most of the installed `@remotion/*` packages: `ShowcaseReel` (transitions, shapes, motion blur, noise, captions, paths, rough-notation, animation-utils), `ExtendedReel` (effects, media/gif/mac-cursors, video-matting, media-utils audio, whisper-webgpu, lottie, animated-emoji, three, skia, layout-utils/rounded-text-box, sfx, gsap, core-`remotion` fundamentals), and `FullReel` (both combined into one video). Point at a scene here as a worked example before writing a new one from scratch.
- `src/index.css` — Tailwind v4 is enabled (`@import "tailwindcss"`)
- `public/` — static assets, referenced with `staticFile()`, including `sample-clip.mp4`/`.gif`, `sample-tone.wav` and `sample-lottie.json` (locally-generated stand-ins used by `ExtendedReel`; regenerate the media ones with `node scripts/generate-sample-media.mjs`)
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

## `@remotion/video-matting`, `@remotion/whisper-webgpu` and `@remotion/sfx` all need network access to `remotion.media`

The first two run a real ML model locally in the browser (background removal and speech transcription respectively), downloaded from `remotion.media` on first use; `@remotion/sfx`'s exports are plain `https://remotion.media/*.wav` URLs meant for `<Audio src={...}>`. All three need outbound network access to that one host, which a sandboxed environment may block the same way it can block `fonts.gstatic.com` (see `google-fonts.md`) — here it fails with `net::ERR_CERT_AUTHORITY_INVALID`. WebGPU itself works fine through the swiftshader wrapper above — verify with `canUseVideoMatting()`/`canUseWhisperWebGpu()` — the model/audio download is the separate, blocked part. `VideoMattingScene`/`BrowserTranscriptionScene`/`SfxScene` all check reachability and show a graceful fallback message on failure rather than assuming success — this is also just correct production behavior, since the download can fail for a real user too (flaky network, an unsupported browser), not something specific to a restricted sandbox.

## `@remotion/animated-emoji` assets are not bundled with the package

Unlike `@remotion/google-fonts` (which fetches from a CDN at build time), `@remotion/animated-emoji`'s video files aren't shipped in the npm package at all — the package only knows how to play them via `<Loop>` + `<OffthreadVideo transparent>`. You have to copy the specific emoji's `.mp4`/`.webm` pair yourself, once, from [remotion-dev/animated-emoji](https://github.com/remotion-dev/animated-emoji)'s `public/` folder into this project's `public/`. Don't `git clone`/sparse-checkout that repo's `public/` folder directly — it's ~2GB of every emoji; fetch only the two files you need (e.g. via the GitHub API or a shallow single-file fetch). `AnimatedEmojiScene` uses `star-struck-0.5x` this way — fully offline at render time, no CDN dependency.

## `@remotion/skia` needs extra bundler aliasing on rspack

The docs' `enableSkia()` setup (`remotion.config.ts` webpack override + `LoadSkia()` before `registerRoot()` in `src/index.ts`) assumes `@shopify/react-native-skia`'s old 0.x line. The version that resolves today (2.x, peer range `>=0.1.191`) publishes a React Native/Metro build as its `main`/`module` entry that unconditionally imports the real `react-native` package — broken in any browser bundle — and only exposes a working web build via its `"react-native"` package.json field, a convention Metro/RN tooling reads automatically but plain webpack/rspack does not. `enableSkia()` only takes care of extension resolution (`.web.tsx` siblings) once you're inside that source tree; getting there at all needs an explicit `resolve.alias` redirecting the bare `@shopify/react-native-skia` import to its own `src` (see `remotion.config.ts`). Even inside `src`, a few cross-platform files (e.g. `Platform/IPlatform.ts`) still import the real `react-native` package for APIs the web build doesn't need — aliased to `react-native-web` (installed as a dependency) for the bundler, and stubbed out for `tsc` via ambient `declare module` shims in `src/skia-shims.d.ts` (ambient shims can't fix a real lint issue like an unused import in a pulled-in third-party file, which is why `src/index.ts` imports `LoadSkia` from the narrower `.../src/web/LoadSkiaWeb` path rather than the `.../src/web` barrel).

None of this needs network access — `canvaskit-wasm`'s ~8MB `.wasm` binary ships in `node_modules` and `enableSkia()`'s webpack plugin emits it as a local bundled asset.

## Third-party API keys (e.g. ElevenLabs voiceover)

`@remotion/elevenlabs` is a Speech-to-Text→`Caption[]` converter (`elevenLabsTranscriptToCaptions()`), not a text-to-speech package — don't confuse the two. For generating voiceover audio, `scripts/generate-voiceover.mjs` calls ElevenLabs' TTS REST API directly and writes MP3s to `public/voiceover/`, following the `voiceover.md` skill guide. Copy `.env.example` to `.env.local` and fill in `ELEVENLABS_API_KEY`, then run `node scripts/generate-voiceover.mjs`.

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
- Users may edit files between conversations (including visually in Remotion Studio); treat surprising diffs as intentional and don't overwrite them.
- Run `npm run lint` before committing.
