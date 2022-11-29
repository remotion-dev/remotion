---
id: media-playback-error
title: "Could not play video/audio with src"
sidebar_label: Media playback error
crumb: "Troubleshooting"
---

The following error may occur in your Remotion project during development or while rendering:

```diff
- Error: Could not play video with src [source] [object MediaError]
```

or

```diff
- Error: Could not play audio with src [source] [object MediaError]
```

This error happens when you are trying to embed a `<Video/>` or `<Audio/>` tag in your Remotion project but the browser is unable to load and play the media. Although the browser does not report the exact error, there are two common reasons for this error.

## Codec not supported by Chromium

Unlike Google Chrome, the Chromium Browser does not include proprietary codecs. This means you cannot play MP4/H.264 videos and some audio codecs (more codecs may not be supported).

**Workaround**: Convert videos to WebM, [use Chrome instead of Chromium](/docs/config#setbrowserexecutable), or use [`<OffthreadVideo>`](/docs/offthreadvideo).

## Invalid source

Make sure you are trying to load a video that is either available locally or publicly on the internet. Open the DevTools, go to the Network tab, track the asset being loaded, and open it in a new tab. Does it actually start playing?

## Wrong headers or status code

In order for the browser being able to play the media, it should be loaded with:

- a 200 status code
- a suitable `Content-Type` header
- A `Content-Range` header in order to support seeking.

Open the DevTools and go to the network tab to validate that this is the case.

## Internet Download Manager

[Internet Download Manager](https://www.internetdownloadmanager.com/) is known to manipulate the network traffic causing problems for the browser to load media. Disable it if you have it.

## Other unsupported codecs

You might be importing a video that is not compatible with Chrome at all, e.g. FLV.

## See also

- [Codec support](/docs/config#setbrowserexecutable)
