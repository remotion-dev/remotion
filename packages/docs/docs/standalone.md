---
image: /generated/articles-docs-standalone.png
id: standalone
title: Useful functions outside of Remotion
sidebar_label: Standalone functions
---

Remotion APIs are designed to be as pure as possible, doing just one thing at a time.  
This makes them easy to use not just for Remotion, but also in other environments.

**Bolded APIs** are licensed under the [Remotion license](https://remotion.dev/license) (companies need to purchase a license to use them).  
Unbolded APIs are licensed under the MIT license.

**remotion**:

- **[interpolate\(\)](https://www.remotion.dev/docs/interpolate)**
- **[spring\(\)](https://www.remotion.dev/docs/spring)**

**@remotion/renderer**:

- **[getCanExtractFramesFast\(\)](https://www.remotion.dev/docs/renderer/get-can-extract-frames-fast)**
- **[getVideoMetadata\(\)](https://www.remotion.dev/docs/renderer/get-video-metadata)**
- **[getSilentParts\(\)](https://www.remotion.dev/docs/renderer/get-silent-parts)**
- **[extractAudio\(\)](https://www.remotion.dev/docs/renderer/extract-audio)**

**@remotion/gif**:

- **[getGifDurationInSeconds\(\)](https://www.remotion.dev/docs/gif/get-gif-duration-in-seconds)**

**@remotion/media-utils**:

- [audioBufferToDataUrl\(\)](https://www.remotion.dev/docs/audio-buffer-to-data-url)
- [getAudioData\(\)](https://www.remotion.dev/docs/get-audio-data)
- [getAudioDurationInSeconds\(\)](https://www.remotion.dev/docs/get-audio-duration-in-seconds)
- [getVideoMetadata\(\)](https://www.remotion.dev/docs/get-video-metadata)
- [getWaveformPortion\(\)](https://www.remotion.dev/docs/get-waveform-portion)
- [useAudioData\(\)](https://www.remotion.dev/docs/use-audio-data)
- [visualizeAudio\(\)](https://www.remotion.dev/docs/visualize-audio)

**@remotion/preload**:

- [preloadVideo\(\)](https://www.remotion.dev/docs/preload/preload-video)
- [preloadAudio\(\)](https://www.remotion.dev/docs/preload/preload-audio)
- [preloadImage\(\)](https://www.remotion.dev/docs/preload/preload-image)
- [preloadFont\(\)](https://www.remotion.dev/docs/preload/preload-font)
- [resolveRedirect\(\)](https://www.remotion.dev/docs/preload/resolve-redirect)

**@remotion/paths**:

- [getLength\(\)](https://www.remotion.dev/docs/paths/get-length)
- [getPointAtLength\(\)](https://www.remotion.dev/docs/paths/get-point-at-length)
- [getTangentAtLength\(\)](https://www.remotion.dev/docs/paths/get-tangent-at-length)
- [getInstructionIndexAtLength\(\)](https://www.remotion.dev/docs/paths/get-instruction-index-at-length)
- [reversePath\(\)](https://www.remotion.dev/docs/paths/reverse-path)
- [normalizePath\(\)](https://www.remotion.dev/docs/paths/normalize-path)
- [interpolatePath\(\)](https://www.remotion.dev/docs/paths/interpolate-path)
- [evolvePath\(\)](https://www.remotion.dev/docs/paths/evolve-path)
- [resetPath\(\)](https://www.remotion.dev/docs/paths/reset-path)
- [getSubpaths\(\)](https://www.remotion.dev/docs/paths/get-subpaths)
- [translatePath\(\)](https://www.remotion.dev/docs/paths/translate-path)
- [warpPath\(\)](https://www.remotion.dev/docs/paths/warp-path)
- [scalePath\(\)](https://www.remotion.dev/docs/paths/scale-path)
- [getBoundingBox\(\)](https://www.remotion.dev/docs/paths/get-bounding-box)
- [extendViewBox\(\)](https://www.remotion.dev/docs/paths/extend-viewbox)
- [parsePath\(\)](https://www.remotion.dev/docs/paths/parse-path)
- [serializeInstructions\(\)](https://www.remotion.dev/docs/paths/serialize-instructions)
- [reduceInstructions\(\)](https://www.remotion.dev/docs/paths/reduce-instructions)
- [getParts\(\)](https://www.remotion.dev/docs/paths/get-parts)

**@remotion/noise**:

- [noise2D\(\)](https://www.remotion.dev/docs/noise/noise-2d)
- [noise3D\(\)](https://www.remotion.dev/docs/noise/noise-3d)
- [noise4D\(\)](https://www.remotion.dev/docs/noise/noise-4d)

**@remotion/shapes**:

- [`<Rect />`](https://www.remotion.dev/docs/shapes/rect)
- [`<Triangle />`](https://www.remotion.dev/docs/shapes/triangle)
- [`<Circle />`](https://www.remotion.dev/docs/shapes/circle)
- [`<Ellipse />`](https://www.remotion.dev/docs/shapes/ellipse)
- [`<Star />`](https://www.remotion.dev/docs/shapes/star)
- [`<Pie />`](https://www.remotion.dev/docs/shapes/pie)
- [`<Polygon />`](https://www.remotion.dev/docs/shapes/polygon)
- [makeRect\(\)](https://www.remotion.dev/docs/shapes/make-rect)
- [makeTriangle\(\)](https://www.remotion.dev/docs/shapes/make-triangle)
- [makeCircle\(\)](https://www.remotion.dev/docs/shapes/make-circle)
- [makeEllipse\(\)](https://www.remotion.dev/docs/shapes/make-ellipse)
- [makeStar\(\)](https://www.remotion.dev/docs/shapes/make-star)
- [makePie\(\)](https://www.remotion.dev/docs/shapes/make-pie)
- [makePolygon\(\)](https://www.remotion.dev/docs/shapes/make-polygon)

**@remotion/layout-utils**:

- [measureText\(\)](https://www.remotion.dev/docs/layout-utils/measure-text)
- [fillTextBox\(\)](https://www.remotion.dev/docs/layout-utils/fill-text-box)
