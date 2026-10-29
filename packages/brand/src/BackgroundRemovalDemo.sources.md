# Background removal homepage asset

Source photograph: https://remotion.media/transition-bg-blue.jpg (1080×720).

The building mask was extracted with the built-in imagegen tool, resized to
the photograph dimensions and thresholded at 128. RGB pixels are preserved
from the original photograph. The Sky layer uses the opaque original to
avoid transparent seams.

Imagegen prompt: Remove only the sky and clouds, leaving true transparency;
preserve the building's grid, perspective, geometry, lighting, colors,
silhouette, original 3:2 canvas, position and crop. Do not recenter or redraw.

- Opaque background: https://remotion.media/explore-remotion/building-background-2026-10-28-69fc218591c6.jpg
- Building cutout: https://remotion.media/explore-remotion/building-building-2026-10-28-273eb6c977ae.png
- Complementary sky cutout (archived): https://remotion.media/explore-remotion/building-sky-2026-10-28-457e7532ec5a.png

The editable BackgroundRemovalDemo composition is flat, 1620×1080, with
Sky, Remotion text, and Building layers. Tilt is applied only in the final
homepage composition.

## Recording and processing

Original download: remotion-capture-localhost-2026-10-28T14-10-57-153Z.mp4.
Imported as ExploreBuildingRecording20261028 (2102×1440, 60 fps, 357 frames),
including editable cursor keyframes. Original download remains untouched.

- Source capture: https://remotion.media/explore-remotion/building-remotion-capture-localhost-2026-10-28T14-10-57-153Z-2026-10-28-f37ebc370ecb.mp4
- Final homepage video: https://remotion.media/explore-remotion/building-background-removal-2026-10-28-2e506bf93665.mp4

ExploreRemotionBackgroundRemoval reframes the full recording into 1080×1080,
uses EXPLORE_CAMERA_ANGLE, and applies radial progressive blur (maximum 6px).
The H.264 output is 1080×1080, 60 fps, 5.95 seconds, CRF 18, yuv420p.
Every uploaded asset was verified against its local SHA-256 hash before
repository-local copies were removed.
