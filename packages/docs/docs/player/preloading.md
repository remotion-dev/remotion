---
sidebar_label: "Preloading"
title: "Preloading assets"
---

By default, assets such as videos, audio, or images will only be loaded as they enter the video. You can preload those assets beforehand to make them play immediately once they enter the video.

## Preloading videos using `@remotion/preload`

For videos, you can use the [`preloadVideo()`](/docs/preload/preload-video) API. Put this outside a component (or inside an `useEffect`):

```tsx twoslash
import { preloadVideo } from "@remotion/preload";

const unpreload = preloadVideo("https://example.com/video.mp4");

// Later, you can optionally clean up the preload
unpreload();
```

## Preloading audio using `@remotion/preload`

For audio, you can use the [`preloadAudio()`](/docs/preload/preload-audio) API. Put this outside a component (or inside an `useEffect`):

```tsx twoslash
import { preloadAudio } from "@remotion/preload";

const unpreload = preloadAudio(
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
);

// Later, you can optionally clean up the preload
unpreload();
```
