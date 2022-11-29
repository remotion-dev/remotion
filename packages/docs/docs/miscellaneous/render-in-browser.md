---
image: /generated/articles-docs-miscellaneous-render-in-browser.png
sidebar_label: Browser rendering
title: Can I render videos in the browser?
crumb: "FAQ"
---

**Rendering videos in the browser is not supported.** In order to render videos, you need to hook up [server-side rendering](/docs/ssr), [Remotion Lambda](/docs/lambda), or [render videos locally](/docs/render).

## Will it be supported in the future?

It is unlikely, because there is currently no browser API that allows to capture the viewport.  
If such an API gets introduced, we can consider supporting this feature in the future.

## Why not...

### a Chrome extension?

Chrome extensions do get the privilege of capturing the viewport. We may explore this in the future, but the combination of asking the user to install an extension and slow render times means we are not prioritizing this feature.

### [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)?

It is an excellent project that allows us to encode videos in the browser, which may be part of a solution, but we can still not capture the viewport of the browser.

### [`canvas.getImageData()`](https://developer.mozilla.org/de/docs/Web/API/CanvasRenderingContext2D/getImageData)?

It allows to capture the pixels from a canvas, however Remotion videos can be written with any web technology including HTML and SVG. Canvas elements are just a subset of what's supported in Remotion.

### [`html2canvas`](https://html2canvas.hertzen.com/)?

It implements it's own rendering engine which only supports a subset of CSS properties.  
You would only have access to a very limited feature set.

### SVG `<foreignElement>`?

You can render HTML markup inside an SVG `<foreignElement>` and then render that SVG to a canvas and then call [`getImageData()`](https://developer.mozilla.org/de/docs/Web/API/CanvasRenderingContext2D/getImageData) to turn that into an image.

This is the closest thing to browser rendering, however there are problems with `<img>` tags and potentially other technologies as well. It's not yet fully out of the questions, but seems hacky so far.

## How can I avoid server-rendering?

We cannot fully avoid server-rendering, but we are taking initiatives to make it easier and efficient:

- [Remotion Lambda](/lambda) is a batteries-included renderer for Remotion that you only have to pay for when you use it.
- We are rewriting the renderer so it is significantly faster and more resource-efficient, so that less server capabilities are needed.

## See also

- [`<Player>`](/player): Displaying a Remotion video in the browser without encoding it
