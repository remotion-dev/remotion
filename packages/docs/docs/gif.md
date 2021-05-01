---
id: gif
sidebar_label: API - @remotion/gif
title: "@remotion/gif"
---

You can install this package from NPM to get a component for displaying GIFs that synchronize with Remotions [`useCurrentFrame()`](use-current-frame).

```console
npm i @remotion/gif
```

## Props

### `src`

_required_

The source of the GIF. Can be an URL or a local image - see [Importing assets](assets).

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

- `loaded`: Will be always `true`.
- `width`: Width of the GIF file in pixels.
- `height`: Height of the GIF file in pixels.
- `delays`: Array of timestamps of type `number` containing position of each frame.
- `frames`: Array of frames of type [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)

### `style`

Allows to pass in custom CSS styles.

## Example

```tsx
import {Gif} from '@remotion/gif';

export const MyComponent: React.FC = () => {
  const {width, height} = useVideoConfig();

  return (
    <Gif
      src="https://media.giphy.com/media/3o72F7YT6s0EMFI0Za/giphy.gif"
      width={width}
      height={height}
      fit="fill"
    />
  )
}
```
