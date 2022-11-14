---
title: npx remotion install
sidebar_label: install
---

_available from v3.3_

Ensures that `ffmpeg` or `ffprobe` are installed by downloading them from the internet if they cannot be found.

```bash
npx remotion install ffmpeg
```

```bash
npx remotion install ffprobe
```

You might not need to call this function. Remotion will automatically download `ffmpeg` and `ffprobe` if a render is attempted, and no binary was found.

These commands are useful if you need `ffmpeg` and `ffprobe` to be ready before the first render is started.

## See also

- [Node.JS equivalent: `ensureFfmpeg()`](/docs/renderer/ensure-ffmpeg)
- [Node.JS equivalent: `ensureFfprobe()`](/docs/renderer/ensure-ffprobe)
- [Installing FFmpeg](/docs/ffmpeg)
