---
id: player
title: <Player />
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { PlayerExample } from "../components/Player.tsx";
import { ExperimentalBadge } from "../components/Experimental.tsx";

<ExperimentalBadge/>

Using the Remotion Player you can embed Remotion videos in any React app and customize the video content at runtime.

## Installation

To install the player, run the following command in a React project:

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
]
}>
<TabItem value="npm">

```bash
npm i @remotion/player
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add @remotion/player
```

  </TabItem>
</Tabs>

## `<Player />`

A react component which takes the following props

### `component` or `lazyComponent`

Pass a React component in directly **or** pass a function that returns a dynamic import. Passing neither or both of the props is an error.

### `durationInFrames`

The duration of the video in frames. Must be an integer and greater than 0.

### `fps`

The frame rate of the video.

### `width`

The width of the composition in pixels.

### `height`

The height of the composition in pixels.

### `loop`

_optional_

Whether the video should restart when it ends. Default `false`.

### `autoPlay`

_optional_

Whether the video should start immediately after loaded. Default `false`.

### `controls`

_optional_

Whether the video should display a seek bar and a play/pause button. Default `false.`

## `PlayerRef`

You may attach a ref to the player and control it in an imperative manner.

```tsx {14}
import {Player, PlayerRef} from '@remotion/player';

const MyComp: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    if (playerRef.current) {
      console.log(playerRef.current.getCurrentFrame());
    }
  }, []);

  return (
    <Player
      ref={playerRef}
      // other props
    />
  );
}
```

The following methods are available on the player ref:

### `pause()`

Pause the video. Nothing happens if the video is already not playing.

### `play()`

Play the video. Nothing happens if the video is already playing.

### `toggle()`

Pauses the video if it's playing. Plays the video if it's paused.

### `getCurrentFrame()`

Gets the current postition expressed as the current frame. Divide by the `fps` you passed to get the time in seconds.

### `seekTo()`

#### Arguments

- `frame`: `number`

Move the position in the video to the frame that you specify. If the video is playing, it will pause for a brief moment, then start playing again after the seek is completed.

### `addEventListener()`

Start listening to an event. See the [Events](#events) section to see the function signature and the available events.

### `removeEventListener()`

Stop listening to an event. See the [Events](#events) section to see the function signature and the available events.

## Events

Using a [player ref](#playerref), you can bind event listeners to get notified of certain events of the player.

```tsx
const ref = useRef<PlayerRef>(null);

useEffect(() => {
  if (!ref.current) {
    return null;
  }
  ref.current.addEventListener('play', () => {
    console.log('playing');
  });
  ref.current.addEventListener('pause', () => {
    console.log('pausing');
  });
  ref.current.addEventListener('seeked', (e) => {
    console.log('seeked to ' + e.detail.frame);
  });
  ref.current.addEventListener('ended', (e) => {
    console.log('ended');
  });
  ref.current.addEventListener('error', (e) => {
    console.log('error', e.detail.error);
  });
}, []);
```

### `seeked`

Fired when the time position changes. You may get the current frame by reading it from `e.detail.frame`.

```tsx
ref.current.addEventListener('seeked', (e) => {
  console.log('seeked to ' + e.detail.frame); // seeked to 120
});
```

This event fires on every single frame. If you link it to a state update, you may want to throttle the updates to avoid over-rendering.

### `ended`

Fires when the video has ended and looping is disabled.

### `play`

Fires when the video has started playing or has resumed from a pause.

### `pause`

Fires when the video has paused or ended.

### `error`

Fires when an error or uncaught exception has happened in the video.

You may get the error by reading the `e.detail.error` value:

```tsx
ref.current.addEventListener('error', (e) => {
  console.log('error ', e.detail.error); // error [Error: undefined is not a function]
});
```

## Handling errors

Since videos are written in React, they are prone to crashing.
When a video throws an exception, you may handle the error using the [`error` event](#error).
The video will unmount and show an error UI, but not the whole app website will crash.
It is up to you to handle the error and to re-mount the video (for example by changing the `key` prop in React).

This feature is implemented using an [error boundary](https://reactjs.org/docs/error-boundaries.html), so only errors in the render function will be caught. Errors in event handlers and asynchronous code will not be reported and will not cause the video to unmount.

## Known issues

Before we mark the player as stable, we are looking to improve in the following areas:

- Allow the player size to be a different size than the composition size.
- Better loading state than the current "Loading..." text.
- Implement keyboard controls.
- Fullscreen support.
- Better props validation
- Customize error UI

<PlayerExample />
