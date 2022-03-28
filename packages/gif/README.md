### Remotion GIF

[![NPM Version](http://img.shields.io/npm/v/@remotion/player.svg?style=flat)](https://www.npmjs.org/package/@remotion/player)
[![NPM Downloads](https://img.shields.io/npm/dm/@remotion/player.svg?style=flat)](https://npmcharts.com/compare/@remotion/player?minimal=true)
[![Install Size](https://packagephobia.now.sh/badge?p=@remotion/player)](https://packagephobia.now.sh/result?p=@remotion/player)

To use this package, we'll be assuming you already have the required setup to use Remotion. The dependencies that Remotion requires you to have pre-installed on your machine are Node.js and FFMPEG. You can take a look at this [guide](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg) on how to get FFMPEG on your machine.

The Remotion gif package allows you to create a React component for displaying GIFs that synchronizes with Remotion's `useCurrentFrame()`'s hook.

You can read more about the hook [here](https://www.remotion.dev/docs/use-current-frame)

You can get this package with the commands below, depending on the type of package manager that you are comfortable with.

- npm 
```bash 
npm install @remotion/gif
```
- yarn 
```bash
yarn add @remotion/gif
```
- pnpm 
```bash
pnpm install @remotion/player
```

### remotion/gif in action

The `player` package can be imported as a React component from the library, which you can make use of in your components, either by nesting it in a custom component of yours or simply making it a standalone component.

```javascript
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

### The remotion/gif props

Props | Function |
--- | --- | 
src | is a required prop, and it is the source of the GIF. It Can be a URL or a local image - [See how you can import assets](https://www.remotion.dev/docs/assets).| 
width | The display width of the GIF
height | The display height of the GIF
fill | The layout of the GIF in its current container. It accepts the following values: `fill`, `contain`, and `cover`

For a complete reference of the available props, refer to [@remotion/gif API](https://www.remotion.dev/docs/gif).
