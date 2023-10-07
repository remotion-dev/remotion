---
image: /generated/articles-docs-offthreadvideo.png
id: offthreadvideo
title: "<OffthreadVideo>"
crumb: "API"
---

_Available from Remotion 3.0.11_

This component imports and displays a video, similar to [`<Video/>`](/docs/video), but during rendering, extracts the exact frame from the video and displays it in a [`<Img>`](/docs/img) tag. This extraction process happens outside the browser using FFMPEG.

This component was designed to combat limitations of the default `<Video>` element. See: [`<Video>` vs `<OffthreadVideo>`](/docs/video-vs-offthreadvideo).

## Example

```tsx twoslash
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile("video.webm")} />
    </AbsoluteFill>
  );
};
```

You can load a video from an URL as well:

```tsx twoslash
import { AbsoluteFill, OffthreadVideo } from "remotion";
// ---cut---
export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <OffthreadVideo src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
    </AbsoluteFill>
  );
};
```

## Props

The props [`volume`](/docs/video#volume), [`playbackRate`](/docs/video#playbackrate), [`muted`](/docs/video#muted) and [`acceptableTimeShiftInSeconds`](/docs/video#acceptabletimeshiftinseconds) are supported and work the same as in [`<Video>`](/docs/video).

The props [`onError`](/docs/img#onerror), `className` and `style` are supported and get passed to the underlying HTML element. Remember that during render, this is a `<img>` element, and during Preview, this is a `<video>` element.

### `transparent`<AvailableFrom v="4.0.0" />

_optional, boolean_
If set to `true`, frames will be extracted as PNG, enabling transparency but also slowing down your render.

If set to `false`(_default_), frames will be extracted as bitmap (BMP), which is faster.

### ~~`imageFormat` <AvailableFrom v="3.0.22" />~~

_removed in v4.0.0_

Either `jpeg` or `png`. Default `jpeg`.  
With `png`, transparent videos (VP8, VP9, ProRes) can be displayed, however it is around 40% slower, with VP8 videos being [much slower](/docs/slow-method-to-extract-frame).

### `allowAmplificationDuringRender`<AvailableFrom v="3.3.17" />

Make values for [`volume`](/docs/video#volume) greater than `1` result in amplification during renders.  
During Preview, the volume will be limited to `1`, since the browser cannot amplify audio.

### `toneFrequency`<AvailableFrom v="4.0.47"/>

Allows you to adjust the pitch of the audio - will only be applied during rendering. It accepts a number between `0.01` and `2`, where `1` represents the original pitch. Values less than `1` will decrease the pitch, while values greater than `1` will increase it.
For example, a `toneFrequency` of 0.5 would lower the pitch by half, and a `toneFrequency` of `1.5` would increase the pitch by 50%.
`toneFrequency` should be a positive number between `0.01` (representing the lowest assignable pitch) and `2` (representing the highest assignable pitch). If `toneFrequency` is not specified or null, it defaults to `1`, maintaining the original pitch.

### `onError`

Handle an error playing the video. From v3.3.89, if you pass an `onError` callback, then no exception will be thrown. Previously, the error could not be caught.

## Performance tips

Avoid embedding a video beyond it's end (for example: Rendering a 5 second video inside 10 second composition). To create parity with the `<Video>` element, the video still displays its last frame in that case. However, to fetch the last frame specifically is a significantly more expensive operation than a frame from a known timestamp.

## Looping a video

Unlike [`<Video>`](/docs/video), `OffthreadVideo` does not currently implement the `loop` property. You can use the following snippet that uses [`@remotion/media-utils`](/docs/media-utils/) to loop a video.

```tsx twoslash title="LoopedOffthreadVideo.tsx"
import { getVideoMetadata } from "@remotion/media-utils";
import React, { useEffect, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  Loop,
  OffthreadVideo,
  staticFile,
  useVideoConfig,
} from "remotion";

const src = staticFile("myvideo.mp4");

export const LoopedOffthreadVideo: React.FC = () => {
  const [duration, setDuration] = useState<null | number>(null);
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();

  useEffect(() => {
    getVideoMetadata(src)
      .then(({ durationInSeconds }) => {
        setDuration(durationInSeconds);
        continueRender(handle);
      })
      .catch((err) => {
        cancelRender(handle);
        console.log(err);
      });
  }, [handle]);

  if (duration === null) {
    return null;
  }

  return (
    <Loop durationInFrames={Math.floor(fps * duration)}>
      <OffthreadVideo src={src} />
    </Loop>
  );
};
```

## Supported codecs by `<OffthreadVideo>`

The following codecs can be read by `<OffthreadVideo>`:

- H.264 ("MP4")
- H.265 ("HEVC")
- VP8 and VP9 ("WebM")
- AV1 (from _v4.0.6_)
- ProRes

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/video/OffthreadVideo.tsx)
- [`<Video />`](/docs/video)
- [`<Video>` vs `<OffthreadVideo>`](/docs/video-vs-offthreadvideo)
