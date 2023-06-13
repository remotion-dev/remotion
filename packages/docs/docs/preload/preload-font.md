---
image: /generated/articles-docs-preload-preload-font.png
id: preload-font
slug: preload-font
title: "preloadFont()"
crumb: "@remotion/preload"
---

_This function is part of the [`@remotion/preload`](/docs/preload) package._

This function preloads a font so that when an [`<Img>`](/docs/img) tag is mounted, it can display immediately.

While preload is not necessary for rendering, it can help with seamless playback in the [`<Player />`](/docs/player) and in the Studio.

An alternative to `preloadFont()` is the [`prefetch()`](/docs/prefetch) API. See [`@remotion/preload` vs `prefetch()`](/docs/player/preloading#remotionpreload-vs-prefetch) to decide which one is better for your usecase.

## Usage

```tsx twoslash
import { preloadFont } from "@remotion/preload";

const unpreload = preloadFont(
  "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmYUtfBxc4AMP6lbBP.woff2"
);

// If you want to un-preload the font later
unpreload();
```

## How it works

A `<link rel="preload" as="font">` tag gets added to the head element of the document.

## Handle redirects

If the font URL redirects to another URL, preloading the original URL does not work.

If the URL you include is unknown, use [`resolveRedirect()`](/docs/preload/resolve-redirect) to programmatically obtain the final URL following potential redirects.

If the resource does not support CORS, `resolveRedirect()` will fail. If the resource redirects, and does not support CORS, you cannot preload the asset.

This snippet tries to preload a font on a best-effort basis. If the redirect cannot be resolved, it tries to preload the original URL.

```tsx twoslash
import { preloadFont, resolveRedirect } from "@remotion/preload";

// This code gets executed immediately once the page loads
let urlToLoad =
  "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmYUtfBxc4AMP6lbBP.woff2";

resolveRedirect(urlToLoad)
  .then((resolved) => {
    // Was able to resolve a redirect, setting this as the font to load
    urlToLoad = resolved;
  })
  .catch((err) => {
    // Was unable to resolve redirect e.g. due to no CORS support
    console.log("Could not resolve redirect", err);
  })
  .finally(() => {
    // In either case, we try to preload the original or resolved URL
    preloadFont(urlToLoad);
  });

// This code only executes once the component gets mounted
const MyComp: React.FC = () => {
  // If the component did not mount immediately, this will be the resolved URL.

  // If the component mounted immediately, this will be the original URL.
  // In that case preloading is ineffective anyway.
  return <div style={{ fontFamily: "Roboto" }}></div>;
};
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/preload/src/preload-font.ts)
