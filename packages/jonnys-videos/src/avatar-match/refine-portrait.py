"""Refine the MODNet silhouette and remove background color from edge pixels."""

import json
from pathlib import Path
import sys
import subprocess
import tempfile

import cv2
import numpy as np
from PIL import Image
from pymatting import estimate_alpha_cf, estimate_foreground_ml


assets = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(tempfile.gettempdir()) / "remotion-avatar-match"
assets.mkdir(parents=True, exist_ok=True)
urls = json.loads(Path(__file__).with_name("assets.json").read_text())
for name in ("framed-7860.jpg", "segmentation-7860.png"):
    if not (assets / name).exists():
        subprocess.run(
            ["curl", "--fail", "--silent", "--show-error", "--location", urls[name], "--output", str(assets / name)],
            check=True,
        )
image = np.asarray(Image.open(assets / "framed-7860.jpg").convert("RGB"), dtype=np.float64) / 255
segmentation = (np.asarray(Image.open(assets / "segmentation-7860.png").convert("L")) > 128).astype("uint8")
inner = cv2.erode(segmentation, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))
outer = cv2.dilate(segmentation, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
trimap = np.full(segmentation.shape, 0.5)
trimap[inner > 0] = 1
trimap[outer == 0] = 0

alpha = estimate_alpha_cf(
    image,
    trimap,
    laplacian_kwargs={"epsilon": 1e-6},
    cg_kwargs={"maxiter": 1000},
)
foreground = estimate_foreground_ml(image, alpha)
foreground[alpha > 0.99] = image[alpha > 0.99]

Image.fromarray(np.uint8(np.rint(np.clip(alpha, 0, 1) * 255))).save(assets / "matte-7860.png")
rgba = np.dstack((foreground, alpha))
Image.fromarray(np.uint8(np.rint(np.clip(rgba, 0, 1) * 255))).save(assets / "portrait-7860-refined.png")
