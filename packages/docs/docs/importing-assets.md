---
id: assets
title: Importing assets
---

To import assets in Remotion, create a `public/` folder in your project and use [`staticFile()`](/docs/staticfile) to import it.

```txt
my-video/
├─ node_modules/
├─ public/
│  ├─ logo.png
├─ src/
│  ├─ MyComp.tsx
│  ├─ Video.tsx
│  ├─ index.tsx
├─ package.json
```

```tsx twoslash title="src/MyComp.tsx"
import { Img, staticFile } from "remotion";

export const MyComp: React.FC = () => {
  return <Img src={staticFile("logo.png")} />;
};
```

## Using images

Use the [`<Img/>`](/docs/img) tag from Remotion.

```tsx twoslash title="MyComp.tsx"
import { Img, staticFile } from "remotion";

export const MyComp: React.FC = () => {
  return <Img src={staticFile("logo.png")} />;
};
```

You can also pass a URL:

```tsx twoslash title="MyComp.tsx"
import { Img } from "remotion";

export const MyComp: React.FC = () => {
  return <Img src="https://picsum.photos/id/237/200/300" />;
};
```

## Using image sequences

If you have a series of images, for example exported from another program like After Effects or Rotato, you can interpolate the path to create a dynamic import.

```txt
my-video/
├─ public/
│  ├─ frame1.png
│  ├─ frame2.png
│  ├─ frame3.png
├─ package.json
```

```tsx twoslash
import { Img, useCurrentFrame, staticFile } from "remotion";

const MyComp: React.FC = () => {
  const frame = useCurrentFrame();

  return <Img src={staticFile(`/${frame}.png`)} />;
};
```

## Using videos

Use the [`<Video />`](/docs/video) component to keep the timeline and your video in sync.

```tsx twoslash
import { staticFile, Video } from "remotion";

export const MyComp: React.FC = () => {
  return <Video src={staticFile("vid.webm")} />;
};
```

Loading videos via URL is also possible:

```tsx twoslash
import { Video } from "remotion";

export const MyComp: React.FC = () => {
  return (
    <Video src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
  );
};
```

Be aware that if you are rendering using Chromium (as opposed to Chrome), the codec for MP4 videos is not included. Read the section on the [`<Video/ >`](/docs/video#codec-support) page for more information.

## Using Audio

Use the [`<Audio/ >`](/docs/audio) component.

```tsx twoslash
import { Audio, staticFile } from "remotion";

export const MyComp: React.FC = () => {
  return <Audio src={staticFile("tune.mp3")} />;
};
```

Loading audio from an URL is also possible:

```tsx twoslash
import { Audio } from "remotion";

export const MyComp: React.FC = () => {
  return (
    <Audio src="https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3" />
  );
};
```

See the [audio guide](/docs/using-audio) for guidance on including audio.

## Using CSS

Put the .css file alongside your JavaScript source files and use an `import` statement.

```txt
my-video/
├─ node_modules/
├─ src/
│  ├─ style.css
│  ├─ MyComp.tsx
│  ├─ Video.tsx
│  ├─ index.tsx
├─ package.json
```

```tsx twoslash title="MyComp.tsx"
import "./style.css";
```

:::note
Want to use SASS, Tailwind or similar? [See examples on how to override the Webpack configuration](/docs/webpack).
:::

## Using Fonts

[Read the separate page for fonts.](/docs/fonts)

## `import` statements

As an alternative way to import files, Remotion allows you to `import` or `require()` several types of files in your project:

- Images (`.png`, `.svg`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.bmp`)
- Videos (`.webm`, `.mov`, `.mp4`)
- Audio (`.mp3`, `.wav`, `.aac`, `m4a`)
- Fonts (`.woff`, `.woff2`, `otf`, `ttf`, `eot`)

For example:

```tsx twoslash title="MyComp.tsx"
import { Img } from "remotion";
import logo from "./logo.png";

export const MyComp: React.FC = () => {
  return <Img src={logo} />;
};
```

### Caveats

While this was previously the main way of importing files, we now recommend against it because of the following reasons:

- Only the above listed file extensions are supported.
- The maximum file size is 2GB.
- Dynamic imports such as `require('img' + frame + '.png')` are [funky](/docs/webpack-dynamic-imports).

Prefer importing using [`staticFile()`](/docs/staticfile) if possible.
