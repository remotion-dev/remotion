---
name: metadata
description: Getting video duration, dimensions, and frame rate with Mediabunny
metadata:
  tags: metadata, duration, width, height, fps, video, audio
---

# Getting video metadata with Mediabunny

Mediabunny can extract metadata from video and audio files including duration, dimensions, and frame rate. It works in browser, Node.js, and Bun environments without DOM manipulation.

## Getting metadata

```tsx
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

export const getMediaMetadata = async (src: string) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, {
      getRetryDelay: () => null,
    }),
  });

  const durationInSeconds = await input.computeDuration();
  const videoTrack = await input.getPrimaryVideoTrack();
  const dimensions = videoTrack
    ? {
        width: videoTrack.displayWidth,
        height: videoTrack.displayHeight,
      }
    : null;
  const packetStats = await videoTrack?.computePacketStats(50);
  const fps = packetStats?.averagePacketRate ?? null;

  return {
    durationInSeconds,
    dimensions,
    fps,
  };
};
```

## Usage

```tsx
const metadata = await getMediaMetadata("https://remotion.media/video.mp4");

console.log(metadata.durationInSeconds); // e.g. 10.5
console.log(metadata.dimensions);        // e.g. { width: 1920, height: 1080 }
console.log(metadata.fps);               // e.g. 30
```

## Return value

- `durationInSeconds`: Duration of the media in seconds
- `dimensions`: Object with `width` and `height` (null for audio-only files)
- `fps`: Frame rate (null for audio-only files)

## Using with local files

For local files, use `FileSource` instead of `UrlSource`:

```tsx
import { Input, ALL_FORMATS, FileSource } from "mediabunny";

const input = new Input({
  formats: ALL_FORMATS,
  source: new FileSource(file), // File object from input or drag-drop
});
```

## Using with staticFile in Remotion

```tsx
import { staticFile } from "remotion";

const metadata = await getMediaMetadata(staticFile("video.mp4"));
```
