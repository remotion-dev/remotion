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

5. Use the `offload-r2` skill to upload both outputs under `homepage/` with
   new versioned keys. Update the URLs in the homepage consumers, including
   `packages/promo-pages/src/components/homepage/EvaluateRemotion.tsx`.
   Keep rendered binaries out of both docs and promo-pages.

6. Inspect both uploaded files. Each must be 540x540 and 60 seconds long. The Safari
   MP4 must report `major_brand: mp42`, `compatible_brands: isommp41mp42`,
   `Video: hevc (Main) (hvc1)`, and `handler_name: Core Media Video`. Confirm the
   public objects have the same SHA-256 hashes as their local outputs.

Do not commit rendered media. Commit the hosted URL changes.

## Expert data

The source of truth is
`packages/promo-pages/src/components/experts/experts-data.tsx`. Keep portraits in
both `packages/docs/static/img/freelancers` and
`packages/promo-pages/public/img/freelancers`, with identical contents.

After adding or changing an expert, render their expert card from `packages/docs`:

```bash
bun render-cards
```

Verify the expected `https://remotion.media/docs/generated/experts-<slug>.png`
was uploaded and is publicly accessible. The command requires R2 credentials
from the environment. To replace an existing card, pass
`--overwrite=experts-<slug>`. Generated local PNGs are ignored.
