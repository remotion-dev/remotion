### Remotion GIF

[![NPM Version](https://img.shields.io/npm/v/@remotion/player.svg?style=flat)](https://www.npmjs.org/package/@remotion/player)
[![NPM Downloads](https://img.shields.io/npm/dm/@remotion/player.svg?style=flat)](https://npmcharts.com/compare/@remotion/player?minimal=true)
[![Install Size](https://packagephobia.now.sh/badge?p=@remotion/player)](https://packagephobia.now.sh/result?p=@remotion/player)

The Remotion GIF package allows you to embed GIFs into a [Remotion](https://remotion.dev) composition that synchronizes with Remotion's `useCurrentFrame()`'s hook.

To use this package, we'll be assuming [you already have a Remotion project](https://remotion.dev/docs).

Use the same package manager to install this package that you have used to initialize your Remotion project:

```bash 
npm i @remotion/gif
```

```bash
yarn add @remotion/gif
```

```bash
pnpm i @remotion/gif
```

> Make sure all Remotion packages you install (`remotion`, `@remotion/player`, `@remotion/gif`...) [have the same version](https://remotion.dev/docs/version-mismatch).

### Basic Example

This will render a GIF that fills the whole size of the composition:

```javascript
import { useVideoConfig } from "remotion";
import { Gif } from "@remotion/gif";
 
export const MyComponent = () => {
  const { width, height } = useVideoConfig();
 
  return (
    <Gif
      src="https://media.giphy.com/media/3o72F7YT6s0EMFI0Za/giphy.gif"
      width={width}
      height={height}
      fit="fill"
    />
  );
};
```

### API

Prop | Function |
--- | --- | 
src | is a required prop, and it is the source of the GIF. It can be a URL or a local image - [See how you can import assets](https://www.remotion.dev/docs/assets).| 
width | The display width of the GIF
height | The display height of the GIF
fill | The layout of the GIF in its current container. It accepts the following values: `fill`, `contain`, and `cover`

For a complete reference of the available props, refer to [the @remotion/gif documentation](https://www.remotion.dev/docs/gif).
