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

Whether the video should display a volume slider and a mute button. Only has an effect if `controls` is also set to true. Default `true`.

### `allowFullscreen`

_optional_

Whether the video can go fullscreen. By default `true`.

### `clickToPlay`

_optional_

A boolean property defining whether you can play, pause or resume the video with a single click into the player. Default `true` if `controls` are true, otherwise `false`.

### `doubleClickToFullscreen`

_optional_

A boolean property defining whether you can go fullscreen and exit fullscreen in the video with double click into the player. If enabled, clicking on the video once will delay pausing the video for 200ms to wait for a possible second click. Default `false`.

### `spaceKeyToPlayOrPause`

_optional_

A boolean property defining whether you can play or pause a video using space key. If enabled, playing the video and subsequently pressing the space key pauses and resumes the video. Only works if `controls` is true. Default `true`.

### `inputProps`

_optional_

Pass props to the component that you have specified using the `component` prop. The Typescript definition takes the shape of the props that you have given to your `component`. Default `undefined`.

### `style`

_optional_

A regular `style` prop for a HTMLDivElement. You can pass a different height and width if you would like different dimensions for the player than the original composition dimensions.

### `numberOfSharedAudioTags`

_optional - available since v.2.3.1_

If you use an [`<Audio />`](/docs/audio) tag, it might not play in some browsers (specifically iOS Safari) due to browser autoplay policies. This is why the Remotion Player pre-mounts a set of audio tags with silent audio that get played upon user interaction. These audio tags can then be used to play real audio later and will not be subject to the autoplay policy of the browser.

This option controls how many audio tags are being rendered, the default is `5`. If you mount more audio tags than shared audio tags are available, then an error will be thrown.

If you'd like to opt out of this behavior, you can pass `0` to mount native audio tags simultaneously as you mount Remotion's [`<Audio />`](/docs/audio) tags.

Once you have set this prop, you cannot change it anymore or an error will be thrown.

### `playbackRate`

_optional_

A number between -4 and 4 (excluding 0) for the speed that the Player will run the media.

A `playbackRate` of `2` means the video plays twice as fast. A playbackRate of `0.5` means the video plays twice as slow. A playbackRate of `-1` means the video plays in reverse. Note that [`<Audio/>`](/docs/audio) and [`<Video/>`](/docs/video) tags cannot be played in reverse.

Default `1`.

## `PlayerRef`

You may attach a ref to the player and control it in an imperative manner.

```tsx twoslash {15}
// @allowUmdGlobalAccess

// @filename: MyComposition.tsx
export const MyComposition: React.FC = () => null;

// @filename: index.tsx
// ---cut---
import { useEffect, useRef } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { MyComposition } from "./MyComposition";

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
      durationInFrames={30}
      compositionWidth={1080}
      compositionHeight={1080}
      fps={30}
      component={MyComposition}
      // Many other optional props are available.
    />
  );
};
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

### `getContainerNode()`

_Available from v2.4.2_

Gets the container `HTMLDivElement` of the player. Useful if you'd like to manually attach listeners to the player element.

```tsx twoslash
import { useRef, useEffect } from "react";
import { PlayerRef } from "@remotion/player";
// ---cut---
const playerRef = useRef<PlayerRef>(null);

useEffect(() => {
  if (!playerRef.current) {
    return;
  }
  const container = playerRef.current.getContainerNode();
  if (!container) {
    return;
  }

  const onClick = () => {
    console.log("player got clicked");
  };

  container.addEventListener("click", onClick);
  return () => {
    container.removeEventListener("click", onClick);
  };
}, []);
```

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

```tsx twoslash
import { useRef, useEffect } from "react";
import { PlayerRef } from "@remotion/player";
// ---cut---
const playerRef = useRef<PlayerRef>(null);

useEffect(() => {
  if (!playerRef.current) {
    return;
  }
  playerRef.current.addEventListener("play", () => {
    console.log("playing");
  });
  playerRef.current.addEventListener("ratechange", () => {
    console.log("ratechange");
  });
  playerRef.current.addEventListener("pause", () => {
    console.log("pausing");
  });

  // See below for difference between `seeked` and `timeupdate`
  playerRef.current.addEventListener("seeked", (e) => {
    console.log("seeked to " + e.detail.frame);
  });
  playerRef.current.addEventListener("timeupdate", (e) => {
    console.log("time has updated to " + e.detail.frame);
  });
  playerRef.current.addEventListener("ended", (e) => {
    console.log("ended");
  });
  playerRef.current.addEventListener("error", (e) => {
    console.log("error", e.detail.error);
  });
}, []);
```

### `seeked`

Fired when the time position changes. You may get the current frame by reading it from `e.detail.frame`.

```tsx twoslash
import { useRef, useEffect } from "react";
import { PlayerRef } from "@remotion/player";
const playerRef = useRef<PlayerRef>(null);
if (!playerRef.current) {
  throw new Error();
}
// ---cut---
playerRef.current.addEventListener("seeked", (e) => {
  console.log("seeked to " + e.detail.frame); // seeked to 120
});
```

This event fires on every single frame update. Don't update your UI based on this event as it will cause a lot of rerenders. Use the [`timeupdate`](#timeupdate) event instead.

### `ended`

Fires when the video has ended and looping is disabled.

### `play`

Fires when the video has ended and looping is disabled.

### `ratechange`

Fires when the [`playbackRate`](#playbackrate) has changed.

### `pause`

Fires when the video has paused or ended.

### `timeupdate`

Fires periodically when the video is playing. Unlike the [`seeked`](#seeked) event, frames are skipped, and the event is throttled to only fire a few times a second.

```tsx twoslash
import { useRef, useEffect } from "react";
import { PlayerRef } from "@remotion/player";
const playerRef = useRef<PlayerRef>(null);
if (!playerRef.current) {
  throw new Error();
}
// ---cut---
playerRef.current.addEventListener("timeupdate", (e) => {
  console.log("current frame is " + e.detail.frame); // current frame is 120
});
```

### `error`

Fires when an error or uncaught exception has happened in the video.

You may get the error by reading the `e.detail.error` value:

```tsx twoslash
import { useRef, useEffect } from "react";
import { PlayerRef } from "@remotion/player";
const ref = useRef<PlayerRef>(null);
// ---cut---
ref.current?.addEventListener("error", (e) => {
  console.log("error ", e.detail.error); // error [Error: undefined is not a function]
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
- Customize error UI
