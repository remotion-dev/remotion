---
title: <Video />
id: video
---

This component allows you to include a video file in your Remtotion project. While in the preview, the video will just play in a HTML5 `<video>` tag, during render, the exact frame needed will be extracted.

:::warning
Please note that while H.264 video (the codec of MP4 videos) will show up during Preview, it will not work during render. This is because Puppeteer with Chromium is used during rendering, which does not ship with H.264 codecs. Convert your videos to a Chromium compatible format such as WebM instead.
:::

:::warning
Videos with audio are not supported - audio will be muted in the final render.
:::

## API / Example

Use an import to require or load an audio file and pass it as the `src` prop. All the props that the native `<video>` element accepts (except `autoplay` and `controls`) will be forwarded (but of course not all are useful for Remotion). This means you can use all CSS to style the video.

```tsx
import {Video} from 'remotion';

export const MyVideo = () => {
  const video = require('./video.webm');

  return (
    <div>
      <div>Hello World!</div>
      <Video
        src={video}
        style={{height: 1080 / 2, width: 1920 / 2}}
      />
    </div>
  )
}
```

## See also

- [`<Audio />`](audio)
