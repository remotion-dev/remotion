---
title: getVideoMetadata()
id: get-video-metadata
---

:::warning
This function is part of Remotion 2.0 which is not yet released. The information on this page might not yet accurately reflect the current state of Remotions API.
:::warning

_Part of the `@remotion/media-utils`_ package of helper functions.

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

```tsx
import {getVideoMetadata} from '@remotion/media-utils';
import video from '../video.mp4';

await getVideoMetadata(video); /* {
  durationInSeconds: 100.00,
  width: 1280,
  height: 720,
  aspectRatio: 1.77777778,
  isRemote: false
} */
await getVideoMetadata('https://example.com/remote-audio.webm'); /* {
  durationInSeconds: 40.213,
  width: 1920,
  height: 1080,
  aspectRatio: 1.77777778,
  isRemote: true
} */
```

## See also

- [Using videos](/docs/assets#using-videos)
- [`<Video/>`](/docs/video)
