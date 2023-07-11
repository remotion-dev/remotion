---
image: /generated/articles-docs-renderer-get-video-metadata.png
id: get-video-metadata
title: getVideoMetadata()
crumb: "@remotion/renderer"
---

# getVideoMetadata()<AvailableFrom v="4.0.6" />

:::note
This function is meant to be used **in Node.js applications**. For browsers, use [`getVideoMetadata()`](/docs/get-video-metadata) from `@remotion/media-utils` instead.
:::

Get a videos `width`, `height`, `fps`, and `duration` in Node.js. Useful for calculating metadata on a server.

## Example

Pass a videos metadata to `inputProps` before rendering, without having to load the video in the browser.

```ts twoslash
// @module: ESNext
// @target: ESNext
import { bundle } from "@remotion/bundler";
import {
  getVideoMetadata,
  selectComposition,
  renderMedia,
} from "@remotion/renderer";
import path from "path";

// Local video file
const videoSourcePath = "./bunny.mp4";

const { width, height, fps, duration } = await getVideoMetadata(
  videoSourcePath
);

// The Remotion root.
const entry = "src/index.ts";

const bundleLocation = await bundle(path.resolve(entry), () => undefined, {
  // If you have a Webpack override, make sure to add it here
  webpackOverride: (config) => config,
});

// The ID of the composition to render
const compositionId = "main";

// Provide the metadata to the composition
const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: compositionId,
  inputProps: {
    width,
    height,
    fps,
    duration,
  },
});

// Local path to save the rendered video.
const outputLocation = `out/sample.mp4`;
console.log("Attempting to render:", outputLocation);

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
});
```

The parameters provided in the `inputProps` is accessible from `getInputProps()` on the composition root.

```tsx
import { getInputProps, Composition } from "remotion";

const videoMetadata = getInputProps();

<Composition
  id="main"
  component={MyComponent}
  durationInFrames={(videoMetadata.duration ?? 10) * (videoMetadata.fps ?? 30)}
  fps={videoMetadata.fps ?? 30}
  width={videoMetadata.width ?? 1080}
  height={videoMetadata.height ?? 1080}
  defaultProps={{}}
/>;
```

## Arguments

### `videoSource`

_string_

A local video file path.

## Return Value

The return value is an object with the following properties:

- `fps`: The frame rate of the video in seconds.
- `width`: The width of the video in pixel.
- `height`: The height of the video in pixel.
- `duration`: The time length of the video in seconds.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/renderer/src/get-video-metadata.ts)
- [Server-Side rendering](/docs/ssr)
- [getCompositions()](/docs/renderer/get-compositions)
- [renderStill()](/docs/renderer/stitch-frames-to-video)
- [renderMediaOnLambda()](/docs/lambda/rendermediaonlambda)
