---
image: /generated/articles-docs-get-video-metadata.png
title: getVideoMetadata()
id: get-video-metadata
crumb: "@remotion/media-utils"
---

_Part of the `@remotion/media-utils` package of helper functions._

Takes a `src` to a video, loads it and returns metadata for the specified source.

## Arguments

### `src`

A string pointing to an asset.

## Return value

`Promise<VideoMetadata>` - object with information about the video data:

- `durationInSeconds`: `number` The duration of the video in seconds.
- `width`: `number` The width of the video in pixels.
- `height`: `number` The height of the video in pixels.
- `aspectRatio`: `number` Video width divided by video height.
- `isRemote`: `boolean` Whether the video was imported locally or from a different origin.

## Example

```tsx twoslash
// @module: ESNext
// @target: ESNext
import { Audio } from "remotion";
// ---cut---
import { getVideoMetadata } from "@remotion/media-utils";
import video from "../video.mp4";

await getVideoMetadata(video); /* {
  durationInSeconds: 100.00,
  width: 1280,
  height: 720,
  aspectRatio: 1.77777778,
  isRemote: false
} */
await getVideoMetadata("https://example.com/remote-audio.webm"); /* {
  durationInSeconds: 40.213,
  width: 1920,
  height: 1080,
  aspectRatio: 1.77777778,
  isRemote: true
} */
```

## Caching behavior

This function is memoizing the results it returns.
If you pass in the same argument to `src` multiple times, it will return a cached version from the second time on, regardless of if the file has changed. To clear the cache, you have to reload the page.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/media-utils/src/get-video-metadata.ts)
- [Using videos](/docs/assets#using-videos)
- [`<Video/>`](/docs/video)
