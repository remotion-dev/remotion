---
image: /generated/articles-docs-miscellaneous-cross-origin-isolation.png
title: 'Cross-Origin Isolation'
sidebar_label: 'Cross-Origin Isolation'
id: cross-origin-isolation
crumb: 'Miscellaneous'
---

A website can either be cross-origin-isolated or not.

## How cross-origin isolation affects pages

Enabling cross-origin isolation is required for some web features. For example, the [SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) API, which is required for the [`@remotion/whisper-web`](/docs/whisper-web) package to work, is only available in cross-origin isolated pages.

Cross-origin isolation will put some restrictions on the page as well.  
For example, HTML5 tags like `<video>` and `<audio>` that load media from a different origin will not work unless they have the `crossorigin="anonymous"` attribute.  
If those assets then do not support CORS, they will not load at all.

This also affects the following Remotion tags: [`<Html5Video>`](/docs/html5-video), [`<Html5Audio>`](/docs/html5-audio), [`<OffthreadVideo>`](/docs/offthreadvideo), [`<Img>`](/docs/img).

## Enabling cross-origin isolation

Cross-origin isolation is disabled by default.

### On your server

To enable cross-origin isolation on your page, the server must send the following HTTP headers:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

See also:

- [Enabling Cross-origin isolation in Next.js](https://vercel.com/guides/fix-shared-array-buffer-not-defined-nextjs-react#enable-cross-origin-isolation)

### In the Remotion Studio

**In the config file**: To enable it, you can use the [`setEnableCrossSiteIsolation()`](/docs/config#setenablecrosssiteisolation) function in your `remotion.config.ts` file.

**Via CLI flag**: You can also enable it by passing the `--cross-site-isolation` flag to the Remotion CLI.

## Checking if a page is cross-origin isolated

You can check if a page is cross-origin isolated by calling the `window.crossOriginIsolated` property.

```ts
window.crossOriginIsolated; // true
```
