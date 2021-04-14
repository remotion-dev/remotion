---
title: <Video />
id: video
---

This component allows you to include a video file in your Remotion project. While in the preview, the video will just play in a HTML5 `<video>` tag, during render, the exact frame needed will be extracted.

## API / Example

Use an import or require to load an video file and pass it as the `src` prop. All the props that the native `<video>` element accepts (except `autoplay` and `controls`) will be forwarded (but of course not all are useful for Remotion). This means you can use all CSS to style the video.

`<Video>` also accepts a `volume` prop which allows you to control the volume for the whole track or change it on a per-frame basis. Refer to the [using audio](/docs/using-audio#controlling-volume) guide to learn how to use it.

`<Video>` has two more helper props: `startFrom` and `endAt` to define when the video should start and end. Both are optional and do not get forwarded to the native `<video>` element but tell Remotion which portion of the video to use.

```tsx
import {Video} from 'remotion';
import video from './video.webm';

export const MyVideo = () => {
  return (
    <div>
      <div>Hello World!</div>
      <Video
        src={video}
        startFrom={59} // if video is 30fps, then it will start at 2s
        endAt={120} // if video is 30fps, then it will end at 4s
        style={{height: 1080 / 2, width: 1920 / 2}}
      />
    </div>
  )
}
```

## Codec support

Pay attention to the codec of the video that you are importing. During the render process, Chrome needs to support playing the video that you are embedding. If Remotion cannot find a preinstalled version of Chrome, it will download a Chromium executable which does not support the playback of H264 (common codec for MP4 videos). To work around this problem, you have multiple options:

- Tell Remotion which path for Chrome to use by using the command line flag `--browser-executable` or [configure](/docs/config#setbrowserexecutable) `Config.Puppeteer.setBrowserExecutable()` in a config file.
- Convert your videos to WebM before embedding them.

Prior to Remotion 1.5, Remotion will always use an internal Puppeteer binary and MP4 videos are therefore not supported.

If you would like Remotion to warn you when you import an MP4 video, you can turn on the `@remotion/no-mp4-import` ESLint rule.

## See also

- [`<Audio />`](/docs/audio)
