---
image: /generated/articles-docs-hdr.png
title: High Dynamic Range and Remotion
sidebar_label: HDR
id: hdr
crumb: 'How to deal with HDR'
---

High Dynamic Range (HDR) is a feature that allows for a wider range of colors and brightnesses than standard dynamic range (SDR).

Remotion uses a headless Chrome browser to render, which does not support HDR.  
Frames are always rendered in sRGB, which is standard dynamic range.

## Embedding HDR videos

If a HDR video is embedded in your composition, it must be converted to SDR. This is a process which is inherently lossy and a slight color lost is unavoidable.

### In `<Video />` and `<Html5Video />`

In [`<Video />`](/docs/media/video) and [`<Html5Video />`](/docs/html5-video), color conversion is handled by the browser.  
However, the `--gl` flag is relevant and may influence the colors.

Tip: **Setting the `--gl=angle` will result in much better colors when embedding an HDR video (tested on macOS).**  
We have not yet experimented with this enough to give a recommendation on which `--gl` flag to use.  
The Remotion team is keen to hear your experiences.

### In `<OffthreadVideo />`

By default, color conversion is applied automatically to HDR videos.  
Remotion tries to use FFmpeg and the `zscale` library to preserve the colors as well as possible when converting the video to SDR.

There is no configuration, but it is possible to disable this feature:

```tsx twoslash title="Disabling color conversion"
import {OffthreadVideo} from 'remotion';

export const MyComp = () => {
  return <OffthreadVideo src="https://example.com/hdr.mp4" toneMapped={false} />;
};
```

## Outputting HDR videos

Because all frames are rendered in SDR, **it doesn't make sense to output an HDR video with Remotion.**

It is better to accept the loss and output an SDR video, rather than trying to convert the frames to HDR again, which would lead to more loss.

That being said, there is an option [`--color-space`](/docs/lambda/cli/render#--color-space) which can be set to `bt2020-ncl` or `bt2020-cl` to output an HDR video.  
**This was a mistake and is not recommended.**  
This option will lead to the video being tagged as being HDR, but the content inside the video is not actually HDR. You will experience the picture to be overly bright and overexposed.
