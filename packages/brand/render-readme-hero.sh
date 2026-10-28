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
from PIL import Image, ImageDraw

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

for theme, logo_name in [
    ("light", "remotion-wordmark.png"),
    ("dark", "remotion-wordmark-dark.png"),
]:
    with Image.open(Path("../remotion-media/public") / logo_name) as source:
        logo = source.convert("RGBA")
    logo = logo.resize((180, round(180 * logo.height / logo.width)), Image.Resampling.LANCZOS)
    # GitHub's README content uses a responsive container capped at 1012px.
    width = 1012
    frame_width = frames[0].width
    frame_height = frames[0].height
    bottom = 72 + frame_height
    background = Image.new("RGBA", (width, bottom + 1))
    draw = ImageDraw.Draw(background)
    shade = 255 if theme == "dark" else 0
    # Fade upward and smoothly to zero before either side of the image.
    for y in range(bottom - 100, bottom):
        vertical = (y - (bottom - 100)) / 99
        for x in range(16, width - 16):
            horizontal = min(1, (min(x, width - 1 - x) - 16) / 64)
            horizontal = horizontal * horizontal * (3 - 2 * horizontal)
            alpha = round(20 * vertical * horizontal)
            draw.point((x, y), fill=(shade, shade, shade, alpha))
    draw.line((0, bottom, width - 1, bottom), fill=(shade, shade, shade, 32))
    # Offset the wordmark slightly left of mathematical center for optical alignment.
    background.alpha_composite(logo, ((width - logo.width) // 2 - 12, 4))
    combined_frames = []
    for frame in frames:
        combined = background.copy()
        combined.alpha_composite(frame, ((width - frame_width) // 2, 72))
        combined_frames.append(combined)

    for extension, options in [
        ("webp", {"quality": 85, "method": 4, "minimize_size": True}),
        ("avif", {"quality": 75, "speed": 6, "subsampling": "4:4:4", "max_threads": 4}),
    ]:
        destination = output / f"homepage-hero-{theme}.{extension}"
        combined_frames[0].save(
            destination,
            save_all=True,
            append_images=combined_frames[1:],
            duration=durations,
            loop=0,
            **options,
        )
        print(f"{destination}: {destination.stat().st_size:,} bytes", flush=True)
PY
