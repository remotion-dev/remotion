"""Rebuild the browser assets, preserving the original background.

Usage: python3 prepare-assets.py /path/to/IMG_7860.HEIC [working-directory]
Requires macOS sips and Pillow. No generative or segmentation model is used.
"""

import io
from pathlib import Path
import subprocess
import sys
import tempfile

from PIL import Image, ImageCms, ImageOps


output = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(tempfile.gettempdir()) / "remotion-avatar-match"
output.mkdir(parents=True, exist_ok=True)
source_path = Path(sys.argv[1])
crop, framed_name = {
    "IMG_7832": ((690, 1420, 3990, 4720), "framed.jpg"),
    "IMG_7860": (
        (960, 1835, 3530, 4405),
        "framed-7860.jpg",
    ),
}[source_path.stem]
with tempfile.TemporaryDirectory() as directory:
    decoded = Path(directory) / "source.png"
    subprocess.run(
        ["sips", "-s", "format", "png", str(source_path), "--out", str(decoded)],
        check=True,
    )
    with Image.open(decoded) as source:
        photo = ImageOps.exif_transpose(source)
        profile = photo.info.get("icc_profile")
        if profile:
            photo = ImageCms.profileToProfile(
                photo,
                ImageCms.ImageCmsProfile(io.BytesIO(profile)),
                ImageCms.createProfile("sRGB"),
                outputMode="RGB",
            )
        else:
            photo = photo.convert("RGB")

        photo.save(output / f"{source_path.stem}.jpg", quality=97, subsampling=0)
        framed = photo.crop(crop).resize(
            (2160, 2160), Image.Resampling.LANCZOS
        )
        framed.save(output / framed_name, quality=98, subsampling=0)
