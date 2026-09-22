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
- `src/showcase/` — reference reels exercising most of the installed `@remotion/*` packages: `ShowcaseReel` (transitions, shapes, motion blur, noise, captions, paths, rough-notation, animation-utils), `ExtendedReel` (effects, media/gif/mac-cursors, video-matting, media-utils audio, whisper-webgpu, lottie, three, gsap, core-`remotion` fundamentals), and `FullReel` (both combined into one video). Point at a scene here as a worked example before writing a new one from scratch.
- `src/index.css` — Tailwind v4 is enabled (`@import "tailwindcss"`)
- `public/` — static assets, referenced with `staticFile()`, including `sample-clip.mp4`/`.gif`, `sample-tone.wav` and `sample-lottie.json` (locally-generated stand-ins used by `ExtendedReel`; regenerate the media ones with `node scripts/generate-sample-media.mjs`)
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

## `@remotion/video-matting` and `@remotion/whisper-webgpu` need WebGPU *and* network access

These both run a real ML model locally in the browser (background removal and speech transcription respectively), downloaded from `remotion.media` on first use. WebGPU itself works fine through the swiftshader wrapper above — verify with `canUseVideoMatting()`/`canUseWhisperWebGpu()` — but the model download is a separate requirement: it needs outbound network access to `remotion.media`, which a sandboxed environment may block the same way it can block `fonts.gstatic.com` (see `google-fonts.md`). `VideoMattingScene`/`BrowserTranscriptionScene` call `loadVideoMattingModel()`/`loadWhisperModel()` and show a graceful fallback message on failure rather than assuming success — this is also just correct production behavior, since model download can fail for a real user too (flaky network, an unsupported browser), not something specific to a restricted sandbox.

## Skills

`.claude/skills/` contains the official Remotion agent skills (vendored from this monorepo's `packages/skills`, matching the pinned Remotion version). Start with `remotion-best-practices` — it routes to the specific skill for the task (creating compositions, markup/animation, captions, maps, rendering, Studio). Follow them when writing any Remotion markup.

When upgrading Remotion, re-vendor the skills so guidance matches the installed version:

```console
node scripts/vendor-skills.mjs   # defaults to ../packages/skills/skills; pass another source path if needed
```

The script copies the skills without their symlinks (which break on Windows checkouts and inflate zip bundles), rewrites sibling-skill links accordingly, and fails if any relative link is broken. Do not copy the skills by hand.

`node scripts/build-chat-skill.mjs` packages `chat-skill/SKILL.md` plus these skills into `remotion-video-skill.zip` for upload to claude.ai (Claude Chat and account-wide Cowork). Rebuild it after re-vendoring.

## Conventions

- Register new compositions in `src/Root.tsx`; one component per file under `src/`.
- Drive all animation from `useCurrentFrame()`/`interpolate()`/`spring()` — never from wall-clock time.
- Users may edit files between conversations (including visually in Remotion Studio); treat surprising diffs as intentional and don't overwrite them.
- Run `npm run lint` before committing.
