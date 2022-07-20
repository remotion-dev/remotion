---
id: media-playback-error
title: "Could not play video/audio with src"
sidebar_label: Media playback error
---

The following error may occur in your Remotion project during development or while rendering:

```diff
- Error: Could not play video with src [source]
```

or

```diff
- Error: Could not play audio with src [source]
```

This error happens when you are trying to embed a `<Video/>` or `<Audio/>` tag in your Remotion project but the browser is unable to load and play the media. Although the browser does not report the exact error, there are two common reasons for this error.

## Codec not supported by Chromium

Unlike Google Chrome, the Chromium Browser does not include proprietary codecs. This means you cannot play MP4/H.264 videos and some audio codecs (more codecs may not be supported).

**Workaround**: Convert videos to WebM or [use Chrome instead of Chromium](/docs/config#setbrowserexecutable).

## Invalid source

Make sure you are trying to load a video that is either available locally or publicly on the internet. Typing the `src` prop will lead to this error.

## Other unsupported codecs

You might be importing a video that is not compatible with Chrome at all, e.g. FLV.

## See also

- [Codec support](/docs/config#setbrowserexecutable)
