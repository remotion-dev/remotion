---
title: <Video>
id: video
---

This component allows you to include a video file in your Remotion project. It wraps the native [`HTMLVideoElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement).

## API / Example

Use an `import` or `require()` statement, a URL, or [`staticFile()`](/docs/staticfile) to load a video and pass it as the `src` prop.

All the props that the native `<video>` element accepts (except `autoplay` and `controls`) will be forwarded (but of course not all are useful for Remotion). This means you can use all CSS to style the video.

```tsx twoslash
import { AbsoluteFill, Video } from "remotion";
import video from "./video.webm";

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Video src={video} />
    </AbsoluteFill>
  );
};
```

## Remote video

You can load a video from an URL as well:

```tsx twoslash
import { AbsoluteFill, Video } from "remotion";
// ---cut---
export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Video src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
    </AbsoluteFill>
  );
};
```

:::note
During render, Remotion will download the video to include its audio in the output. If you don't need the audio, you can add the `muted` prop.
:::

## Trim video

Use `startFrom` and `endAt` to define when the video should start and end. Both are optional and do not get forwarded to the native `<video>` element but tell Remotion which portion of the video to use.

```tsx twoslash
import { AbsoluteFill, Video } from "remotion";
import video from "./video.webm";

// ---cut---
export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Video
        src={video}
        startFrom={59} // If the video is 30fps, then it will start at 2s
        endAt={120} // If the video is 30fps, then it will end at 4s
      />
    </AbsoluteFill>
  );
};
```

## Style video

You can pass any style you can pass to a native `<video>` element. This is how you set it's size for example:

```tsx twoslash
import { AbsoluteFill, Video } from "remotion";
import video from "./video.webm";

// ---cut---
export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Video src={video} style={{ height: 720, width: 1280 }} />
    </AbsoluteFill>
  );
};
```

## Codec support

Pay attention to the codec of the video that you are importing. During the render process, Chrome needs to support playing the video that you are embedding. If Remotion cannot find a preinstalled version of Chrome, it will download a Chromium executable which does not support the playback of H264 (common codec for MP4 videos). To work around this problem, you have multiple options:

- Tell Remotion which path for Chrome to use by using the command line flag `--browser-executable` or [configure](/docs/config#setbrowserexecutable) `Config.Puppeteer.setBrowserExecutable()` in a config file.
- Convert your videos to WebM before embedding them.

Prior to Remotion 1.5, Remotion will always use an internal Puppeteer binary and MP4 videos are therefore not supported.

If you would like Remotion to warn you when you import an MP4 video, you can turn on the `@remotion/no-mp4-import` ESLint rule.

## Controlling volume

`<Video>` accepts a `volume` prop which allows you to control the volume for the whole track or change it on a per-frame basis. Refer to the [using audio](/docs/using-audio#controlling-volume) guide to learn how to use it.

```tsx twoslash title="Example using static volume"
import { AbsoluteFill, Video } from "remotion";
import video from "./video.webm";

// ---cut---
export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Video volume={0.5} src={video} />
    </AbsoluteFill>
  );
};
```

```tsx twoslash title="Example of a fade in over 100 frames"
import { AbsoluteFill, interpolate, Video } from "remotion";
import video from "./video.webm";

// ---cut---
export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Video
        volume={(f) =>
          interpolate(f, [0, 100], [0, 1], { extrapolateLeft: "clamp" })
        }
        src={video}
      />
    </AbsoluteFill>
  );
};
```

## Controlling playback speed

_Available from v2.2_

You can use the `playbackRate` prop to control the speed of the video. `1` is the default and means regular speed, `0.5` slows down the video so it's twice as long and `2` speeds up the video so it's twice as fast.

While Remotion doesn't limit the range of possible playback speeds, in development mode the [`HTMLMediaElement.playbackRate`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate) API is used which throws errors on extreme values. At the time of writing, Google Chrome throws an exception if the playback rate is below `0.0625` or above `16`.

```tsx twoslash title="Example of a video playing twice as fast"
import { AbsoluteFill, interpolate, Video } from "remotion";
import video from "./video.webm";

// ---cut---
export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Video playbackRate={2} src={video} />
    </AbsoluteFill>
  );
};
```

## Alternative: `<OffthreadVideo>`

[`<OffthreadVideo>`](/docs/offthreadvideo) is a drop-in alternative to `<Video>`. To decide which tag to use, see: [`<Video>` vs `<OffthreadVideo>`](/docs/video-vs-offthreadvideo)

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/video/Video.tsx)
- [`<Audio />`](/docs/audio)
- [`<OffthreadVideo />`](/docs/offthreadvideo)
- [`<Video>` vs `<OffthreadVideo>`](/docs/video-vs-offthreadvideo)
