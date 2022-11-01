---
id: api
title: "<Player>"
---

A component which can be rendered in a regular React App (for example: [Create React App](https://create-react-app.dev/), [Next.JS](https://nextjs.org)) to display a Remotion video.

```tsx twoslash title="MyApp.tsx"
// @allowUmdGlobalAccess
// @filename: ./remotion/MyVideo.tsx
export const MyVideo = () => <></>;

// @filename: index.tsx
// ---cut---
import { Player } from "@remotion/player";
import { MyVideo } from "./remotion/MyVideo";

export const App: React.FC = () => {
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

[See more usage examples](/docs/player/examples)

## API

### `component` or `lazyComponent`

Pass a React component in directly **or** pass a function that returns a dynamic import. Passing neither or both of the props is an error.

If you use `lazyComponent`, wrap it in a `useCallback()` to avoid constant rendering. [See here for an example.](/docs/player/examples#loading-a-component-lazily)

:::note
The Player does not use [`<Composition>`](/docs/composition)'s. Pass your component directly and do not wrap it in a `<Composition>` component.
:::

### `durationInFrames`

The duration of the video in frames. Must be an integer and greater than 0.

### `fps`

The frame rate of the video. Must be a number.

### `compositionWidth`

The width you would like the video to have when rendered as an MP4. Use `style={{width: <width>}}` to define a width to be assumed in the browser.

:::note
**Example**:
If you want to render a Full HD video, set `compositionWidth` to `1920` and `compositionHeight` to `1080`. By default, the Player will also assume these dimensions.
To make it smaller, pass a `style` prop to give the player a different width: `{"style={{width: 400}}"}`. See [Player Scaling](/docs/player/scaling) to learn more.
:::

### `compositionHeight`

The height you would like the video to have when rendered as an MP4. Use `style={{height: <height>}}` to define a height to be assumed in the browser.

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

### `moveToBeginningWhenEnded`

_optional, available from v3.1.3_

A boolean property defining whether the video position should go back to zero once the video has ended. Only works if `loop` is disabled. Default `true`.

### `inputProps`

_optional_

Pass props to the component that you have specified using the `component` prop. The Typescript definition takes the shape of the props that you have given to your `component`. Default `undefined`.

### `style`

_optional_

A regular `style` prop for a HTMLDivElement. You can pass a different height and width if you would like different dimensions for the player than the original composition dimensions.

### `className`

_optional - available since v3.1.3_

A HTML class name to be applied to the container.

### `initialFrame`

_optional - available since v3.1.14_

Start the playback from a specific frame. Default `0`. Once the player is mounted, this property cannot be changed.

### `numberOfSharedAudioTags`

_optional - available since v.2.3.1_

If you use an [`<Audio />`](/docs/audio) tag, it might not play in some browsers (specifically iOS Safari) due to browser autoplay policies. This is why the Remotion Player pre-mounts a set of audio tags with silent audio that get played upon user interaction. These audio tags can then be used to play real audio later and will not be subject to the autoplay policy of the browser.

This option controls how many audio tags are being rendered, the default is `5`. If you mount more audio tags than shared audio tags are available, then an error will be thrown.

If you'd like to opt out of this behavior, you can pass `0` to mount native audio tags simultaneously as you mount Remotion's [`<Audio />`](/docs/audio) tags.

Once you have set this prop, you cannot change it anymore or an error will be thrown.

### `playbackRate`

_optional_

A number between -4 and 4 (excluding 0) for the speed that the Player will run the media.

A `playbackRate` of `2` means the video plays twice as fast. A playbackRate of `0.5` means the video plays twice as slow. A playbackRate of `-1` means the video plays in reverse. Note that [`<Audio/>`](/docs/audio) and [`<Video/>`](/docs/video) tags cannot be played in reverse, this is a browser limitation.

Default `1`.

### `errorFallback`

_optional_

A callback for rendering a custom error message. See [Handling errors](#handling-errors) section for an example.

### `renderLoading`

_optional_

A callback function that allows you to return a custom UI that gets displayed while the player is loading.

The first parameter contains the `height` and `width` of the player as it gets rendered.

```tsx twoslash
import { Player, RenderLoading } from "@remotion/player";
import { useCallback } from "react";
import { AbsoluteFill } from "remotion";

const Component: React.FC = () => null;

// ---cut---

const MyApp: React.FC = () => {
  // `RenderLoading` type can be imported from "@remotion/player"
  const renderLoading: RenderLoading = useCallback(({ height, width }) => {
    return (
      <AbsoluteFill style={{ backgroundColor: "gray" }}>
        Loading player ({height}x{width})
      </AbsoluteFill>
    );
  }, []);

  return (
    <Player
      fps={30}
      component={Component}
      durationInFrames={100}
      compositionWidth={1080}
      compositionHeight={1080}
      renderLoading={renderLoading}
    />
  );
};
```

:::info
A player needs to be loaded if it contains elements that use React Suspense, or if the `lazyComponent` prop is being used.
:::

### `renderPoster`

_optional, available from v3.2.14_

A callback function that allows you to return a custom UI that gets overlayed over the player.

You can control when the poster gets rendered using the props [`showPosterWhenUnplayed`](#showposterwhenunplayed), [`showPosterWhenPaused`](#showposterwhenpaused) and [`showPosterWhenEnded`](#showposterwhenended). By default, they are all disabled.

The first parameter contains the `height` and `width` of the player as it gets rendered.

```tsx twoslash
import { Player, RenderPoster } from "@remotion/player";
import { useCallback } from "react";
import { AbsoluteFill } from "remotion";

const Component: React.FC = () => null;

// ---cut---

const MyApp: React.FC = () => {
  // `RenderPoster` type can be imported from "@remotion/player"
  const renderPoster: RenderPoster = useCallback(({ height, width }) => {
    return (
      <AbsoluteFill style={{ backgroundColor: "gray" }}>
        Click to play! ({height}x{width})
      </AbsoluteFill>
    );
  }, []);

  return (
    <Player
      fps={30}
      component={Component}
      durationInFrames={100}
      compositionWidth={1080}
      compositionHeight={1080}
      renderPoster={renderPoster}
      showPosterWhenUnplayed
    />
  );
};
```

### `showPosterWhenUnplayed`

_optional, available from v3.2.14_

Render the poster when the video is in its initial state and has not been played yet. Requires [`renderPoster()`](#renderposter) to be set. Default: `false`.

### `showPosterWhenPaused`

_optional, available from v3.2.14_

Render the poster when the video is paused. Although considered a paused state, the poster will not render while the user is scrubbing through the video. Requires [`renderPoster()`](#renderposter) to be set. Default: `false`.

### `showPosterWhenEnded`

_optional, available from v3.2.14_

Render the poster when the video has ended. Requires [`moveToBeginning`](#movetobeginningwhenended) to be set to `false`. [`renderPoster()`](#renderposter) to be set. Default: `false`.

### `inFrame`

_optional, available from v3.2.15_

Limit playback to only play after a certain frame. The video will start from this frame and move to this position once it has ended. Must be an integer, not smaller than `0`, not bigger than [`outFrame`](#outframe) and not bigger than `durationInFrames - 1`. Default `null`, which means the beginning of the video.

### `outFrame`

_optional, available from v3.2.15_

Limit playback to only play before a certain frame. The video will end at this frame and move to the beginning once it has ended. Must be an integer, not smaller than `1`, not smaller than [`inFrame`](#inframe) and not bigger than `durationInFrames - 1`. Default `null`, which means the end of the video.

### `initiallyShowControls`

_optional, available from v3.2.24_

If true, the controls flash when the player enters the scene. After 2 seconds without hover, the controls fade out. This is similar to how YouTube does it, and signals to the user that the player is in fact controllable. You can also pass a `number`, with which you can customize the duration in milliseconds. Default `true` since `v3.2.24`, before that unsupported.

### `renderPlayPauseButton`

_optional, available from v3.2.32_

Allows you to customize the Play/Pause button of the controls, must be a callback function that returns a valid React element.

```tsx twoslash
const MyPlayButton: React.FC = () => null;
const MyPauseButton: React.FC = () => null;
const MyVideo: React.FC = () => null;
// ---cut---
import { Player, RenderPlayPauseButton } from "@remotion/player";
import { useCallback } from "react";

export const App: React.FC = () => {
  const renderPlayPauseButton: RenderPlayPauseButton = useCallback(
    ({ playing }) => {
      if (playing) {
        return <MyPlayButton />;
      }

      return <MyPauseButton />;
    },
    []
  );

  return (
    <Player
      component={MyVideo}
      durationInFrames={120}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      renderPlayPauseButton={renderPlayPauseButton}
    />
  );
};
```

### `renderFullscreenButton`

_optional, available from v3.2.32_

Allows you to customise the fullscreen button of the player controls, must return a valid React element. If fullscreen is disabled or not available in a browser, it will not be rendered.

```tsx twoslash
const FullScreenButton: React.FC = () => null;
const MinimiseButton: React.FC = () => null;
const MyVideo: React.FC = () => null;
// ---cut---
import { Player, RenderFullscreenButton } from "@remotion/player";
import { useCallback } from "react";

export const App: React.FC = () => {
  const renderFullscreenButton: RenderFullscreenButton = useCallback(
    ({ isFullscreen }) => {
      if (isFullscreen) {
        return <MinimiseButton />;
      }

      return <FullScreenButton />;
    },
    []
  );

  return (
    <Player
      component={MyVideo}
      durationInFrames={120}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      renderFullscreenButton={renderFullscreenButton}
    />
  );
};
```

## `PlayerRef`

You may attach a ref to the player and control it in an imperative manner.

```tsx twoslash {15}
// @allowUmdGlobalAccess

// @filename: MyComposition.tsx
export const MyComposition: React.FC = () => null;

// @filename: index.tsx
// ---cut---
import { Player, PlayerRef } from "@remotion/player";
import { useEffect, useRef } from "react";
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

### `pauseAndReturnToPlayStart()`

_Availabe from v3.0.30_

If the video is playing, pause it and return to the playback position where the video has last been played.

### `play()`

Play the video. Nothing happens if the video is already playing.

If you play the video from a user gesture, pass the `SyntheticEvent` in as an argument so [browser autoplay restrictions do not apply](/docs/player/autoplay).

### `toggle()`

Pauses the video if it's playing. Plays the video if it's paused.

If you play the video from a user gesture, pass the `SyntheticEvent` in as an argument so [browser autoplay restrictions do not apply](/docs/player/autoplay).

### `getCurrentFrame()`

Gets the current position expressed as the current frame. Divide by the `fps` you passed to get the time in seconds.

### `isPlaying()`

_Available from v2.5.7_

Returns a boolean indicating whether the video is playing.

### `getContainerNode()`

_Available from v2.4.2_

Gets the container `HTMLDivElement` of the player. Useful if you'd like to manually attach listeners to the player element.

```tsx twoslash
import { PlayerRef } from "@remotion/player";
import { useEffect, useRef } from "react";
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

### `getScale()`

_available since v3.2.24_

Returns a number which says how much the content is scaled down compared to the natural composition size. For example, if the composition is `1920x1080`, but the player is 960px in width, this method would return `0.5`.

### `addEventListener()`

Start listening to an event. See the [Events](#events) section to see the function signature and the available events.

### `removeEventListener()`

Stop listening to an event. See the [Events](#events) section to see the function signature and the available events.

## Events

Using a [player ref](#playerref), you can bind event listeners to get notified of certain events of the player.

```tsx twoslash
import { PlayerRef } from "@remotion/player";
import { useEffect, useRef } from "react";
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
  playerRef.current.addEventListener("fullscreenchange", (e) => {
    console.log("fullscreenchange", e.detail.isFullscreen);
  });
}, []);
```

### `seeked`

Fired when the time position is changed by the user using the playback bar or using [`seek()`](#seek). You may get the current frame by reading it from `e.detail.frame`.

```tsx twoslash
import { PlayerRef } from "@remotion/player";
import { useRef } from "react";
const playerRef = useRef<PlayerRef>(null);
if (!playerRef.current) {
  throw new Error();
}
// ---cut---
playerRef.current.addEventListener("seeked", (e) => {
  console.log("seeked to " + e.detail.frame); // seeked to 120
});
```

This event fires on every single frame update. Prefer the [`timeupdate`](#timeupdate) event instead if the excessive rerenders cause slowdown.

This event is only fired during seeking. Use [`frameupdate`](#frameupdate) instead if you also want to get time updates during playback.

### `ended`

Fires when the video has ended and looping is disabled.

### `play`

Fires when the video has started playing or has resumed from a pause.

### `ratechange`

Fires when the [`playbackRate`](#playbackrate) has changed.

### `pause`

Fires when the video has paused or ended.

### `timeupdate`

Fires periodic time updates when the video is playing. Unlike the [`seeked`](#seeked) event, frames are skipped, and the event is throttled to only fire a few times a second at most every 250ms.

```tsx twoslash
import { PlayerRef } from "@remotion/player";
import { useRef } from "react";
const playerRef = useRef<PlayerRef>(null);
if (!playerRef.current) {
  throw new Error();
}
// ---cut---
playerRef.current.addEventListener("timeupdate", (e) => {
  console.log("current frame is " + e.detail.frame); // current frame is 120
});
```

Prefer the [`seeked`](#seeked) event if you only want to get time updates during seeking.

Prefer the [`frameupdate`](#frameupdate) event if you need an update for every single frame.

### `frameupdate`

_Available from v3.2.27_

Fires whenever the current time has changed, during both playback and seeking.

```tsx twoslash
import { PlayerRef } from "@remotion/player";
import { useRef } from "react";
const playerRef = useRef<PlayerRef>(null);
if (!playerRef.current) {
  throw new Error();
}
// ---cut---
playerRef.current.addEventListener("frameupdate", (e) => {
  console.log("current frame is " + e.detail.frame); // current frame is 120
});
```

Prefer the [`seeked`](#seeked) event if you only want to get time updates during seeking.

Prefer the [`timeupdate`](#timeupdate) event if you only need periodical updates (at most every 250ms).

### `fullscreenchange`

_Available from v3.2.0_

Fires when the player enters or exits fullscreen. By reading `e.detail.isFullscreen` or calling `playerRef.isFullscreen()` you can determine if the player is currently in fullscreen or not.

```tsx twoslash
import { PlayerRef } from "@remotion/player";
import { useRef } from "react";
const playerRef = useRef<PlayerRef>(null);
if (!playerRef.current) {
  throw new Error();
}
// ---cut---
playerRef.current.addEventListener("fullscreenchange", (e) => {
  console.log("is fullscreen" + e.detail.isFullscreen); // is fullscreen true
});
```

### `error`

Fires when an error or uncaught exception has happened in the video.

You may get the error by reading the `e.detail.error` value:

```tsx twoslash
import { PlayerRef } from "@remotion/player";
import { useRef } from "react";
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

You can customize the error message that is shown if a video crashes:

```tsx twoslash
import { ErrorFallback, Player } from "@remotion/player";
import { useCallback } from "react";
import { AbsoluteFill } from "remotion";

const Component: React.FC = () => null;

// ---cut---

const MyApp: React.FC = () => {
  // `ErrorFallback` type can be imported from "@remotion/player"
  const errorFallback: ErrorFallback = useCallback(({ error }) => {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "yellow",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Sorry about this! An error occurred: {error.message}
      </AbsoluteFill>
    );
  }, []);

  return (
    <Player
      fps={30}
      component={Component}
      durationInFrames={100}
      compositionWidth={1080}
      compositionHeight={1080}
      errorFallback={errorFallback}
    />
  );
};
```

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/player/src/Player.tsx)
- [`<Composition>`](/docs/composition)
- [`<Thumbnail>`](/docs/player/thumbnail)
