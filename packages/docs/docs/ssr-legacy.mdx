---
image: /generated/articles-docs-ssr-legacy.png
id: ssr-legacy
title: Server-Side Rendering (v1 and v2)
crumb: "Legacy docs"
---

:::info
This documentation is how server-side rendering worked in Remotion v1 and Remotion v2. To see rendering in [3.0 and above, click here.](/docs/ssr)
:::

Remotion's rendering engine is built upon Node.JS, which makes it exceptionally easy to render a video in the cloud.

Since Remotion is built with tech (_Node.JS, FFMPEG, Puppeteer_) that works well cross-platform, you can without much hassle run it on a Linux-based system or even dockerize your video.

On this page, we demonstrate the server-rendering capabilities on Remotion using examples [built into the template](/docs/ssr)!

## Render a video programmatically

The NPM package `@remotion/renderer` provides you with an API for rendering the videos programmatically. You can make a video in three steps: creating a Webpack bundle, rendering the frames, and stitching them together to a MP4. This gives you more independence and allows you for example to skip the stitching process, if you just want a PNG sequence.

Follow this commented example to see how to render a video:

```tsx
import { bundle } from "@remotion/bundler";
import {
  getCompositions,
  renderFrames,
  stitchFramesToVideo,
} from "@remotion/renderer";
import fs from "fs";
import os from "os";
import path from "path";

const start = async () => {
  // The composition you want to render
  const compositionId = "HelloWorld";

  // Create a webpack bundle of the entry file.
  const bundleLocation = await bundle(require.resolve("./src/index.ts"));

  // Extract all the compositions you have defined in your project
  // from the webpack bundle.
  const comps = await getCompositions(bundleLocation, {
    // You can pass custom input props that you can retrieve using getInputProps()
    // in the composition list. Use this if you want to dynamically set the duration or
    // dimensions of the video.
    inputProps: {
      custom: "data",
    },
  });

  // Select the composition you want to render.
  const composition = comps.find((c) => c.id === compositionId);

  // Ensure the composition exists
  if (!composition) {
    throw new Error(`No composition with the ID ${compositionId} found`);
  }

  // We create a temporary directory for storing the frames
  const framesDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "remotion-"),
  );

  // We create JPEGs for all frames
  const { assetsInfo } = await renderFrames({
    config: composition,
    // Path of the webpack bundle you have created
    bundle: bundleLocation,
    // Get's called after bundling is finished and the
    // actual rendering starts.
    onStart: () => console.log("Rendering frames..."),
    onFrameUpdate: (f) => {
      // Log a message whenever 10 frames have rendered.
      if (f % 10 === 0) {
        console.log(`Rendered frame ${f}`);
      }
    },
    // How many CPU threads to use. `null` will use a sane default (half of the available threads)
    // See 'CLI options' section for concurrency options.
    parallelism: null,
    outputDir: framesDir,
    // React props passed to the root component of the sequence. Will be merged with the `defaultProps` of a composition.
    inputProps: {
      titleText: "Hello World",
    },
    // Can be either 'jpeg' or 'png'. JPEG is faster, but has no transparency.
    imageFormat: "jpeg",
  });

  // Add this step if you want to make an MP4 out of the rendered frames.
  await stitchFramesToVideo({
    // Input directory of the frames
    dir: framesDir,
    // Overwrite existing video
    force: true,
    // Possible overwrite of video metadata,
    // we suggest to just fill in the data from the
    // video variable
    fps: composition.fps,
    height: composition.height,
    width: composition.width,
    // Must match the value above for the image format
    imageFormat: "jpeg",
    // Pass in the desired output path of the video. Et voilà!
    outputLocation: path.join(framesDir, "out.mp4"),
    // FFMPEG pixel format
    pixelFormat: "yuv420p",
    // Information needed to construct audio correctly.
    assetsInfo,
    webpackBundle: bundleLocation,
    // Hook into the FFMPEG progress
    onProgress: (frame) => undefined,
  });
};

start();
```

## API reference

- [bundle()](/docs/bundle)
- [getCompositions()](/docs/renderer/get-compositions)
- [renderMedia()](/docs/renderer/render-media)
- [stitchFramesToVideo()](/docs/renderer/stitch-frames-to-video)
