# Aura code capture

Run from the repository root after `bun install`:

```sh
bun packages/brand/scripts/aura-code/capture.ts
```

To record one shot again:

```sh
bun packages/brand/scripts/aura-code/capture.ts --shot=duplicate
```

The four shot IDs are `chapters`, `duplicate`, `styles`, and `captions`. Each
produces a VP9 WebM at 30 fps, a lossless final PNG, and a JSON capture manifest
in `packages/brand/public/aura-code`. The duplicate clip is 1.6 seconds / 48
frames; the three observational source clips remain four seconds / 120 frames.
The montage can trim the observational clips independently. All images and videos
are 3600×2400 pixels, captured from an 1800×1200 CSS viewport at 2× density.

The script opens an isolated headless Chrome Canary and renders a real Monaco
editor. Every video frame waits for the editor to render, then uses
`requestPaint()` and `drawElementImage()` to capture its actual DOM. This is the
same HTML-in-canvas technique used by the Canvas Capture extension. It does not
use browser screenshots or fake selection overlays.

Chrome 157 or newer with `CanvasDrawElement` support is required. The script
enables the feature for its isolated browser. To choose another executable:

```sh
CHROME_EXECUTABLE='/path/to/chrome' bun packages/brand/scripts/aura-code/capture.ts
```

The existing `template-vibe-code` Monaco dependency and `web-renderer` Playwright
dependency are reused. No CDN, extension installation, or personal browser
profile is needed.

## Source and styling

The editor uses the homepage's Menlo typography, `#131414` editor background,
`#181919` headers, and exact Code Hike `dark-plus` TSX colors. A Monaco tokens
provider displays the Code Hike tokenization for the original and duplicated
source. Each shot opens its prepared file directly; the only editing beat is the
chapter duplication.

- `chapters` shows a close view of the homepage's `WhatsNew.tsx` example. `sample.ts`
  imports its actual code from `packages/promo-pages/src/components/homepage/studio-handoff/editor-code.ts`,
  then adapts durations to inline expressions using `useVideoConfig().fps` and
  the audio path to `staticFile('score.wav')`.
- `duplicate` starts with that same source, scrolled to the chapter block.
  Monaco's native `expandLineSelection` action runs at source frames 0, 8, 16,
  24, 32, and 40, selecting the six-line Intro block immediately from the start.
  At frame 42 (1.4 seconds), `editor.action.copyLinesDownAction` duplicates it.
  The source recording keeps the new copy selected through frame 48 (1.6 seconds).
  The montage cuts at frame 42 (1.4 seconds), before the copy event, showing
  only the selection. There is no initial pause, typing, or renaming. The manifest
  records native selections with frame numbers and seconds and confirms that
  the source grows from 35 to 41 lines.
- `styles` reads the actual
  `src/announcements/whats-new-in-remotion/LowerThird.tsx` without modifying it.
  The prepared view uses native Monaco folding for the two long easing-options
  objects. The card styling, inline translate/rotate values, presenter name,
  and role remain visible together. The underlying source stays complete.
- `captions` shows the proposed `Scene1.tsx` addition in `captions.ts`, based on
  `packages/brand/aura-code-storyboard.txt`. It retains the real `whats1.mov`
  source and LowerThird overlay. Video and BasicCaptions share a Sequence with
  a 0.9-second source trim and 3.8-second duration; LowerThird retains its separate
  0.5-second entrance. **The caption copy and timestamps are illustrative, not a
  transcription.** The actual Scene1 file is not changed.

The caption example is semantically checked against the actual BasicCaptions,
LowerThird, assets, and Remotion declarations. To implement it in the real video,
copy the BasicCaptions element from
`packages/docs/elements/captions/basic-captions/basic-captions.tsx` into the
announcement project and verify the example text/timestamps against the audio.

## Framing and verification

Each shot's JSON manifest includes actual visible line coordinates, source
provenance, font size, line height, scroll position, and native editor actions.
Coordinates are in the captured 3600×2400 pixels. The duplicate shot additionally
saves `duplicate-first-line.png`, `duplicate-selected.png`, and
`duplicate-copied.png` for inspecting the edit.

The three observational clips have no visible caret or selection. In the
editable shot, selection and insertion are captured from Monaco itself. The
script checks that the final model text exactly equals the intended source
before completing each capture.

## Native Studio timeline companions

With the brand Studio running on port 3110, capture the registered
`AuraTimeline-Chapters`, `AuraTimeline-Card`, and `AuraTimeline-Captions`
compositions:

```sh
bun packages/brand/scripts/aura-code/capture-studio.ts
bun packages/brand/scripts/aura-code/capture-studio.ts --shot=captions
```

The shot IDs are `chapters`, `styles`, `selection`, and `captions`. Override the
Studio origin with `AURA_STUDIO_URL` or the browser with `CHROME_EXECUTABLE`.
Each run opens an isolated browser context; it does not change the shared Studio
tab or a personal browser profile.

The chapter fixture's score is a 22-second loop of the existing
`public/chime.mp3`. It is demo audio for the timeline waveform, not the
announcement soundtrack. The runtime loads the hosted asset from
`src/aura-code-assets.ts`; `public/score.wav` is an ignored local preparation
output whose filename matches the displayed markup. Regenerate it from the
repository root with:

```sh
ffmpeg -y -i packages/brand/public/chime.mp3 -af 'aloop=loop=-1:size=2147483647,atrim=duration=22,asetpts=N/SR/TB' -ar 44100 -ac 1 -c:a pcm_s16le packages/brand/public/score.wav
```

`studio-browser.ts` imports the actual Canvas Capture extension's `PageCapture`
class. The script captures its `requestPaint` / `drawElementImage` PNG at 4×
density. The 1280×800 CSS viewport uses device scale factor 4 and
`studioPixelRatio=4`, so Studio's own filmstrip, waveform, and ruler canvases also
render at 4×. The full native timeline viewport is measured from its real DOM,
including the label column and time ruler. The current crop is 1280×491 CSS
pixels, producing a **5120×1964 PNG**. The blank timeline below the tracks remains
available for camera framing.

The script exposes Studio's own WebMCP tool registrations to its isolated browser
and invokes those native implementations to select the composition, seek,
set timeline zoom, and select the featured item: `Intro` for `selection`,
`Presenter card` for `styles`, and `Presenter captions` for `captions`.
The selected list row and orange caption bar use Studio's own selection
treatment in the captured pixels; no selection overlay is added.
The chapter captures keep `Chapters`
expanded, revealing the presenter filmstrip and nested card items while pushing
Score below the capture. No timeline UI, rows, selections, or
caption widgets are recreated by the script. Captions appear as Studio's actual
transcript-labeled bar; individual caption editing chips belong to the inspector.

Outputs in `public/aura-code/timeline/`:

- `<shot>.png`: lossless timeline crop.
- `<shot>-studio.png`: full 5120×3200 Studio screenshot for review.
- `<shot>.json`: composition, frame, crop, native sequence IDs and selection,
  label/clip geometry, and media-readiness evidence. Geometry uses CSS pixels
  relative to the cropped timeline; multiply by `density` for PNG coordinates.

Capture waits for the expected sequence names, fonts, navigation transitions,
finished media requests, nonempty waveform pixels, and filled filmstrip pixels
where applicable. It also requires four identical canvas/row samples at 500ms
intervals. Studio exposes no single activity-scan-complete flag, so visual review
of the saved screenshot remains part of verification. If HTML-in-canvas capture
fails, a native Chromium screenshot at the same 4× density is saved instead and
the exact reason is recorded in the manifest. The current four captures all used
`PageCapture` successfully.

The source PNGs, short selection WebM, and score fixture are hosted on R2, with
versioned URLs in `packages/brand/src/aura-code-assets.ts`. After recapturing,
upload changed runtime assets under new content-hashed keys, verify their public
bytes, and update that mapping before previewing or rendering. The montage reads
the hosted URLs rather than the local preparation outputs.

All files in `public/aura-code/` and the generated `public/score.wav` are ignored
by Git. Capture manifests, unused source takes, duplicate-state PNGs, full-Studio
screenshots, and failed-capture screenshots remain local diagnostics. The final
montage is uploaded to R2 and referenced by the Why Remotion page.
