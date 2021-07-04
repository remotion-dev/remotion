---
id: assets
title: Importing assets
---

Remotion allows you to include several types of files in your project:

- Images (`.png`, `.svg`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.bmp`)
- Videos (`.webm`, `.mp4`)
- Audio (`.mp3`, `.wav`, `.aac`), preview only
- [Fonts (`.woff` and `.woff2`) - read the separate page for fonts](/docs/fonts)

## Using images

Require images using an `import` statement and pass them to the [`<Img/>`](/docs/img) tag.

```tsx twoslash
import {Img} from 'remotion'
import logo from './logo.png'

export const MyComp: React.FC = () => {
  return <Img src={logo} />
}
```

## Using image sequences

If you have a series of images, for example exported from another program like After Effects or Rotato, you can use a dynamic `require` statement to import the images as they are needed.

```tsx twoslash
import {useCurrentFrame} from 'remotion'

/*
  Assuming your file structure is:
  assets/
    frame1.png
    frame2.png
    frame3.png
    ...
*/

const MyComp: React.FC = () => {
  const frame = useCurrentFrame()
  const src = require('./assets/frame' + frame + '.png')

  return <img src={src} />
}
```

:::tip
Avoid writing a require statement that requires a file that doesn't exist. If your project throws an error because your composition is longer than than your image sequence, clamp the file name using `Math.min()` or Remotion's `interpolate()`.
:::

## Using videos

Import your files using an import statement. Use the [`<Video />`/docs/video) component to keep the timeline and your video in sync.

```tsx twoslash
import {Video} from 'remotion'
import vid from './vid.webm'

export const MyComp: React.FC = () => {
  return <Video src={vid} />
}
```

Be aware that if you are rendering using Chromium (as opposed to Chrome), the codec for MP4 videos is not included. Read the section on the [`<Video/ >`](/docs/video#codec-support) page for more information.

## Using Audio

Import your audio using an `import` statement and pass it to the [`<Audio/ >`](/docs/audio) component.

```tsx twoslash
import {Audio} from 'remotion'
import tune from './tune.mp3'

export const MyComp: React.FC = () => {
  return <Audio src={tune} />
}
```

See the [audio guide](/docs/using-audio) for guidance on including audio.

## Using fonts

See the [dedicated page about fonts](/docs/fonts).
