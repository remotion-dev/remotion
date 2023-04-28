---
image: /generated/articles-docs-cli-ffprobe.png
id: ffprobe
title: ffprobe
crumb: "@remotion/cli"
---

_available since v4.0_

In order to use ffprobe tools without having to directly install it, remotion provides a part of the ffprobe toolkit via `npx remotion ffprobe`

Note that in order to keep the binary size small, we only support the most commonly used codecs, namely h264, h265, vp8, vp9 and prores videos. FFmpeg 6.0 is used.

# Example

```bash
npx remotion ffprobe your_video.mp4
```

To find out more about FFprobe, visit their [docs](https://ffmpeg.org/ffprobe.html).
