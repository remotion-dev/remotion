---
id: ssr
title: Server-Side Rendering
---

:::info
This documentation is how server-side rendering works in Remotion v3 and above. To see rendering in [2.0 and below, click here.](/docs/ssr-legacy)
:::

Remotion's rendering engine is built upon Node.JS, which makes it easy to render a video in the cloud.

Since Remotion is built with tech (_Node.JS, FFMPEG, Puppeteer_) that works well cross-platform, you can without much hassle run it on a Linux-based system or even dockerize your video.

## Render a video programmatically

The NPM package `@remotion/renderer` provides you with an API for rendering the videos programmatically. You can make a video in three steps: creating a Webpack bundle, rendering the frames, and stitching them together to an MP4. This gives you more independence and allows you to for example skip the stitching process, if you just want a PNG sequence.

Follow this commented example to see how to render a video:

```tsx twoslash
import fs from "fs";
import os from "os";
import path from "path";
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";

const start = async () => {
  // The composition you want to render
  const compositionId = "HelloWorld";

  // Create a webpack bundle of the entry file.
  const bundleLocation = await bundle(require.resolve("./src/index"));

  const inputProps = {
    custom: "data",
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
    throw new Error(`No composition with the ID ${compositionId} found`);
  }

  await renderMedia({
    config: composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: "out/video.mp4",
    // React props passed to the root component of the sequence. Will be merged with the `defaultProps` of a composition.
    inputProps,
  });
};

start();
```

[See also: Passing props in GitHub Actions](/docs/parametrized-rendering#passing-props-in-github-actions)

## Render using a HTTP server

In the [template](/docs#installation), we added a minimal example of an HTTP server that dynamically returns a video whenever you call the URL.

The server is located under `server.tsx`, and you can run it using `npm run server`. Call the default URL with parameters, and it will return a video after some time! Try it out in the browser or using cURL:

```bash
curl "http://localhost:8000?titleText=Hello,+World!&titleColor=red" > output.mp4
```

Note that we only added a minimal example. For production, you should consider adding a queueing system and rate limiting.

## Render using a HTTP server (Dockerized)

We added a Dockerfile that includes FFMPEG and added it to the template. That means you can also run the server described in the section above using Docker.

```bash
docker build -t my-video .
docker run -p 8000:8000 --privileged my-video
```

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

## Rendering a video using serverless

We are working on a library which will help you render videos using AWS Lambda. Contact us if you are interested in testing an early version or read the `#lambda` channel on our Discord server.

## API reference

- [bundle()](/docs/bundle)
- [getCompositions()](/docs/get-compositions)
- [renderFrames()](/docs/render-frames)
- [stitchFramesToVideo()](/docs/stitch-frames-to-video)
