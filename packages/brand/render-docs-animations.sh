#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

transparent_webm_flags=(
	--image-format=png
	--pixel-format=yuva420p
	--codec=vp9
	--overwrite
)

bunx remotion render src/DocsAnimations/index.ts AnimatingPropertiesGraphLight ../docs/static/img/animating-properties-left-light.webm "${transparent_webm_flags[@]}"
bunx remotion render src/DocsAnimations/index.ts AnimatingPropertiesGraphDark ../docs/static/img/animating-properties-left-dark.webm "${transparent_webm_flags[@]}"
bunx remotion render src/DocsAnimations/index.ts AnimatingPropertiesTextLight ../docs/static/img/animating-properties-right-light.webm "${transparent_webm_flags[@]}"
bunx remotion render src/DocsAnimations/index.ts AnimatingPropertiesTextDark ../docs/static/img/animating-properties-right-dark.webm "${transparent_webm_flags[@]}"
bunx remotion render src/DocsAnimations/index.ts EasingGraphLight ../docs/static/img/animating-properties-easing-left-light.webm "${transparent_webm_flags[@]}"
bunx remotion render src/DocsAnimations/index.ts EasingGraphDark ../docs/static/img/animating-properties-easing-left-dark.webm "${transparent_webm_flags[@]}"
bunx remotion render src/DocsAnimations/index.ts EasingTextLight ../docs/static/img/animating-properties-easing-right-light.webm "${transparent_webm_flags[@]}"
bunx remotion render src/DocsAnimations/index.ts EasingTextDark ../docs/static/img/animating-properties-easing-right-dark.webm "${transparent_webm_flags[@]}"
bunx remotion render src/DocsAnimations/index.ts PosterizationGraphLight ../docs/static/img/animating-properties-posterization-left-light.webm "${transparent_webm_flags[@]}"
bunx remotion render src/DocsAnimations/index.ts PosterizationGraphDark ../docs/static/img/animating-properties-posterization-left-dark.webm "${transparent_webm_flags[@]}"
bunx remotion render src/DocsAnimations/index.ts PosterizationTextLight ../docs/static/img/animating-properties-posterization-right-light.webm "${transparent_webm_flags[@]}"
bunx remotion render src/DocsAnimations/index.ts PosterizationTextDark ../docs/static/img/animating-properties-posterization-right-dark.webm "${transparent_webm_flags[@]}"

grow_bounds_flags=(--scale=0.5 --codec=h264 --crf=16 --image-format=png --muted)
bunx remotion render src/DocsAnimations/index.ts GrowBoundsClippedWave out/grow-bounds-clipped-wave.mp4 "${grow_bounds_flags[@]}"
bunx remotion render src/DocsAnimations/index.ts GrowBoundsRevealWave out/grow-bounds-reveal-wave.mp4 "${grow_bounds_flags[@]}"
