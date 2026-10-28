#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# Requires Python 3 and Pillow 11.3+ with WebP and AVIF support.
# Keep generated media out of Git; upload the results to remotion.media.
output="../../out/readme-hero"
mkdir -p "$output"

bunx remotion render src/index.ts StudioCodeHandoff "$output/frames" \
	--sequence --image-format=png --scale=0.5

python3 - "$output" <<'PY'
from pathlib import Path
import sys
from PIL import Image

output = Path(sys.argv[1])
frames = []
durations = []
previous = None
for index, path in enumerate(sorted((output / "frames").glob("element-*.png"))[1::2]):
    with Image.open(path) as source:
        frame = source.convert("RGBA")
    pixels = frame.tobytes()
    duration = round((index + 1) * 1000 / 15) - round(index * 1000 / 15)
    if pixels == previous:
        durations[-1] += duration
    else:
        frames.append(frame)
        durations.append(duration)
    previous = pixels

for extension, options in [
    ("webp", {"quality": 85, "method": 4, "minimize_size": True}),
    ("avif", {"quality": 75, "speed": 6, "subsampling": "4:4:4", "max_threads": 4}),
]:
    destination = output / f"homepage-hero.{extension}"
    frames[0].save(
        destination,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        **options,
    )
    print(f"{destination}: {destination.stat().st_size:,} bytes")
PY
