---
name: homepage-video-assets
description: Use when rendering or replacing Remotion homepage creator strip videos, especially transparent Chrome WebM and Safari MP4 assets copied into both promo-pages and docs.
---

# Homepage Video Assets

Use this workflow for homepage creator strip assets such as:

- `homepage-assets-master`
- `editing-vp9-chrome` / `editing-safari`
- `what-is-remotion`

## Workflow

1. Render a fresh transparent ProRes 4444 master from `packages/brand`.

```bash
cd packages/brand
bunx remotion render <composition-id> /tmp/<asset>-master.mov \
  --codec=prores \
  --prores-profile=4444 \
  --pixel-format=yuva444p10le \
  --image-format=png \
  --timeout=120000 \
  --overwrite
```

2. Convert from the ProRes master, not from a previous WebM/MOV.

Chrome WebM:

```bash
ffmpeg -y -i /tmp/<asset>-master.mov \
  -vf scale=540:540 \
  -c:v libvpx \
  -pix_fmt yuva420p \
  -auto-alt-ref 0 \
  -an /tmp/<chrome-name>.webm
```

Safari MP4:

```bash
ffmpeg -y -i /tmp/<asset>-master.mov \
  -vf scale=540:540 \
  -c:v prores_ks \
  -profile:v 4 \
  -pix_fmt yuva444p10le \
  -an /tmp/<asset>-540-prores.mov

avconvert \
  --source /tmp/<asset>-540-prores.mov \
  --preset PresetHEVCHighestQualityWithAlpha \
  --output /tmp/<safari-name>.mp4 \
  --replace
```

3. Copy both outputs into both app folders:

```bash
cp /tmp/<chrome-name>.webm ../promo-pages/public/img/<chrome-name>.webm
cp /tmp/<safari-name>.mp4 ../promo-pages/public/img/<safari-name>.mp4
cp /tmp/<chrome-name>.webm ../docs/static/img/<chrome-name>.webm
cp /tmp/<safari-name>.mp4 ../docs/static/img/<safari-name>.mp4
```

## Verification

Verify the ProRes master has real alpha before converting, and verify the Safari MP4 exists in both folders:

```bash
ffmpeg -i /tmp/<asset>-master.mov
ffmpeg -i ../promo-pages/public/img/<safari-name>.mp4
ffmpeg -y -i /tmp/<asset>-master.mov \
  -vf alphaextract -frames:v 1 /tmp/<asset>-alpha.png
```

The master should report `prores (4444)` and a `yuva...` pixel format. `alphaextract` should succeed, and the alpha image should not be fully opaque. A common failure mode is `alphaextract` succeeding but every sampled pixel is opaque; in that case, the master was rendered with a black/opaque background or a stale opaque master was reused.

Verify every copied Chrome WebM and Safari MP4 is exactly `540x540`:

```bash
for f in \
  ../promo-pages/public/img/<chrome-name>.webm \
  ../promo-pages/public/img/<safari-name>.mp4 \
  ../docs/static/img/<chrome-name>.webm \
  ../docs/static/img/<safari-name>.mp4; do
  ffmpeg -i "$f"
done
```

The Safari MP4 should look like the known-good file shape: `major_brand: mp42`, `compatible_brands: isommp41mp42`, `Video: hevc (Main) (hvc1)`, `540x540`, and `handler_name: Core Media Video`. If it reports `h264 (avc1)` or dimensions such as `960x540`, it is the wrong file and will render differently in Safari.

Do not add ProRes `.mov` files to the homepage PR; they are too large. Safari should use the small `.mp4` fallback. Chrome should use the transparent `.webm`.
