---
image: /generated/articles-docs-get-image-dimensions.png
title: getImageDimensions()
id: get-image-dimensions
crumb: "@remotion/media-utils"
---

_Part of the `@remotion/media-utils` package of helper functions.Available from v4.0.143._

Takes an image `src`, retrieves the dimensions of an image.

:::info
To avoid [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) problems, ensure that you have the proper permissions to access the image and that the image server is configured with appropriate CORS headers to allow requests from your domain.
:::

## Arguments

### `src`

A string that specifies the URL or path of the image.

## Return value

_`Promise<ImageDimensions>`_

An object with information about the image dimensions:

### `width`

_number_

The image width, in pixels (px).

### `height`

_number_

The image height, in pixels (px).

## Example

```ts twoslash
// @module: ESNext
// @target: ESNext
import { getImageDimensions } from "@remotion/media-utils";

await getImageDimensions("https://example.com/remote-image.png");
/* {
  width: 100,
  height: 100
} */

```

## Caching behavior

This function is memoizing the results it returns.

If you pass in the same argument to `src` multiple times, it will return a cached version from the second time on, regardless of if the file has changed.  
To clear the cache, you have to reload the page.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/media-utils/src/get-image-dimensions.ts)
- [Preload image](/docs/preload/preload-image)
- [`<Img />`](/docs/img)
- [`getAudioData()`](/docs/get-audio-data)
