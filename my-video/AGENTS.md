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

## Work lean: fewer tokens per video

Adapted from [ponytail](https://github.com/DietrichGebert/ponytail) (see `.agents/PONYTAIL.md` at the repo root). Before writing anything, stop at the first rung that holds:

1. **Is it needed?** Build what the brief asks for. No extra scenes, props or schemas "for later"; add a Zod schema or `Interactive` controls only when the owner wants to edit the video in Studio.
2. **Is it already here?** A scene in `src/showcase/` that uses the same package (grep `src/showcase` for the package or component name), an Element in `.claude/elements/CATALOG.md`, a badge in `public/badges/`. Copy it and adapt it.
3. **Does an installed `@remotion/*` package do it?** Transitions, captions, shapes, paths, effects, sfx, fonts and more are all installed. Use one before writing your own.
4. **Only then** write new code: one component per file, animated from `useCurrentFrame()`.

Checking the work costs tokens too:

- **Check with stills, not videos.** `npx remotion still <id> out/check.png --frame=<n> --scale=0.5` on the two or three frames that matter. An image costs tokens in proportion to its pixels, so `--scale=0.5` makes each look about a quarter of the price. Render the full video once, at the end, or part of it with `--frames=<a>-<b>`.
- **Keep command output short.** Pipe renders and lint through `tail -n 5`; the error is at the end.
- **Read only what the task needs.** `docs/findings.md` holds the detailed notes on individual packages; search it for the package in hand instead of reading it whole.
- **Don't delegate small lookups.** A subagent starts from nothing: a one-question Explore run here used about 48,000 tokens, and it did not see this file, so put any rule that matters into its prompt.
- **Mark a deliberate shortcut** with `// ponytail: <limit>, <when to upgrade>`. `/ponytail-debt` at the repo root lists them.

## Language: every video is Vietnamese + English

The owner's videos are bilingual. The speech may be Vietnamese, English, or a mix of both, and on-screen text (titles, captions, lower thirds, end cards) is written in both languages. Assume this for every new video unless told otherwise; if it isn't clear which language leads, ask. The showcase scenes are English-only API demos and are the exception.

- **Write real Vietnamese.** Keep every diacritic ("Lãi suất vay", never "Lai suat vay"), and normalize text that comes from a transcript, an API or a file with `.normalize("NFC")`, so each accented letter is one character.
- **Default bilingual layout:** Vietnamese as the main line and English as a smaller line under it, sharing the same timing. Keep the two as separate strings or caption tracks, not one mixed sentence, so either can be restyled or dropped.
- **Fonts must include Vietnamese glyphs.** `font.ts`'s `poppins` is a system font stack, and in this sandbox it renders all of Vietnamese correctly (checked with "Nguyễn Thị Hằng", "ơ ư ạ ế ồ ữ ỷ ặ ộ Đ"; the glyphs come from DejaVu Sans). The real Google Font Poppins has no `vietnamese` subset (only `latin`, `latin-ext`, `devanagari`), so with it, letters such as ế and ữ fall back to another font in the middle of a word. When loading a Google Font, pick one that has the subset, such as Be Vietnam Pro or Montserrat, and request it: `loadFont("normal", {weights: ["400", "700"], subsets: ["vietnamese", "latin"]})`. Google Fonts can't load inside this sandbox's renderer (see below), so check them on a machine with open network access.
- **Elements need a font change before they show Vietnamese.** The text elements in `.claude/elements/` call `loadFont(...)` with `subsets: ['latin']` only, which leaves out most Vietnamese letters, so add `'vietnamese'` to every one. Two of their fonts have no Vietnamese subset at all and must be swapped rather than extended: Figtree (Rounded Captions on the live site) and Caveat (`storytelling/polaroid-pictures`). Montserrat, used by most caption elements, has one. `public/bangers.woff2` has no Vietnamese glyphs either, so it can't stand in.
- **Leave room for stacked marks.** Vietnamese letters carry marks above and below (ế, ỗ, ặ), so use a `lineHeight` of about 1.3 or more and don't clip text containers tightly with `overflow: hidden`, which cuts off the top of the marks.
- **Speech-to-text: never use an English-only model.** The `.en` models (`tiny.en`, `base.en`, `small.en`, `medium.en`) only know English, and `BrowserTranscriptionScene`'s `small.en` is a demo, not a default. Use a multilingual model and set the language per clip:
  - `@remotion/whisper-webgpu`: `tiny`, `base`, `small`, `medium` or `large-v3-turbo`, with `language: "vi"` or `"en"`. `task: "translate"` produces English text from Vietnamese speech, which can feed the English caption line, but only on `tiny`/`base`/`small`/`medium`: `large-v3-turbo` is multilingual without translation (`getAvailableModels()` reports `supportsTranslation: false` for it and for the `.en` models).
  - `@remotion/install-whisper-cpp`: `medium`, `large-v3` or `large-v3-turbo`, with `language: "vi"`. `translateToEnglish: true` does the same translation, again not with `large-v3-turbo`. `splitOnWord: true` makes whisper.cpp split its output on words rather than tokens.
  - OpenAI's Whisper API: pass `language: "vi"` for Vietnamese audio.
  - For speech that mixes the two, transcribe with the main language and check the English terms in the result; if they come out wrong, split the audio by language and transcribe each part on its own.
- **Voiceover:** when generating speech (ElevenLabs or similar), pick a model and voice that list Vietnamese support, and generate the Vietnamese and English lines separately. `scripts/generate-voiceover.mjs` hardcodes `model_id: "eleven_multilingual_v2"`; check ElevenLabs' current language list for that model before using it for Vietnamese, and switch the model if Vietnamese isn't on it.

## Badges and logos: `public/badges/`

The owner's accreditation, membership and award badges, saved unchanged for their videos (end cards, lower thirds, "why choose us" slides). No showcase scene uses them. Load one with `<Img src={staticFile("badges/<file>")} />` and size it by `height` with `objectFit: "contain"`, so it never stretches.

| File | What it is | Pixels | Background |
|---|---|---|---|
| `commbank-platinum-broker-2026-27.webp` | CommBank Platinum Broker, 2026/2027 financial year | 1077×1093 | transparent; works on light and dark |
| `small-business-champion-awards-2026-finalist.jpg` | Australian Small Business Champion Awards 2026, Finalist | 500×1039 | solid white (a JPEG has no transparency) |
| `afca.png` | AFCA, Australian Financial Complaints Authority | 1163×511 | transparent, navy text |
| `connective.png` | Connective, the owner's aggregator | 1188×351 | transparent, navy text |
| `mfaa-accredited-finance-broker.png` | MFAA Accredited Finance Broker | 174×161 | transparent, navy wordmark above a navy panel |

- **Four of them need a light background.** A test render on white and on navy (`#0b1b33`) loaded all five. On navy, the Champion Awards JPG sat in a white box, and the navy text of AFCA, Connective and the MFAA wordmark disappeared. Only the CommBank badge works on dark. In a dark video, put the badge row on a white or light card.
- **The MFAA file is small** (174×161). Keep it near that size: scaled to 300px tall in the test render it was already soft. Ask the owner for a larger file if it has to be big.
- **Check the year before using one.** The CommBank badge is for the 2026/2027 financial year and the awards badge for 2026. When a new one arrives, save it next to these with its own year in the name.
- **These are other organisations' marks**, shown as the owner's credentials. Don't recolour, crop, redraw or animate their parts separately; fade, scale or slide each badge as a whole.

## Lender logos: `public/lenders/`

Logos of the lenders the owner is accredited with, so they are cleared to appear in the owner's videos; follow each lender's broker brand guidelines (clear space, minimum size, no recolouring). Show them with `LenderRow` from the brand kit, and add each new file to its `LENDERS` list.

| File | Pixels | Notes |
|---|---|---|
| `commbank.png` | 532×434 | transparent; the stacked version (diamond above the black "CommBank" wordmark), cropped around the logo. The black wordmark needs a light background |
| `westpac.png` | 632×264 | transparent; the red "W" symbol on its own, cropped around it |
| `anz.webp` | 632×356 | transparent |
| `firstmac.png` | 300×102 | transparent; small, so keep it at or below about 100px tall |
| `st-george.png` | 400×340 | white background. A stock-site copy whose fake transparency (a grey checkerboard in the pixels) was whitened; replace it with the official file from St.George's broker portal |
| `nab.png` | 703×289 | NAB's white-on-black version, cropped to its black box (the file around it had a fake checkerboard) |
| `bankwest.png` | 688×252 | Bankwest's new logo, orange on its dark grey background, cropped around the logo. The orange ribbon symbol on its own is Bankwest's old logo; don't use it |

Official files come from each lender's broker portal or brand team; SVG or transparent PNG is best. Replace a file under the same name and `LenderRow` picks it up.

## Emoji: `public/emoji/`

39 [Noto animated emoji](https://googlefonts.github.io/noto-emoji-animation/) saved as Lottie JSON (vector, so sharp at any size), picked for FinHub videos: money, calls to action, reactions, hands and celebrations. The set has no house, key or chart emoji. Show one with `<NotoEmoji name="thumbs-up" size={160} loop />` from the brand kit. The `EmojiCatalog` composition ("Brand" folder) shows every saved emoji with its name.

- **Credit:** they're CC BY 4.0, so a video that uses them credits "Noto Emoji Animation by Google, CC BY 4.0" in its description.
- **More:** `node scripts/fetch-noto-emoji.mjs rocket fire …` saves others by their `@remotion/animated-emoji` name (411 exist; `getAvailableEmojis()` lists them). Here, run it with `NODE_USE_ENV_PROXY=1`; `googlefonts.github.io` itself is blocked, but the files come from `fonts.gstatic.com`.

## Brand kit: `src/brand/`

Reusable pieces for the owner's real videos; start from these rather than writing new ones. Each animates its own entrance, so wrap it in a `<Sequence>` for timing. `BrandKitDemo` (in the "Brand" folder of the Studio, 1920×1080) shows them all with sample text.

- `BilingualCaption` (`vi`, `en`): Vietnamese main line and English line under it, following "Language" above.
- `LowerThird` (`name`, `roleVi`, `roleEn`): a name with a bilingual role, sliding in from the left.
- `BadgeRow` (`height`, at most 160): the five badges on a white card, the awards badge 1.5× taller so it stays readable.
- `LenderRow` (`height`, at most 100): the lender logos from `public/lenders/` on a white card.
- `NotoEmoji` (`name`, `size`, `loop`): an animated emoji from `public/emoji/` (see "Emoji" above).
- `EndCard` (`titleVi`, `titleEn`, `website`, `phone`): closing call to action with contact details and the badge row. There are no real contact details in the repo; pass them in.
- `theme.ts`: placeholder colours; replace them with FinHub's brand guide when there is one.

If a second video project ever needs these, `remotion-dev/library-starter` is Remotion's template for publishing them as a package; it pins Remotion 4.0.46, so upgrade it first.

## Project structure

- `src/index.ts` — entry point, registers the root component
- `src/Root.tsx` — every `<Composition>` must be registered here
- `src/Composition.tsx` — the `MyComp` composition (1280×720 @ 30fps)
- `src/showcase/` — reference reels that exercise almost every installed `@remotion/*` package: `ShowcaseReel`, `ExtendedReel` and `FullReel` (both combined, plus every `@remotion/transitions` presentation and all 74 `@remotion/effects` effects, which are also registered alone as `EffectsCatalog`). Each scene is a worked example for its package, so search here before writing a new one. The scene-by-scene map is in `docs/findings.md`.
- `docs/findings.md` — verified behaviour of individual packages in this project and sandbox; read the part you need
- `scripts/renderer-apis.mjs` — the Node-side APIs that can't run in a scene (`@remotion/bundler`, `@remotion/renderer`, the offline Lambda/Cloud Run helpers and others), run for real: `node scripts/renderer-apis.mjs --browser-executable=… --gl=swangle`
- `player-demo/` — a standalone web page for `@remotion/player`'s `<Player>` and `<Thumbnail>`, which can't live inside a composition: `node player-demo/build.mjs [--serve]`; see its README
- `bundler-override.mjs` — the skia/tailwind bundler override, shared by `remotion.config.ts` and that script's `bundle()` call (the Node APIs don't read `remotion.config.ts`)
- `src/index.css` — Tailwind v4 is enabled (`@import "tailwindcss"`)
- `public/` — static assets, referenced with `staticFile()`: the showcase's sample media (regenerate with `node scripts/generate-sample-media.mjs`; `sample-clip.webm` is the VP9 copy for anything that decodes through WebCodecs), a font and a three.js typeface. What each file is for is in `docs/findings.md`.
- `public/badges/` — the owner's accreditation and award badges for real videos (see "Badges and logos" above)
- `public/lenders/` — logos of the lenders the owner is accredited with (see "Lender logos" above)
- `public/emoji/` — Noto animated emoji as Lottie JSON (see "Emoji" above); `scripts/fetch-noto-emoji.mjs` adds more
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

## What this sandbox can't do

Each was confirmed with a real render. The details, and how the showcase works around each one, are in `docs/findings.md`.

- **The render browser can't reach** `remotion.media` (`@remotion/sfx` sounds, the video-matting and whisper-webgpu models), `fonts.gstatic.com` (`@remotion/google-fonts` crashes the render, so use `font.ts`'s system font stack here) or `unpkg.com` (`@remotion/rive` hangs the render rather than failing). Files copied into `public/` work.
- **No H.264, HEVC or AAC decoding through WebCodecs.** `@remotion/media`'s `<Video>` quietly falls back to `<OffthreadVideo>` and `<Audio>` to `<Html5Audio>`; give WebCodecs-based code a VP9 `.webm` (with Opus for sound). `MediabunnyScene` lists what decodes here.
- **Chromium 141, so no `HtmlInCanvas`** (it needs 149+). Most `@remotion/transitions` presentations are built on it; only `fade`, `slide`, `wipe`, `flip`, `clockWipe`, `iris`, `none` and `pushCut` render here. `<ThreeWebGPUCanvas>` crashes the render.
- **At most 16 WebGL contexts per page**, and each component with `effects` uses two, so keep eight or fewer mounted at once.

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

`.claude/elements/` is a local copy of the official [Remotion Elements](https://www.remotion.dev/elements/) gallery (vendored from this monorepo's `packages/docs/elements`) — 41 small, self-contained, drop-in components across 11 categories (audio, backgrounds, captions, commerce, data, layouts, maps, overlays, storytelling, text, youtube). `.claude/elements/CATALOG.md` lists every one with its description. Elements are designed to be copied and edited directly (not installed as a dependency): pick one from the catalog, copy its `.tsx` file (and `initial-props.ts` if present) into `src/showcase/`, and adapt it — check the file's own imports for any package to install first.

Two files come from the live site instead, because they are newer than `packages/docs/elements`: `captions/rounded-captions` and `youtube/youtube-subscribe-nudge`. The vendor script deletes and rewrites the whole folder, so after re-vendoring, restore them with `git checkout -- .claude/elements/captions/rounded-captions .claude/elements/youtube/youtube-subscribe-nudge` and re-add their `CATALOG.md` lines, unless upstream has caught up.

Re-vendor after pulling upstream changes to `packages/docs/elements`:

```console
node scripts/vendor-elements.mjs   # defaults to ../packages/docs/elements; pass another source path if needed
```

## Conventions

- Videos are bilingual, Vietnamese + English: see "Language" near the top of this file before writing any on-screen text or captions.
- Register new compositions in `src/Root.tsx`; one component per file under `src/`.
- Drive all animation from `useCurrentFrame()`/`interpolate()`/`spring()` — never from wall-clock time.
- In components, take `delayRender`/`continueRender`/`cancelRender` from `useDelayRender()` (render-scoped, the documented recommendation) rather than importing the global functions; every scene here does.
- Users may edit files between conversations (including visually in Remotion Studio); treat surprising diffs as intentional and don't overwrite them.
- Run `npm run lint` before committing.
- Read a media file's duration, size or codecs with Mediabunny (`Input` with `UrlSource(staticFile(…))`, or `FilePathSource` in Node), as in the `remotion-multimedia` skill, not with the deprecated `parseMedia()`/`getVideoMetadata()`. It's a direct dependency, pinned to the version `@remotion/media` uses.
- Mediabunny's docs (mediabunny.dev) are blocked in this sandbox. To read them, clone the source at the installed version, outside this repo and read-only: `GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 --branch v1.56.1 https://github.com/Vanilagy/mediabunny ../../vanilagy/mediabunny`, then read `docs/guide/` and `examples/`. Match the tag to `mediabunny` in `package.json`; never copy the source into this repo or install a different version than `@remotion/media` uses.
- The owner uses Remotion's free license (individuals, for-profit companies with up to 3 employees, and non-profits qualify; see the monorepo's `LICENSE.md`). Pass `acknowledgeRemotionLicense` where an API takes it (`<Player>`, `parseMedia()`, `convertMedia()` and others); it only hides Remotion's license notice.
