---
name: ffmpeg
description: Using FFmpeg and FFprobe in Remotion
metadata:
  tags: ffmpeg, ffprobe, video, audio, trimming, re-encoding
---

## Installation

You do **not** need to install FFmpeg manually. Since Remotion v4.0, FFmpeg is bundled with Remotion.

❌ **Don't** instruct users to install FFmpeg or use the system `ffmpeg` command.
✅ **Do** use the `bunx remotion ffmpeg` or `bunx remotion ffprobe` commands which use the bundled binaries (v7.1 release line).

Supported codecs: H.264, H.265, VP8, VP9, and ProRes.

## Usage

Run FFmpeg and FFprobe commands using the Remotion CLI:

```bash
bunx remotion ffmpeg -i input.mp4 output.mp3
bunx remotion ffprobe input.mp4
```

## Trimming Videos

### Avoid Stream Copy (`-c copy`) for Exact Cuts

❌ **Avoid** using `-c copy` when trimming videos unless you are sure the cut points are on keyframes.
It causes **frozen frames** at the start of the video if the cut is not on a keyframe.

```bash
# This often causes frozen frames at the beginning!
bunx remotion ffmpeg -ss 00:00:05 -i input.mp4 -to 00:00:10 -c copy output.mp4
```

### Preferred: Re-encode (Safe Default)

✅ **Recommend** re-encoding for accurate trimming without frozen frames.

```bash
# Re-encodes from the exact frame
bunx remotion ffmpeg -ss 00:00:05 -i input.mp4 -to 00:00:10 -c:v libx264 -c:a aac output.mp4
```

### Advanced: Keyframe-based Cutting

Only use `-c copy` if you are using `-f segment` or if the user explicitly understands the keyframe limitations.

```bash
# Split at keyframes (no frozen frames, but cut points depend on GOP structure)
bunx remotion ffmpeg -i input.mp4 -f segment -reset_timestamps 1 -segment_time 10 -c copy out%03d.mp4
```
