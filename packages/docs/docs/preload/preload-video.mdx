---
image: /generated/articles-docs-preload-preload-video.png
id: preload-video
slug: preload-video
sidebar_label: preloadVideo()
title: "preloadVideo()"
crumb: "@remotion/player"
---

_This function is part of the [`@remotion/preload`](/docs/preload) package._

This function preloads a video in the DOM so that when a video tag is mounted, it can play immediately.

While preload is not necessary for rendering, it can help with seamless playback in the [`<Player />`](/docs/player) and in the Studio.

An alternative to `preloadVideo()` is the [`prefetch()`](/docs/prefetch) API. See [`@remotion/preload` vs `prefetch()`](/docs/player/preloading#remotionpreload-vs-prefetch) to decide which one is better for your usecase.

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

## Handle redirects

If the video URL redirects to another URL, preloading the original URL does not work.

If the URL you include is unknown, use [`resolveRedirect()`](/docs/preload/resolve-redirect) to programmatically obtain the final URL following potential redirects.

If the resource does not support CORS, `resolveRedirect()` will fail. If the resource redirects, and does not support CORS, you cannot preload the asset.

This snippet tries to preload a video on a best-effort basis. If the redirect cannot be resolved, it tries to preload the original URL.

```tsx twoslash
import { preloadVideo, resolveRedirect } from "@remotion/preload";
import { Video } from "remotion";

// This code gets executed immediately once the page loads
let urlToLoad =
  "https://player.vimeo.com/external/291648067.hd.mp4?s=94998971682c6a3267e4cbd19d16a7b6c720f345&profile_id=175&oauth2_token_id=57447761";

resolveRedirect(urlToLoad)
  .then((resolved) => {
    // Was able to resolve a redirect, setting this as the video to load
    urlToLoad = resolved;
  })
  .catch((err) => {
    // Was unable to resolve redirect e.g. due to no CORS support
    console.log("Could not resolve redirect", err);
  })
  .finally(() => {
    // In either case, we try to preload the original or resolved URL
    preloadVideo(urlToLoad);
  });

// This code only executes once the component gets mounted
const MyComp: React.FC = () => {
  // If the component did not mount immediately, this will be the resolved URL.

  // If the component mounted immediately, this will be the original URL.
  // In that case preloading is ineffective anyway.
  return <Video src={urlToLoad}></Video>;
};
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/preload/src/preload-video.ts)
- [`resolveRedirect()`](/docs/preload/resolve-redirect)
