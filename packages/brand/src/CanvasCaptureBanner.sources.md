# Canvas Capture comparison banner

Source: the original recording used by the experimental homepage's Rendering tile,
`RenderModalCodecPreview`, before its rotation and color correction:
https://remotion.media/canvas-capture/render-modal-codec-2026-09-21.webm

The embedded `REMOTION_CAPTURE_DATA` tag records `density: 5`; the source is
3084 × 3588 pixels. Use frames 585–711 at 60 fps (the same range as the homepage
composition). Both halves use the homepage's original 3D rotation (`0.904608 0.351506 -0.241096 27.995464deg`)
with origin (1960, 1575), displayed at native scale and translated by (-1660, -1205) within a 480 × 540
pixel crop. The right side is displayed at native pixel resolution.

The left side is intentionally reduced to 616 × 718 (approximately the original
1× CSS size, rounded to even dimensions), then decoded and re-encoded through
Remotion four times using JPEG frame quality 65 and H.264 CRF 18. It is enlarged
back to the original dimensions before applying the identical crop. This is a
simulated recompressed 1× recording, not a separate recorder benchmark.

The final comparison is 960 × 540, with both halves filling the frame and no labels. The close crop
keeps the codec lettering legible when displayed as a 320 × 180 thumbnail. Frame 45
shows the open codec dropdown and is used on the Canvas Capture overview page.
The final MP4 uses PNG intermediate frames and CRF 10 to preserve the comparison.

Recreate the media from the repository root:

```sh
bun packages/brand/scripts/render-canvas-capture-banner.ts
```

Outputs: `out/canvas-capture-banner/banner.mp4` and `banner.png`.

## Published assets

- [one-x-four-jpeg-passes.mp4](https://remotion.media/canvas-capture/one-x-four-jpeg-passes-2026-10-28-c04f73eee2a8.mp4)
- [comparison-banner.png](https://remotion.media/canvas-capture/comparison-banner-2026-10-28-425780bb7e17.png)
- [comparison-banner.mp4](https://remotion.media/canvas-capture/comparison-banner-2026-10-28-41685cc08bb5.mp4)
