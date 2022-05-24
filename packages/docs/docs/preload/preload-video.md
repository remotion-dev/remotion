---
id: preload-video
slug: preload-video
sidebar_label: preloadVideo()
title: "preloadVideo()"
---

_This function is part of the [`@remotion/preload`](/docs/preload) package._

This function preloads a video in the DOM so that when a video tag is mounted, it can play immediately.

While preload is not necessary for rendering, it can help with seamless playback in the [`<Player />`](/docs/player) and in the preview.

## Usage

```tsx twoslash
import { preloadVideo } from "@remotion/preload";

const unpreload = preloadVideo(
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
);

// If you want to un-preload the video later
unpreload();
```

## How it works

- On Firefox, it appends a `<link rel="preload" as="video">` tag in the head element of the document.
- In other browsers, it appends a `<video preload="auto">` tag in the body element of the document.

## See also

- [Source code for this function](`https://github.com/remotion-dev/remotion/blob/main/packages/preload/src/preload-video.ts`)
