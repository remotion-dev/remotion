---
id: offthreadvideo
title: "<OffthreadVideo>"
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

The props [`volume`](/docs/video#volume), [`playbackRate`](/docs/video#playbackrate) and [`muted`](/docs/video#muted) are supported and work the same as in [`<Video>`](/docs/video).

The props [`onError`](/docs/img#onerror), `className` and `style` are supported and get passed to the underlying HTML element. Remember that during render, this is a `<img>` element, and during preview, this is a `<video>` element.

### `imageFormat`

_Available since v3.0.22_

Either `jpeg` or `png`. Default `jpeg`.  
With `png`, transparent videos (VP8, VP9, ProRes) can be displayed, however it is around 40% slower, with VP8 videos being [much slower](/docs/slow-method-to-extract-frame).

## Performance tips

Avoid embedding a video beyond it's end (for example: Rendering a 5 second video inside 10 second composition). To create parity with the `<Video>` element, the video still displays its last frame in that case. However, to fetch the last frame specifically is a significantly more expensive operation than a frame from a known timestamp.

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/video/OffthreadVideo.tsx)
- [`<Video />`](/docs/video)
- [`<Video>` vs `<OffthreadVideo>`](/docs/video-vs-offthreadvideo)
