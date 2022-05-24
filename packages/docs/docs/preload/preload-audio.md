---
id: preload-audio
slug: preload-audio
title: "preloadAudio()"
---

_This function is part of the [`@remotion/preload`](/docs/preload) package._

This function preloads audio in the DOM so that when a audio tag is mounted, it can play immediately.

While preload is not necessary for rendering, it can help with seamless playback in the [`<Player />`](/docs/player) and in the preview.

## Usage

```tsx twoslash
import { preloadAudio } from "@remotion/preload";

const unpreload = preloadAudio(
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
);

// If you want to un-preload the audio later
unpreload();
```

## How it works

- On Firefox, it appends a `<link rel="preload" as="audio">` tag in the head element of the document.
- In other browsers, it appends a `<audio preload="auto">` tag in the body element of the document.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/preload/src/preload-audio.ts)
