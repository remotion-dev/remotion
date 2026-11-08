#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

version=$(bun -p 'require("./binaries.json").version')
layers=(chromium fonts emoji-apple emoji-google cjk)

for layer in "${layers[@]}"; do
    if [ ! -d "layers/$layer" ]; then
        echo "Missing layers/$layer. Run bun run download first." >&2
        exit 1
    fi
done

mkdir -p out
for layer in "${layers[@]}"; do
    archive="remotion-layer-$layer-v$version-arm64.zip"
    # Start a fresh archive so files removed from a custom layer stay removed.
    rm -f "out/$archive"
    (cd "layers/$layer" && zip -q -9 --recurse-paths "../../out/$archive" .)
    unzip -tq "out/$archive"
done
