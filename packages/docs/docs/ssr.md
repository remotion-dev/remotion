---
image: /generated/articles-docs-ssr.png
id: ssr
title: Server-Side Rendering
crumb: "The power of"
---

import {TableOfContents} from '../components/TableOfContents/renderer';

Remotion's rendering engine is built with Node.JS, which makes it easy to render a video in the cloud.

## Render a video on AWS Lambda

The easiest and fastest way to render videos in the cloud is to use [`@remotion/lambda`](/docs/lambda).

## Render a video using Node.JS APIs

The NPM package `@remotion/renderer` provides you with an API for rendering media programmatically. You can make a video in three steps:

<Step>1</Step> Creating a <a href="/docs/terminology#bundle">Remotion Bundle</a><br/>
<Step>2</Step> Select the composition to render and calculate its metadata<br/>
<Step>3</Step> Rendering frames and stitching them together to an MP4.<br/><br/>

Follow this commented example to see how to render a video:

```tsx twoslash title="render.mjs"
// @module: ESNext
// @target: ESNext
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";

// The composition you want to render
const compositionId = "HelloWorld";

// You only have to create a bundle once, and you may reuse it
const bundleLocation = await bundle({
  entryPoint: path.resolve("./src/index"),
  // If you have a Webpack override, make sure to add it here
  webpackOverride: (config) => config,
});

// Parametrize the video by passing arbitrary props to your component.
const inputProps = {
  foo: "bar",
};

// Get the composition you want to render. Pass inputProps if you want to customize the
// duration or other metadata.
const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: compositionId,
  inputProps,
});

// Render the video
await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: `out/${compositionId}.mp4`,
  inputProps,
});

console.log("Render done!");
```

This flow is highly customizable. Click on one of the SSR APIs to read about it's options:

- [`getCompositions()`](/docs/renderer/get-compositions) - Get a list of available compositions from a Remotion project.
- [`selectComposition()`](/docs/renderer/select-composition) - Get a list of available compositions from a Remotion project.
- [`renderMedia()`](/docs/renderer/render-media) - Render a video or audio.
- [`renderFrames()`](/docs/renderer/render-frames) - Render an image sequence.
- [`renderStill()`](/docs/renderer/render-still) - Render a still image.
- [`stitchFramesToVideo()`](/docs/renderer/stitch-frames-to-video) - Encode a video based on an image sequence
- [`openBrowser()`](/docs/renderer/open-browser) - Share a browser instance across function calls for improved performance.

## Render using GitHub Actions

The [Hello World starter template](https://github.com/remotion-dev/template-helloworld) includes a GitHub Actions workflow file [`.github/workflows/render-video.yml`](https://github.com/remotion-dev/template-helloworld/blob/main/.github/workflows/render-video.yml).

<Step>1</Step> Commit the template to a GitHub repository.<br/>
<Step>2</Step> On GitHub, click the <code>Actions</code> tab.<br/>
<Step>3</Step> Select the <code>Render video</code> workflow on the left.<br/>
<Step>4</Step> A <code>Run workflow</code> button should appear. Click it.<br/>
<Step>5</Step> Fill in the props of the root component and click <code>Run workflow</code>. <br/>
<Step>6</Step> After the rendering is finished, you can download the video under <code>Artifacts</code>.<br/><br/>

Note that running the workflow may incur costs. However, the workflow will only run if you actively trigger it.

See also: [Passing input props in GitHub Actions](/docs/parametrized-rendering#passing-input-props-in-github-actions)

## Render a video using Docker

See: [Dockerizing a Remotion project](/docs/docker)

## Render a video using GCP Cloud Run

An official Remotion package for Cloud Run is in development. Register your interest in [Discord](https://remotion.dev/discord) if you want to be a beta tester.

## API reference

<TableOfContents />
