---
image: /generated/articles-docs-player-player-examples.png
id: examples
sidebar_label: "Examples"
title: "Examples for @remotion/player"
crumb: "@remotion/player"
---

## Bare example

```tsx twoslash
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

## Adding controls

```tsx twoslash {12}
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
      controls
    />
  );
};
```

## Loop video

```tsx twoslash {13}
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
      controls
      loop
    />
  );
};
```

## Changing size

```tsx twoslash {14-17}
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
      controls
      loop
      style={{
        width: 1280,
        height: 720,
      }}
    />
  );
};
```

:::note
See [Scaling](/docs/player/scaling) for more ways to scale the Player.
:::

## Adding autoplay

```tsx twoslash {18}
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
      controls
      loop
      style={{
        width: 1280,
        height: 720,
      }}
      autoPlay
    />
  );
};
```

:::tip
You need to be wary of the browser's autoplay policy. In most browsers, you cannot autoplay an audio file or a video with audio.
:::

## Programmatically control the player

```tsx twoslash {1, 6-15, 18}
// @allowUmdGlobalAccess
// @filename: ./remotion/MyVideo.tsx
export const MyVideo = () => <></>;

// @filename: index.tsx
// ---cut---
import { Player, PlayerRef } from "@remotion/player";
import { useCallback, useRef } from "react";
import { MyVideo } from "./remotion/MyVideo";

export const App: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);

  const seekToMiddle = useCallback(() => {
    const { current } = playerRef;
    if (!current) {
      return;
    }
    current.seekTo(60);
  }, []);

  return (
    <Player
      ref={playerRef}
      component={MyVideo}
      durationInFrames={120}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
    />
  );
};
```

## Listen to events

```tsx twoslash {1, 6-21, 25}
// @allowUmdGlobalAccess
// @filename: ./remotion/MyVideo.tsx
export const MyVideo = () => <></>;

// @filename: index.tsx
// ---cut---
import { Player, PlayerRef } from "@remotion/player";
import { useEffect, useRef } from "react";
import { MyVideo } from "./remotion/MyVideo";

export const App: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    const { current } = playerRef;
    if (!current) {
      return;
    }

    const listener = () => {
      console.log("paused");
    };
    current.addEventListener("pause", listener);
    return () => {
      current.removeEventListener("pause", listener);
    };
  }, []);

  return (
    <Player
      ref={playerRef}
      component={MyVideo}
      durationInFrames={120}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
    />
  );
};
```

## Interactive player

```tsx twoslash {6-7, 16-18}
// @allowUmdGlobalAccess
// @filename: ./remotion/MyVideo.tsx
export const MyVideo = () => <></>;

// @filename: index.tsx
// ---cut---
import { Player } from "@remotion/player";
import { useState, useMemo } from "react";
import { MyVideo } from "./remotion/MyVideo";

export const App: React.FC = () => {
  // Connect the state to a text field
  const [text, setText] = useState("world");
  const inputProps = useMemo(() => {
    return {
      text,
    };
  }, [text]);

  return (
    <Player
      component={MyVideo}
      durationInFrames={120}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      inputProps={inputProps}
    />
  );
};
```

## Only play a portion of a video

```tsx twoslash {13-14}
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
      loop
      inFrame={30}
      outFrame={60}
    />
  );
};
```

## Loading a component lazily

```tsx twoslash
// @allowUmdGlobalAccess
// @filename: ./remotion/MyVideo.tsx
export default () => <></>;

// @filename: index.tsx
// ---cut---
import { Player } from "@remotion/player";
import { useCallback } from "react";

export const App: React.FC = () => {
  const lazyComponent = useCallback(() => {
    return import("./remotion/MyVideo");
  }, []);

  return (
    <Player
      lazyComponent={lazyComponent}
      durationInFrames={120}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      loop
    />
  );
};
```

## See also

- [Snippet: Embedding a `<Player>` in an iframe](/docs/miscellaneous/snippets/player-in-iframe)
