---
name: experts
description: Maintain Remotion's experts directory and its generated assets. Use when adding, removing, or editing experts; changing experts data or portraits; rendering expert cards; or regenerating the homepage experts animation for Chrome and Safari.
---

# Experts

## How to update the videos

Regenerate the homepage experts animation whenever the experts shown by
`packages/promo-pages/src/components/experts/experts-data.tsx` change. The
`ExpertsGraphic` composition imports this array directly.

1. Render a fresh transparent ProRes 4444 master from the current branch. Never
   convert an existing WebM or MOV.

   ```bash
   cd packages/brand
   bunx remotion render ExpertsGraphic /tmp/experts-graphic-master.mov \
     --codec=prores \
     --prores-profile=4444 \
     --pixel-format=yuva444p10le \
     --image-format=png \
     --timeout=120000 \
     --overwrite
   ```

2. Verify the master reports `prores (4444)`, a `yuva...` pixel format, and
   `1080x1080`. Extract an alpha frame and confirm it is not fully opaque.

   ```bash
   ffmpeg -i /tmp/experts-graphic-master.mov
   ffmpeg -y -i /tmp/experts-graphic-master.mov \
     -vf alphaextract -frames:v 1 /tmp/experts-graphic-alpha.png
   ```

3. Encode the transparent 540x540 Chrome WebM.

   ```bash
   ffmpeg -y -i /tmp/experts-graphic-master.mov \
     -vf scale=540:540 \
     -c:v libvpx \
     -pix_fmt yuva420p \
     -auto-alt-ref 0 \
     -an /tmp/experts-graphic.webm
   ```

4. Encode a 540x540 ProRes intermediate and convert it to the Safari
   HEVC-with-alpha MP4.

   ```bash
   ffmpeg -y -i /tmp/experts-graphic-master.mov \
     -vf scale=540:540 \
     -c:v prores_ks \
     -profile:v 4 \
     -pix_fmt yuva444p10le \
     -an /tmp/experts-graphic-540-prores.mov

   avconvert \
     --source /tmp/experts-graphic-540-prores.mov \
     --preset PresetHEVCHighestQualityWithAlpha \
     --output /tmp/experts-graphic.mp4 \
     --replace
   ```

5. Copy both outputs to both homepage consumers.

   ```bash
   cp /tmp/experts-graphic.webm ../promo-pages/public/img/experts-graphic.webm
   cp /tmp/experts-graphic.mp4 ../promo-pages/public/img/experts-graphic.mp4
   cp /tmp/experts-graphic.webm ../docs/static/img/experts-graphic.webm
   cp /tmp/experts-graphic.mp4 ../docs/static/img/experts-graphic.mp4
   ```

6. Inspect all four files. Each must be 540x540 and 60 seconds long. The Safari
   MP4 must report `major_brand: mp42`, `compatible_brands: isommp41mp42`,
   `Video: hevc (Main) (hvc1)`, and `handler_name: Core Media Video`. Confirm the
   matching docs and promo-pages files have identical checksums.

Do not commit either ProRes MOV. Only commit the two WebM copies and two MP4
copies.

## Expert data

The source of truth is
`packages/promo-pages/src/components/experts/experts-data.tsx`. Keep portraits in
both `packages/docs/static/img/freelancers` and
`packages/promo-pages/public/img/freelancers`, with identical contents.

After adding or changing an expert, render their expert card from `packages/docs`:

```bash
bun render-cards
```

Verify the expected `packages/docs/static/generated/experts-<slug>.png` was
rendered rather than reported as already existing.
