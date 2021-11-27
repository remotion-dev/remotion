---
slug: renderer
sidebar_label: Overview
title: "@remotion/renderer"
---

The `@remotion/renderer` package provides APIs for rendering video server-side.
The package is also internally used by the Remotion CLI and [Remotion Lambda](/docs/lambda).

## Server-side rendering examples

See the [Server-side rendering](/docs/ssr) for some examples of how to use server-side rendering.

## Available functions

The following APIs are available in the `@remotion/renderer` package:

- [`getCompositions()`](/docs/renderer/get-compositions) - Get a list of available compositions from a Remotion project.
- [`renderMedia()`](/docs/renderer/render-media) - Render a video or audio
- [`renderFrames()`](/docs/renderer/render-frames) - Render an image sequence
- [`renderStill()`](/docs/renderer/render-still) - Render a still image
- [`stitchFramesToVideo()`](/docs/renderer/stitch-frames-to-video) - Encode a video based on an image sequence
- [`openBrowser()`](/docs/renderer/open-browser) - Share a browser instance across function calls for even better performance.

## What's the difference between `renderMedia()` and `renderFrames()`?

In Remotion 3.0, we added the [`renderMedia()`](/docs/renderer/render-media) API which combines `renderFrames()` and `stitchFramesToVideo()` into one simplified step and performs the render faster. Prefer this API if you can.
