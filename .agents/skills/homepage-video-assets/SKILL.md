---
name: homepage-video-assets
description: Use when rendering or replacing Remotion homepage creator strip videos, especially transparent Chrome WebM and Safari MOV assets copied into both promo-pages and docs.
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

Safari MOV:

```bash
ffmpeg -y -i /tmp/<asset>-master.mov \
  -vf scale=540:540 \
  -c:v prores_ks \
  -profile:v 4 \
  -pix_fmt yuva444p10le \
  -an /tmp/<safari-name>.mov
```

3. Copy both outputs into both app folders:

```bash
cp /tmp/<chrome-name>.webm ../promo-pages/public/img/<chrome-name>.webm
cp /tmp/<safari-name>.mov ../promo-pages/public/img/<safari-name>.mov
cp /tmp/<chrome-name>.webm ../docs/static/img/<chrome-name>.webm
cp /tmp/<safari-name>.mov ../docs/static/img/<safari-name>.mov
```

## Verification

Verify the ProRes master and Safari MOV have real alpha:

```bash
ffmpeg -i /tmp/<asset>-master.mov
ffmpeg -i ../promo-pages/public/img/<safari-name>.mov
ffmpeg -y -i ../promo-pages/public/img/<safari-name>.mov \
  -vf alphaextract -frames:v 1 /tmp/<asset>-alpha.png
```

The MOV should report `prores (4444)` and a `yuva...` pixel format. `alphaextract` should succeed, and the alpha image should not be fully opaque. A common failure mode is `alphaextract` succeeding but every sampled pixel is opaque; in that case, the master was rendered with a black/opaque background or a stale opaque master was reused.

Do not use HEVC for these Safari fallbacks unless you can verify actual alpha playback in Safari. Local `hevc_videotoolbox`/`avconvert` can produce plain `hvc1 yuv420p` and silently drop alpha.
