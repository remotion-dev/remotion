---
id: player
title: API - @remotion/player
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { PlayerExample } from "../components/Player.tsx";
import { ExperimentalBadge } from "../components/Experimental.tsx";

<ExperimentalBadge/>

Using the Remotion Player you can embed Remotion videos in any React app and customize the video content at runtime.

## Demo

Play the video, then tweak the parameters below the video.
<PlayerExample />

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
npm i remotion @remotion/player
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add @remotion/player
```

  </TabItem>
</Tabs>

## `<Player />`

A React component which takes the following props

### `component` or `lazyComponent`

Pass a React component in directly **or** pass a function that returns a dynamic import. Passing neither or both of the props is an error.

### `durationInFrames`

The duration of the video in frames. Must be an integer and greater than 0.

### `fps`

The frame rate of the video. Must be a number.

### `compositionWidth`

The width of the composition in pixels.

### `compositionHeight`

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

### `showVolumeControls`

_optional_

Whether the video should display a volume slider and a mute button. Default `true`.

### `allowFullscreen`

_optional_

Whether the video can go fullscreen. By default true.

### `clickToPlay`

_optional_

A boolean property defining whether you can play, pause or resume the video with a single click into the player. Default true.

### `doubleClickToFullscreen`

_optional_

A boolean property defining whether you can go fullscreen and exit fullscreen in the video with double click into the player. Default true.

### `style`

_optional_

A regular `style` prop for a HTMLDivElement. You can pass a different height and width if you would like different dimensions for the player than the original composition dimensions.

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

Pause the video. Nothing happens if the video is already paused.

### `play()`

Play the video. Nothing happens if the video is already playing.

### `toggle()`

Pauses the video if it's playing. Plays the video if it's paused.

### `getCurrentFrame()`

Gets the current postition expressed as the current frame. Divide by the `fps` you passed to get the time in seconds.

### `mute()`

Mutes the video.

### `unmute()`

Unmutes the video.

### `getVolume()`

Gets the volume of the video. The volume is a value between 0 and 1 and is initially 1.

### `setVolume()`

#### Arguments

- `volume`: `number`

Set the volume of the video. Must be a value between 0 and 1, otherwise an exception will be thrown.

### `isMuted()`

Returns a boolean specifying whether the video is muted.

### `seekTo()`

#### Arguments

- `frame`: `number`

Move the position in the video to a specific frame. If the video is playing, it will pause for a brief moment, then start playing again after the seek is completed.

### `isFullscreen()`

Returns a boolean whether the video is currently playing in fullscreen.

_To observe the fullscreen state and react to changes, listen to the [`fullscreenchange`](https://developer.mozilla.org/en-US/docs/Web/API/Document/fullscreenchange_event) event on the global document._

### `requestFullscreen()`

Requests the video to go to fullscreen. This method throws if the `allowFullscreen` prop is false or the browser doesn't support allow the player to go into fullscreen.

### `exitFullscreen()`

Exit fullscreen mode.

### `addEventListener()`

Start listening to an event. See the [Events](#events) section to see the function signature and the available events.

### `removeEventListener()`

Stop listening to an event. See the [Events](#events) section to see the function signature and the available events.

## Events

Using a [player ref](#playerref), you can bind event listeners to get notified of certain events of the player.

```tsx
const playerRef = useRef<PlayerRef>(null);

useEffect(() => {
  if (!playerRef.current) {
    return null;
  }
  playerRef.current.addEventListener('play', () => {
    console.log('playing');
  });
  playerRef.current.addEventListener('pause', () => {
    console.log('pausing');
  });
  playerRef.current.addEventListener('seeked', (e) => {
    console.log('seeked to ' + e.detail.frame);
  });
  playerRef.current.addEventListener('ended', (e) => {
    console.log('ended');
  });
  playerRef.current.addEventListener('error', (e) => {
    console.log('error', e.detail.error);
  });
}, []);
```

### `seeked`

Fired when the time position changes. You may get the current frame by reading it from `e.detail.frame`.

```tsx
playerRef.current.addEventListener('seeked', (e) => {
  console.log('seeked to ' + e.detail.frame); // seeked to 120
});
```

This event fires on every single frame update. If you link it to a state update, you may want to throttle the updates to avoid expensive rendering operations.

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
The video will unmount and show an error UI, but the host application (The React app which is embedding the player) will not crash.
It is up to you to handle the error and to re-mount the video (for example by changing the `key` prop in React).

This feature is implemented using an [error boundary](https://reactjs.org/docs/error-boundaries.html), so only errors in the render function will be caught. Errors in event handlers and asynchronous code will not be reported and will not cause the video to unmount.

## Known issues

Before we mark the player as stable, we are looking to improve in the following areas:

- Better loading state than the current "Loading..." text.
- Implement keyboard controls.
- Better props validation
- Customize error UI
- Volume slider
- Fix the fullscreen icon - it should inverse when the player is already in fullscreen.
- Implement double click to fullscreen.
