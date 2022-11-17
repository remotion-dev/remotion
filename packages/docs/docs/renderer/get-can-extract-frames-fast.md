---
title: getCanExtractFramesFast()
id: can-extract-frames-fast
---

_Available since v3.3.2 - Part of the `@remotion/renderer` package._

Probes whether frames of a video can be efficiently extracted when using [`<OffthreadVideo>`](/docs/offthreadvideo).

```ts twoslash
// @module: ESNext
// @target: ESNext
import { getCanExtractFramesFast } from "@remotion/renderer";

const result = await getCanExtractFramesFast({
  src: "/var/path/to/video.mp4",
});

console.log(result.canExtractFramesFast); // false
console.log(result.shouldReencode); // true
```

## When to use this API

If you are using [`<OffthreadVideo>`](/docs/offthreadvideo), you might get a warning ["Using a slow method to extract the frame"](/docs/slow-method-to-extract-frame) if a video is included which does not include enough metadata to efficiently extract a certain frame of a video. This might result in the render becoming slow.

Using this API, you can probe whether this issue affects your video file. It will try to extract the last frame of a video and if it succeeds, your video is not affected. Otherwise, `canExtractFramesFast` will be `false`.

## How to act on the results

When `canExtractFramesFast` is `false`, you should check the `shouldReencode` flag. If it is true, you can re-encode the video to make the render faster. Note that it is not always faster to re-encode the video than it is to deal with a slow render.

Videos with a VP8 codec don't support fast frame extraction at all, and therefore `shouldReencode` can be false even if `canExtractFramesFast` is false.

## Arguments

An object containing one or more of the following options:

### `src`

Pointing to a video file. Must be an absolute file path.

### `ffmpegExecutable?`

_string - optional_

An absolute path overriding the `ffmpeg` executable to use.

### `ffprobeExecutable?`

_string, options_

An absolute path overriding the `ffprobe` executable to use.

## Return value

Returns a promise which resolves to an object with the following parameters:

- `canExtractFramesFast`: _boolean_ Whether it will be fast to extract a frame from a video.
- `shouldReencode`: _boolean_ Whether the video can be re-encoded to make the render faster.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/renderer/src/can-extract-frames-fast.ts)
