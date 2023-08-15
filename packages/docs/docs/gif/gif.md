---
image: /generated/articles-docs-gif-gif.png
slug: gif
sidebar_label: "<Gif>"
title: "<Gif>"
crumb: "@remotion/gif"
---

_Part of the [`@remotion/gif`](/docs/gif) package_

Displays a GIF that synchronizes with Remotions [`useCurrentFrame()`](/docs/use-current-frame).

## Props

### `src`

_required_

The source of the GIF. Can be an URL or a local image - see [Importing assets](/docs/assets).

:::note
Remote GIFs need to support [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

<details>
<summary>More info</summary>
<ul>
<li>
Remotion's origin is usually <code>http://localhost:3000</code>, but it may be different if rendering on Lambda or the port is busy.
</li>
<li>
You can <a href="/docs/chromium-flags#--disable-web-security">disable CORS</a> during renders.
</li>
</ul>
</details>
:::

### `width`

The display width.

### `height`

The display height.

### `fit`

Must be one of these values:

- `'fill'`: The GIF will completely fill the container, and will be stretched if necessary. (_default_)
- `'contain'`: The GIF is scaled to fit the box, while aspect ratio is maintained.
- `'cover'`: The GIF completely fills the container and maintains it's aspect ratio. It will be cropped if necessary.

### `onLoad`

Callback that gets called once the GIF has loaded and finished processing. As its only argument, the callback gives the following object:

- `width`: Width of the GIF file in pixels.
- `height`: Height of the GIF file in pixels.
- `delays`: Array of timestamps of type `number` containing position of each frame.
- `frames`: Array of frames of type [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)

### `style`

Allows to pass in custom CSS styles. You may not pass `width` and `height`, instead use the props `width` and `height` to set the size of the GIF.

### `loopBehavior`<AvailableFrom v="3.3.4" />

The looping behavior of the GIF. Can be one of these values:

- `'loop'`: The GIF will loop infinitely. (_default_)
- `'pause-after-finish'`: The GIF will play once and then show the last frame.
- `'unmount-after-finish'`: The GIF will play once and then unmount. Note that if you attach a `ref`, it will become `null` after the GIF has finished playing.

### `ref`<AvailableFrom v="3.3.88" />

You can add a [React ref](https://react.dev/learn/manipulating-the-dom-with-refs) to `<Gif>`. If you use TypeScript, you need to type it with `HTMLCanvasElement`.

## Example

```tsx twoslash
import { useRef } from "react";
import { useVideoConfig } from "remotion";
// ---cut---
import { Gif } from "@remotion/gif";

export const MyComponent: React.FC = () => {
  const { width, height } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);

  return (
    <Gif
      ref={ref}
      src="https://media.giphy.com/media/3o72F7YT6s0EMFI0Za/giphy.gif"
      width={width}
      height={height}
      fit="fill"
    />
  );
};
```

## See also

- [`getGifDurationInSeconds()`](/docs/gif/get-gif-duration-in-seconds)
- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/gif/src/Gif.tsx)
