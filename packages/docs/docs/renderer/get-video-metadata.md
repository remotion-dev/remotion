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

Gets metadata about a video file in Node.js. Useful for calculating metadata on a server.

## Example

```ts twoslash
// @module: ESNext
// @target: ESNext
import { getVideoMetadata } from "@remotion/renderer";

const { width, height, fps, durationInSeconds } =
  await getVideoMetadata("./bunny.mp4");
```

## Arguments

### `videoSource`

_string_

A local video file path.

## Return Value

The return value is an object with the following properties:

### `fps`

_number_

The amount of frames per seconds the video has (framerate)

### `width`

_number_

The width of the video in px.

### `height`

_number_

The height of the video in px.

### `durationInSeconds`

_number_

The time length of the video in seconds.

### `codec`<AvailableFrom v="4.0.8" />

_string_

One of `'h264' | 'h265' | 'vp8' | 'vp9' | 'av1' | 'prores'` or ` 'unknown'` if the codec is not officially supported by Remotion.

### `supportsSeeking`<AvailableFrom v="4.0.8" />

_boolean_

A prediction whether the video will be seekable in the browser. The algorithm is:

1. If the codec is `unknown`, then the video is not seekable (`false`).
2. If the video is shorter than 5 seconds, then it is seekable (`true`).
3. If the codec is not `h264`, then it is seekable (`true`).
4. The codec is now `h264`. If it supports Faststart (the `moov` atom is in front of the `mdat` atom), then it is seekable (`true`)
5. Otherwise, it is not seekable (`false`).

If a video is not seekable, you might run into the ["Non-seekable media"](/docs/non-seekable-media) error.  
This means that the video might fail to render if embedded in a `<Video>` tag and be slow if embedded in a `<OffthreadVideo>` tag.

You may consider re-encoding the video using FFmpeg to make it seekable.

### `colorSpace`<AvailableFrom v="4.0.28"/>

One of `rgb`, `bt601`, `bt709`, `bt2020-ncl`, `bt2020-cl`, `fcc`, `bt470bg`, `smpte170m`, `smpte240m`, `ycgco`, `smpte2085`, `chroma-derived-ncl`, `chroma-derived-cl`, `ictcp` or `unknown`.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/renderer/src/get-video-metadata.ts)
- [Server-Side rendering](/docs/ssr)
- [getCompositions()](/docs/renderer/get-compositions)
- [renderStill()](/docs/renderer/stitch-frames-to-video)
- [renderMediaOnLambda()](/docs/lambda/rendermediaonlambda)
