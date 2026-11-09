# Avatar comparison

The `Avatar` folder in Studio contains:

- `AvatarSwap`: an eight-second, 1080 × 1080 transition containing only the old and
  new portraits, each at most 480 × 480 with generous white space. The cards
  follow opposing curved paths, scaling with depth and exchanging front/back
  order. The old portrait disappears and the new portrait holds in the center
  for the remainder of the video. Both portraits are fully circular with a subtle
  soft shadow. There are no additional objects or text.
- `AvatarMatched`: the finished 1080 × 1080 portrait.
- `AvatarComparison`: the downloaded jonny.io reference on the left, the new
  matched portrait on the right, each at 1080 × 1080.
- `AvatarBeforeAfter`: the ungraded square crop on the left, the finished
  portrait on the right.

The three comparison/portrait compositions are static five-second compositions. The matched portrait is shared
as a connected composition, so its color edits apply to both comparisons.
The image's effects expose the LUT bypass and additional primary color controls.

## Source and adjustments

`IMG_7860.jpg` is an orientation-normalized, sRGB conversion
of the supplied `IMG_7860.HEIC`, retaining the full 4284 × 5712 photograph.
The compositions use this newer take. The earlier `IMG_7832.jpg`, `framed.jpg`,
`portrait.png`, and `mask.png` are preserved on R2 alongside it.
`reference.png` is a local copy of https://jonny.io/avatar.png retrieved on
November 6, 2026. All media is hosted on `https://remotion.media/`;
`assets.json` records the content-addressed URLs for the source photographs,
prepared images, masks, and final MP4. No media binaries are stored in the repository.
Every upload was verified against its public SHA-256 hash.

The new photograph is cropped to `(960, 1835, 3530, 4405)` in oriented source
pixels and reduced to 2160 × 2160 for the 1080 × 1080 output. The crop matches
the reference's eye line, head scale, and headroom without warping the subject.

The matched portrait uses `portrait-7860-refined.png` over pure white. Its mask
starts with MODNet, the person-segmentation model used by Remotion's video matting
package, running locally on the photograph. Closed-form alpha matting refines
the hair, ear, and fabric boundaries at 2160 × 2160. Multilevel foreground
estimation removes the original wall color from partially transparent edge
pixels. Fully opaque interior pixels are preserved before the color grade.
No subject pixels are generated, and the wall shadows are not carried into the
white background. The earlier manually traced cutouts are no longer used.

`AvatarBeforeAfter` keeps `framed-7860.jpg` on the left, including the original
wall and shadows, with the finished portrait on the right.

`color-grade.ts` builds a conventional 33³ RGB LUT: reduce the orange cast,
lift neutral midtones in the sweatshirt, and preserve the skin's existing
shadows and highlights. A modest contrast adjustment retains more of the
captured facial lighting. The grade is tuned for `IMG_7860`.
Skin-colored pixels receive a restrained exposure lift in linear light, with
less lift in the highlights than in the darker skin tones. The skin color match
was checked against forehead, cheek, nose, and neck samples from the reference.
It reduces excess red and yellow in brighter skin using CIELAB chroma adjustments
that preserve lightness. Darker skin colors, gray clothing, and the white
background are protected from that chroma adjustment.
A separate skin-only CIELAB lightness adjustment increases contrast around
L\*=63, keeping the matched chroma while separating existing eye, nose, and jaw
shadows from brighter skin. It does not synthesize new reflections or reshape
features.
A small, selective 8% skin-chroma boost adds vibrancy without adding a color cast
to the gray sweatshirt or dark hair.
No generative AI, face reconstruction, skin smoothing, or geometry edits are
used. The different pose, hairstyle, facial hair, and original lighting remain.

To regenerate the image assets, use Pillow and macOS `sips`. These commands
write to an external working directory (default: the system temporary folder
under `remotion-avatar-match`):

```sh
python3 src/avatar-match/prepare-assets.py /path/to/IMG_7860.HEIC /tmp/remotion-avatar-match
```

Then regenerate the local AI mask and refine it. The Node script reuses the
monorepo's installed Transformers runtime and downloads the model to a temporary
cache. The Python step requires Pillow, NumPy, OpenCV, and PyMatting; these are
preparation dependencies only, not browser or render dependencies.

```sh
node src/avatar-match/segment-portrait.mjs /tmp/remotion-avatar-match
uv run --with pillow --with opencv-python-headless --with pymatting src/avatar-match/refine-portrait.py /tmp/remotion-avatar-match
```

The scripts fetch missing prepared inputs from `assets.json`. Re-publish changed
outputs with the offload-r2 workflow and update the manifest before using them in
a composition. Rendering needs no Python or AI runtime.

From `packages/jonnys-videos`, render the avatar and comparison:

```sh
bunx remotion still AvatarMatched out/avatar-matched.png
bunx remotion still AvatarComparison out/avatar-comparison.png
bunx remotion still AvatarBeforeAfter out/avatar-before-after.png
bunx remotion render AvatarSwap out/avatar-swap.mp4
```
