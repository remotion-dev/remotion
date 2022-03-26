### Remotion Player

[![NPM Version](http://img.shields.io/npm/v/@remotion/player.svg?style=flat)](https://www.npmjs.org/package/@remotion/player)
[![NPM Downloads](https://img.shields.io/npm/dm/@remotion/player.svg?style=flat)](https://npmcharts.com/compare/@remotion/player?minimal=true)
[![Install Size](https://packagephobia.now.sh/badge?p=@remotion/player)](https://packagephobia.now.sh/result?p=@remotion/player)

To use this package, we'll be assuming you already have the required setup to use Remotion. The dependencies that Remotion requires you to have pre-installed on your machine are Node.js and FFMPEG. You can take a look at this [guide](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg) on how to get FFMPEG on your machine.


The `@remotion/player` package allows you to include a video powered by Remotion in a React application. To get started with using this package, you need to have this package installed as a dependency in your project. 

The command below does that for you.

```bash
npm install @remotion/player
```

There are other package managers that you can use to get this dependency in your projects. We have [yarn](https://yarnpkg.com/) and [pnpm](https://pnpm.io/). You can go with whichever one is the most convenient for you. Below are the commands that will get the package into your project.

```bash
yarn add @remotion/player
```

```bash
pnpm install @remotion/player
```

## remotion/player in action.

Now that you have this package as a dependency in your React project. It is tie to see some of the basic examples that you can spin up with this package.

The `player` package can be imported as a react component from the library, which you can make use of in your components, either by nesting it in a custom component of yours, or simply making it a standalaone component of its own.

```javascript
// components/MyVideo
import React from "react"
import { useCurrentFrame } from "remotion"

const MyVideo = () => {
  const frame = useCurrentFrame()

  return (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        fontSize: "7em",
      }}
    >
      The current frame is {frame}.
    </div>
  );
}
```

```javascript
import { Player } from "@remotion/player"
import { MyVideo } from "../components/Myvideo"

export const App = () => {
  return (
    <Player
      component={MyVideo}
      durationInFrames={120}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
    />
  );
};
```

## The props in Player and their roles

- `component`: the component prop takes in a component, a javascript function or a class when it is exported from its module
- `durationInFrames`: represents the amount of time a frame will take to render
- `compositionHeight`: The height of the composition in pixels.
- `compositionWidth`: represents the width that video component will occupy in the viewport
- `fps`: The frame rate of the video.