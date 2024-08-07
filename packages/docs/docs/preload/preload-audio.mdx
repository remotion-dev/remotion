---
image: /generated/articles-docs-preload-preload-audio.png
id: preload-audio
slug: preload-audio
title: "preloadAudio()"
crumb: "@remotion/preload"
---

_This function is part of the [`@remotion/preload`](/docs/preload) package._

This function preloads audio in the DOM so that when a audio tag is mounted, it can play immediately.

While preload is not necessary for rendering, it can help with seamless playback in the [`<Player />`](/docs/player) and in the Studio.

An alternative to `preloadAudio()` is the [`prefetch()`](/docs/prefetch) API. See [`@remotion/preload` vs `prefetch()`](/docs/player/preloading#remotionpreload-vs-prefetch) to decide which one is better for your usecase.

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

## Handle redirects

If the audio URL redirects to another URL, preloading the original URL does not work.

If the URL you include is unknown, use [`resolveRedirect()`](/docs/preload/resolve-redirect) to programmatically obtain the final URL following potential redirects.

If the resource does not support CORS, `resolveRedirect()` will fail. If the resource redirects, and does not support CORS, you cannot preload the asset.

This snippet tries to preload a audio on a best-effort basis. If the redirect cannot be resolved, it tries to preload the original URL.

```tsx twoslash
import { preloadAudio, resolveRedirect } from "@remotion/preload";
import { Audio } from "remotion";

// This code gets executed immediately once the page loads
let urlToLoad = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

resolveRedirect(urlToLoad)
  .then((resolved) => {
    // Was able to resolve a redirect, setting this as the audio to load
    urlToLoad = resolved;
  })
  .catch((err) => {
    // Was unable to resolve redirect e.g. due to no CORS support
    console.log("Could not resolve redirect", err);
  })
  .finally(() => {
    // In either case, we try to preload the original or resolved URL
    preloadAudio(urlToLoad);
  });

// This code only executes once the component gets mounted
const MyComp: React.FC = () => {
  // If the component did not mount immediately, this will be the resolved URL.

  // If the component mounted immediately, this will be the original URL.
  // In that case preloading is ineffective anyway.
  return <Audio src={urlToLoad}></Audio>;
};
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/preload/src/preload-audio.ts)
