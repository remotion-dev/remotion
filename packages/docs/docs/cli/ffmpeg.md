---
image: /generated/articles-docs-cli-ffmpeg.png
id: ffmpeg
title: npx remotion ffmpeg
crumb: "@remotion/cli"
sidebar_label: "ffmpeg"
---

_available since v4.0_

In order to use FFmpeg tools without having to directly install it, Remotion provides a part of FFmpegs toolkit via `npx remotion ffmpeg`

Note that in order to keep the binary size small, we only support the most commonly used codecs, namely h264, h265, vp8, vp9 and prores videos. FFmpeg 6.0 is used.

# Example

Convert a video file to an audio file

```bash
npx remotion ffmpeg -i input.mp4 output.mp3
```

To find out more about FFmpeg, visit their [docs](https://ffmpeg.org/documentation.html).

## See also

- [`npx remotion ffprobe`](/docs/cli/ffprobe)
