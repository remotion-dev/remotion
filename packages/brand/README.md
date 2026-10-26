# @remotion/brand

## Usage

Internal Remotion brand videos and promotional compositions.

## Code aura

`AuraCodeAndTimeline` is the paired master: 3840 × 1080, 60 fps, and 444 frames
(7.4 seconds). It preserves the approved 1920 × 1080 code shots on the left and
shows matching, genuine Remotion Studio timeline captures on the right.
The original `AuraCode` montage and its four individual shots remain registered
in the **Aura** folder for adjusting their framing and focus.
Code camera movement and lens focus are authored directly in `src/AuraCode.tsx`;
the paired layout and timeline cameras are in `src/AuraCodeAndTimeline.tsx`.
Shared 12-frame black pulses cover both panels at the three scene cuts, reaching
full black exactly on each cut without changing their timing.
The opening closeup zooms around a fixed optical center with
the acceleration and release of a hand turning the lens ring. Lens blur follows
the actual zoom speed, becoming sharp as the turn stops. Gentle deterministic
handheld translation (at most 2.5px horizontally and 1.5px vertically) and
0.06-degree camera roll follow the same lens movement, settling at both ends.
The first shot uses a rounded hexagonal aperture, linear-light averaging, and
speed-linked highlight gain for pronounced bokeh, with a peak radius of about
41 source pixels and 512 samples.
Chapter selection uses a fixed closeup with radial progressive blur around the action.
The second shot rotates across an HTML/CSS macro crop with a soft vignette and
animated radial edge blur, including a slight 1.5px blur at its center. Chapter
selection comes third. The caption shot uses a 2× closer crop angled across
the screen, keeping the line beginnings and opening brackets visible near the
camera while the values recede into stronger blur on the right.
It slowly zooms into the first caption with
a slight lens blur and an OLED shader with a pronounced neutral pixel grid, faint
neutral texture in dark areas, and minimal RGB separation. A soft vignette and
light radial blur finish its edges while keeping the central pixel texture visible.
Both macro captures use 46px editor text at 2x density. The screen shader is
defined in `src/effects/oled-screen-effect.ts`.

Run `bun run capture:aura-code` to regenerate the real Monaco source capture in
`public/aura-code`. See [the capture setup](scripts/aura-code/README.md) for browser
requirements and instructions for changing the code or theme. Sources are
3600 × 2400 recordings from a real Monaco editor, with the
homepage's Dark+ syntax colors and charcoal theme:

- `chapters.png`: the homepage's `WhatsNew` example, recaptured with double-size
  editor text. The opening shot uses this lossless still and stays at or below
  native pixel scale; the capture also generates `chapters.webm` locally.
- `duplicate.webm`: a 1.6-second native line selection and duplication of the
  Intro block. The montage uses the first 1.4 seconds, cutting away just before
  duplication, with no opening or between-action waits.
- `styles.png`: the announcement's actual `LowerThird.tsx` with native folds.
- `captions.png`: proposed caption markup alongside the real presenter video.

The static shots use the lossless PNG capture. Their unused source WebM takes,
duplicate-state images, and full-Studio screenshots are ignored local diagnostics.
The nine media assets needed by the compositions and the final video are hosted
on R2. Versioned runtime URLs are recorded in `src/aura-code-assets.ts`; generated
captures remain local and are ignored by Git.

The right panel uses 5120 × 1964 lossless PNGs captured from real Studio at 4×
density with PageCapture (`requestPaint` and `drawElementImage`). Each view uses
camera tilt and zoom, gently animated radial blur, and a vignette sized for its
macro crop. The focus follows the featured labels, while adjacent rows soften:

- Chapters: the expanded `Chapters` timeline, with the presenter filmstrip and
  nested card items visible; Score sits below the crop.
- HTML/CSS: a tight closeup of the natively selected `Presenter card`, with
  `Presenter name` and `Presenter role` visible below it.
- Selection: the native selected `Intro` item, with its children visible.
- Captions: a macro view centered on the natively selected orange
  `Presenter captions` bar reading “What's new in Remotion”.
  Its narrow focus band keeps the phrase readable while the filmstrip and
  neighboring tracks fall out of focus.

The capture fixtures in `src/AuraTimelineSource.tsx` reuse the announcement's
actual components and materialize the illustrative caption proposal. Their
score fixture is a 22-second loop derived from the existing `chime.mp3`, used to
supply the fixture's score waveform. The runtime loads its hosted copy from
`src/aura-code-assets.ts`; `public/score.wav` is only a local preparation output.
It is demo audio; the paired montage remains silent.

With the brand Studio running at `http://localhost:3110`, regenerate the timeline
captures from the repository root with
`bun packages/brand/scripts/aura-code/capture-studio.ts`. Set `AURA_STUDIO_URL`
when using a different Studio address. Captures and their provenance manifests
are saved in `public/aura-code/timeline`.

After recapturing, upload the changed runtime assets to R2 under new
content-hashed keys, verify their public bytes, and update `src/aura-code-assets.ts`
before previewing or rendering. Local capture files are not read by the montage.

The Studio selections are captured from its actual UI, including the selected
list row and caption bar, rather than added as overlays.
The caption text and timestamps are illustrative. The only changing editing
action in the montage is the chapter selection in the third shot; the other
Studio selections are already active when their shots begin. The editable
shot brief is [aura-code-storyboard.txt](aura-code-storyboard.txt).
The other three shots run for two seconds each, with camera movement continuing
through each cut and no opening or ending holds.

Preview with `bun run dev` and select **Aura → AuraCodeAndTimeline** for the
paired master, or **Aura → AuraCode** for the original code montage.

### Why Remotion page

The paired `AuraCodeAndTimeline` montage is embedded below the paragraph in
“You want your video to be code” in `packages/docs/docs/why.mdx`. Its H.264 render
is 3840 × 1080, 60 fps, and 7.4 seconds. The public video URL is referenced directly from
`packages/docs/docs/why.mdx`; no rendered video is kept in the repository.

To render a replacement from `packages/brand`:

```sh
bunx remotion render src/index.ts AuraCodeAndTimeline /tmp/remotion-aura-code-and-timeline-why.mp4 --codec=h264 --crf=16 --pixel-format=yuv420p --image-format=png --gl=angle --concurrency=2
```

Upload replacements under a new `why/aura-code-and-timeline-<hash>.mp4` key and verify the
public bytes before updating the embed URL.
