# Requires Pillow 11.3+ with WebP and AVIF support. Layout is rendered by Remotion.
from pathlib import Path
import sys
from PIL import Image

frames = []
durations = []
previous = None
for index, path in enumerate(sorted(Path(sys.argv[1]).glob("element-*.png"))):
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
    destination = Path(f"{sys.argv[2]}.{extension}")
    frames[0].save(
        destination,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        **options,
    )
    print(f"{destination}: {destination.stat().st_size:,} bytes", flush=True)
