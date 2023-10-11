---
image: /generated/articles-docs-renderer-extract-audio.png
id: extract-audio
title: extractAudio()
crumb: "@remotion/renderer"
---

# extractAudio()`<AvailableFrom v="4.0.48" />`

:::note
This function is meant to be used **in Node.js applications**. It cannot run in the browser.
:::

Extracts the audio from a video source and saves it to the specified output path.

## Example

```ts twoslash
// @module: ESNext
// @target: ESNext
import { extractAudio } from "@remotion/renderer";

await extractAudio({
  videoSource: "./path-to-video.mp4",
  audioOutput: "./output-audio-path.aac",
});
```

## Arguments

An object containing the following properties:

### `videoSource`

_string_

The path to the video source from which the audio will be extracted.

### `outputPath`

_string_

The path where the extracted audio will be saved.

### `logLevel`

_optional_

One of `verbose`, `info`, `warn`, `error`.

## Return Value

The function returns a `Promise<void>`, which resolves once the audio extraction is complete.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/renderer/src/extract-audio.ts)
- [getVideoMetadata()](/docs/renderer/get-video-metadata)
