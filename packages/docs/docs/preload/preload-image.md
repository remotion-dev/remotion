---
image: /generated/articles-docs-preload-preload-image.png
id: preload-image
slug: preload-image
title: "preloadImage()"
crumb: "@remotion/preload"
---

_This function is part of the [`@remotion/preload`](/docs/preload) package._

This function preloads an image so that when an [`<Img>`](/docs/img) tag is mounted, it can display immediately.

While preload is not necessary for rendering, it can help with seamless playback in the [`<Player />`](/docs/player) and in the Studio.

An alternative to `preloadImage()` is the [`prefetch()`](/docs/prefetch) API. See [`@remotion/preload` vs `prefetch()`](/docs/player/preloading#remotionpreload-vs-prefetch) to decide which one is better for your usecase.

## Usage

```tsx twoslash
import { preloadImage } from "@remotion/preload";

const unpreload = preloadImage(
  "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
);

// If you want to un-preload the image later
unpreload();
```

## How it works

A `<link rel="preload" as="image">` tag gets added to the head element of the document.

## Handle redirects

If the image URL redirects to another URL, preloading the original URL does not work.

If the URL you include is unknown, use [`resolveRedirect()`](/docs/preload/resolve-redirect) to programmatically obtain the final URL following potential redirects.

If the resource does not support CORS, `resolveRedirect()` will fail. If the resource redirects, and does not support CORS, you cannot preload the asset.

This snippet tries to preload a image on a best-effort basis. If the redirect cannot be resolved, it tries to preload the original URL.

```tsx twoslash
import { preloadImage, resolveRedirect } from "@remotion/preload";
import { Img } from "remotion";

// This code gets executed immediately once the page loads
let urlToLoad =
  "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80";

resolveRedirect(urlToLoad)
  .then((resolved) => {
    // Was able to resolve a redirect, setting this as the image to load
    urlToLoad = resolved;
  })
  .catch((err) => {
    // Was unable to resolve redirect e.g. due to no CORS support
    console.log("Could not resolve redirect", err);
  })
  .finally(() => {
    // In either case, we try to preload the original or resolved URL
    preloadImage(urlToLoad);
  });

// This code only executes once the component gets mounted
const MyComp: React.FC = () => {
  // If the component did not mount immediately, this will be the resolved URL.

  // If the component mounted immediately, this will be the original URL.
  // In that case preloading is ineffective anyway.
  return <Img src={urlToLoad}></Img>;
};
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/preload/src/preload-image.ts)
