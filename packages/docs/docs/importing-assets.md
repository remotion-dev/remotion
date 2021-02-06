---
id: assets
title: Importing assets
---

Remotion allows you to include several types of files in your project:

- Images (`.png`, `.svg`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.bmp`)
- Videos (`.webm`, `.mp4`), with constraints
- Audio (`.mp3`, `.wav`, `.aac`), preview only
- [Fonts (`.woff` and `.woff2`) - read the separate page for fonts](fonts)

## Using images

Require images using an `import` statement

```tsx
import logo from './logo.png'

export const MyComp: React.FC = () => {
  return (
    <img src={logo} />
  )
}
```

## Using image sequences

If you have a series of images, for example exported from another program like After Effects or Rotato, you can use a dynamic `require` statement to import the images are they are needed.

```tsx
import {useCurrentFrame} from 'remotion';

/*
  Assuming your file structure is:
  assets/
    frame1.png
    frame2.png
    frame3.png
    ...
*/

const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  const src = require('./assets/frame' + frame + '.png');

  return (
    <img src={src} />
  )
}
```

:::tip
Avoid writing a require statement that requires a file that doesn't exist. If your project throws an error because your composition is longer than than your image sequence, clamp the file name using `Math.min()` or Remotion's `interpolate()`.
:::

## Using videos

Import your files using an import statement. Use the [`<Video />`](video) component to keep the timeline and your video in sync.

```tsx
import {Video} from 'remotion';
import vid from './vid.webm'

export const MyComp: React.FC = () => {
  return (
    <Video src={vid} />
  );
}
```

:::info
Since Puppeteer doesn't include the proprietary codec to read MP4 videos, you must convert your videos to WebM before rendering.
:::

## Using Audio

Import your audio using an `@import` statement and pass it to the [`<Audio/ >`](audio) component.

```tsx
import {Audio} from 'remotion';
import tune from './tune.mp3'

export const MyComp: React.FC = () => {
  return (
    <Audio src={tune} />
  );
}
```

:::info
Audio is experimental and is currently only playing in the preview, not in the final video.
:::

## Using fonts

See the [dedicated page about fonts](fonts).
