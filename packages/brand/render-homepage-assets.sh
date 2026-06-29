#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

transparent_webm_flags=(
	--image-format=png
	--pixel-format=yuva420p
	--codec=vp8
	--overwrite
)

bunx remotion render NpmInitVideo ../promo-pages/public/img/compose.webm "${transparent_webm_flags[@]}"
bunx remotion render RenderProgress ../promo-pages/public/img/render-progress.webm "${transparent_webm_flags[@]}"
bunx remotion render Studio ../promo-pages/public/img/editing-vp9-chrome.webm "${transparent_webm_flags[@]}"
