#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

transparent_webm_flags=(
	--image-format=png
	--pixel-format=yuva420p
	--codec=vp8
	--overwrite
)

bunx remotion render WhatIsRemotion ../promo-pages/public/img/what-is-remotion.webm --timeout=120000 "${transparent_webm_flags[@]}"
bunx remotion render RenderProgress ../promo-pages/public/img/render-progress.webm --timeout=120000 "${transparent_webm_flags[@]}"
bunx remotion render Studio ../promo-pages/public/img/editing-vp9-chrome.webm --timeout=120000 "${transparent_webm_flags[@]}"
bunx remotion render homepage-assets-master ../promo-pages/public/img/homepage-assets-master.webm --timeout=120000 "${transparent_webm_flags[@]}"
