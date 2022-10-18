### Remotion Player

[![NPM Version](https://img.shields.io/npm/v/@remotion/player.svg?style=flat)](https://www.npmjs.org/package/@remotion/player)
[![NPM Downloads](https://img.shields.io/npm/dm/@remotion/player.svg?style=flat)](https://npmcharts.com/compare/@remotion/player?minimal=true)
[![Install Size](https://packagephobia.now.sh/badge?p=@remotion/player)](https://packagephobia.now.sh/result?p=@remotion/player)

The `@remotion/player` package allows you to embed a video powered by Remotion in a React application.

## Installation and prerequisites

The dependencies that Remotion requires you to have pre-installed on your machine are Node.js and FFMPEG. You can take a look at this [guide](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg) on how to get FFMPEG on your machine.

Install this package and Remotion with the package manager that you use for project:

```bash
npm i remotion @remotion/player
```

```bash
yarn add remotion @remotion/player
```

```bash
pnpm i remotion @remotion/player
```

> Make sure all Remotion packages you install (`remotion`, `@remotion/player`, `@remotion/gif`...) [have the same version](https://remotion.dev/docs/version-mismatch).

## Getting started

Now that you have this package as a dependency in your React project, it is time to see some of the basic examples that you can spin up with this package.

The `@remotion/player` package can be imported as a React component from the library, which you can make use of in your components, either by nesting it in a custom component of yours or simply making it a standalone component.

```javascript
// components/MyVideo.js
import React from 'react';
import {useCurrentFrame} from 'remotion';

const MyVideo = () => {
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				flex: 1,
				textAlign: 'center',
				fontSize: '7em',
			}}
		>
			The current frame is {frame}.
		</div>
	);
};
```

```javascript
import {Player} from '@remotion/player';
import {MyVideo} from '../components/MyVideo';

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

## API

The most important props accepted:

| Props             | Function                                 |
| ----------------- | ---------------------------------------- |
| component         | A React component that renders the video |
| durationInFrames  | The duration of the video in frames      |
| compositionHeight | The height of the composition in pixels  |
| compositionWidth  | The width of the composition in pixels   |
| fps               | The frame rate of the video              |

For a complete reference of the available props, refer to [@remotion/player API](https://www.remotion.dev/docs/player/api).
