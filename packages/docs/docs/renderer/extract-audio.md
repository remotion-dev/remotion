---
image: /generated/articles-docs-renderer-extract-audio.png
id: extract-audio
title: extractAudio()
crumb: "@remotion/renderer"
---
# extractAudio()`<AvailableFrom v="4.0.46" />`

:::note
This function is meant to be used **in Node.js applications**. It cannot run in the browser.
:::

Extracts the audio from a video source and saves it to the specified output path.

## Example

```ts
// @module: ESNext
// @target: ESNext
import { extractAudio } from "@remotion/renderer";

await extractAudio(
  "./path-to-video.mp4",
  "./output-audio-path.aac"
);
```

## Arguments

### `videoSourcePath`

_string_

The path to the video source from which the audio will be extracted.

### `outputPath`

_string_

The path where the extracted audio will be saved.

## Return Value

The function returns a `Promise<void>`, which resolves once the audio extraction is complete.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/renderer/src/extract-audio.ts)
- [Server-Side rendering](/docs/ssr)
- [getCompositions()](/docs/renderer/get-compositions)
- [renderStill()](/docs/renderer/stitch-frames-to-video)
- [renderMediaOnLambda()](/docs/lambda/rendermediaonlambda)
