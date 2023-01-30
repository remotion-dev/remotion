---
image: /generated/articles-docs-ssr.png
id: ssr
title: Server-Side Rendering
crumb: "The power of"
---

:::info
This documentation is how server-side rendering works in Remotion v3 and above. To see rendering in [2.0 and below, click here.](/docs/ssr-legacy)
:::

Remotion's rendering engine is built upon Node.JS, which makes it easy to render a video in the cloud.

Since Remotion is built with tech (_Node.JS, FFMPEG, Puppeteer_) that works well cross-platform, you can without much hassle run it on a Linux-based system or even dockerize your video.

## Render a video on AWS Lambda

The easiest and fastest way to render videos in the cloud is to use `@remotion/lambda`. [Click here to read the documentation for it](/docs/lambda).

## Render a video using Node.JS APIs

The NPM package `@remotion/renderer` provides you with an API for rendering the videos programmatically. You can make a video in two steps: 1. Creating a Webpack bundle, then 2. rendering and stitching them together to an MP4.

Follow this commented example to see how to render a video:

```tsx twoslash
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";

const start = async () => {
  // The composition you want to render
  const compositionId = "HelloWorld";

  // You only have to do this once, you can reuse the bundle.
  const entry = "./src/index";
  console.log("Creating a Webpack bundle of the video");
  const bundleLocation = await bundle(path.resolve(entry), () => undefined, {
    // If you have a Webpack override, make sure to add it here
    webpackOverride: (config) => config,
  });

  // Parametrize the video by passing arbitrary props to your component.
  const inputProps = {
    foo: "bar",
  };

  // Extract all the compositions you have defined in your project
  // from the webpack bundle.
  const comps = await getCompositions(bundleLocation, {
    // You can pass custom input props that you can retrieve using getInputProps()
    // in the composition list. Use this if you want to dynamically set the duration or
    // dimensions of the video.
    inputProps,
  });

  // Select the composition you want to render.
  const composition = comps.find((c) => c.id === compositionId);

  // Ensure the composition exists
  if (!composition) {
    throw new Error(`No composition with the ID ${compositionId} found.
  Review "${entry}" for the correct ID.`);
  }

  const outputLocation = `out/${compositionId}.mp4`;
  console.log("Attempting to render:", outputLocation);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation,
    inputProps,
  });
  console.log("Render done!");
};

start();
```

This flow is highly customizable. Click on one of the SSR APIs to read about it's options:

- [`getCompositions()`](/docs/renderer/get-compositions) - Get a list of available compositions from a Remotion project.
- [`renderMedia()`](/docs/renderer/render-media) - Render a video or audio
- [`renderFrames()`](/docs/renderer/render-frames) - Render an image sequence
- [`renderStill()`](/docs/renderer/render-still) - Render a still image
- [`stitchFramesToVideo()`](/docs/renderer/stitch-frames-to-video) - Encode a video based on an image sequence
- [`openBrowser()`](/docs/renderer/open-browser) - Share a browser instance across function calls for even better performance.

Note that we only added a minimal example. For production, you should consider adding a queueing system and rate limiting.

## Render using GitHub Actions

The template includes a GitHub Actions workflow file
under `.github/workflows/render-video.yml`. All you have to do is to adjust the props that your root component accepts in the workflow file and you can render a video right on GitHub.

1. Commit the template to a GitHub repository
2. On GitHub, click the 'Actions' tab.
3. Select the 'Render video' workflow on the left.
4. A 'Run workflow' button should appear. Click it
5. Fill in the props of the root component and click 'Run workflow'.
6. After the rendering is finished, you can download the video under 'Artifacts'.

Note that running the workflow may incur costs. However, the workflow will only run if you actively trigger it.

[See also: Passing props in GitHub Actions](/docs/parametrized-rendering#passing-props-in-github-actions)

## API reference

- [bundle()](/docs/bundle)
- [getCompositions()](/docs/renderer/get-compositions)
- [renderMedia()](/docs/renderer/render-media)
- [stitchFramesToVideo()](/docs/renderer/stitch-frames-to-video)
