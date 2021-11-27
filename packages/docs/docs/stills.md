---
id: stills
title: Still images
---

_Available from v2.3_

Remotion is a great solution for rendering dynamic still images too.

## Rendering via CLI

You can use the [`npx remotion still`](/docs/cli/#npx-remotion-still) command to render a still image. Example command:

```bash
npx remotion still --props='{"custom": "data"}' src/index.tsx my-comp out.png
```

You can use the `--image-format` flag to determine the output format. The default format is `png`, with `jpeg` being the other option.

By default the frame with number of a composition is being rendered, you can control it using the `--frame` flag.

## Rendering using Node.JS

You can use the [`renderStill()`](/docs/renderer/render-still) Node.JS API to render a still frame programmatically.

## Rendering using serverless

[AWS Lambda integration is a work in progress.](/docs/ssr/#rendering-a-video-using-serverless)
