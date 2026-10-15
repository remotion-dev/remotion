---
name: timeline-layout-reveal
description: Capture matching 2x Remotion Studio timeline screenshots and make a before/after crop reveal in packages/brand. Use for timeline layout comparison videos, including recapturing a historical layout.
---

# Timeline Layout Reveal

Use `packages/brand/src/TimelineLayoutReveal.tsx` and its registration in
`packages/brand/src/Root.tsx`. Screenshots belong in
`packages/brand/public/timeline-reveal/before.png` and `after.png`.

## Matching captures

Capture the requested composition from `packages/jonnys-videos`. Start Studio
with `bunx remotion studio --no-open --port=<free-port>` and open the printed URL.
For the existing reveal, use `RollerSkiCommute-new`, frame 2025: the cow close-up.
Confirm the cow still appears there if the composition has changed.

The approved framing is a 1280 × 800 CSS viewport at device scale factor 2,
with a 336-pixel timeline panel. This gives a MacBook-like 16:10 screenshot and
a timeline 30% shorter than the original 480-pixel panel. Adapt these values
when the user requests different framing. A 2x capture must contain 2560 × 1600
pixels; changing only the CSS viewport size is insufficient.

Keep the viewport, panel split, timeline zoom, scroll position, playhead, and
selection identical between captures. Zoom out to show the entire horizontal
duration. Capture the full Studio viewport when the composition preview should
remain visible; capture only the timeline when requested. Move the pointer away
from the timeline to avoid hover feedback and tooltips.

Wait for the composition, timeline activity scan, thumbnails, and waveforms to
load. Empty render-delay handles alone do not establish that timeline media has
finished loading: inspect a screenshot before saving the final captures.

## Historical before view

Inspect the flags and source at both revisions. Main now enables tracks by
default, so disabling sequence activity on current main does not recreate the
original staircase layout. The existing before capture used revision
`836e5f3597f90cb7b24a5de89b501e89942b0f41` with both experimental tracks and sequence
activity disabled. Choose a different baseline when the requested comparison
requires it.

Use a suitable existing checkout or a temporary managed worktree at the baseline
revision. For a fresh checkout, run `bun install` and
`bunx turbo run make --filter='@remotion/jonnys-videos...'` before starting Studio;
building only CLI dependencies misses fonts, noise, and layout utilities.

Different ports have separate browser storage. Match the framing and playhead
explicitly in both Studios. Copy saved screenshots into the active brand project
before closing the baseline server and archiving a temporary managed worktree.
Restore any temporarily changed config. Update from main only when requested.

## Reveal and delivery

Use only the two screenshot layers, unless the user requests additional content.
Keep the before image underneath the after image. Animate the after image's
`cropRight` from 1 to 0 with an inline `interpolate()` driven by
`useCurrentFrame()`, clamped at both ends. Use crop props rather than a CSS
animation so the wipe renders deterministically and remains editable in Studio.

Match the composition dimensions to the screenshot pixels. The existing reveal
is six seconds at 60 fps: hold before for 1.2 seconds, wipe until 3.8 seconds,
then hold after. Preserve or adjust timing according to the request.

Render from `packages/brand`, following [remotion-render](../remotion-render/SKILL.md):

```bash
bunx remotion render src/index.ts TimelineLayoutReveal ../../out/timeline-layout-reveal.mp4 --codec=h264 --crf=16 --image-format=png --pixel-format=yuv420p --concurrency=4
```

Inspect the beginning, midpoint, and ending of the exported video, checking that
the preview and playhead stay aligned and only the timeline changes. Run focused
formatting and lint checks for the changed source files.

For phone viewing, follow [upload-r2](../upload-r2/SKILL.md) to upload the rendered
MP4 under a unique content-hashed key, verify its public URL, and return a direct
watch link. Retain the local screenshots when the user requested them in brand.
This workflow does not itself request a commit, push, or PR.
