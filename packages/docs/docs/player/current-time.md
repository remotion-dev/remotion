---
image: /generated/articles-docs-player-current-time.png
id: current-time
sidebar_label: "Getting the current time"
title: "Displaying the current time"
slug: /player/current-time
crumb: "@remotion/player"
---

When rendering a [`<Player>`](/docs/player) in your app, special considerations must be taken to prevent constant re-renders of the app or [`<Player>`](/docs/player) if the time changes.

This is why the [`useCurrentFrame()`](/docs/use-current-frame) hook does not work outside a composition.

## Synchronizing a component with the Player time

If you want to display a component that synchronizes with the time of the player, for example the cursor of a timeline component or a custom time display, you can use the following hook:

```tsx twoslash title="use-current-player-frame.ts"
import { CallbackListener, PlayerRef } from "@remotion/player";
import React, { useSyncExternalStore } from "react";

export const useCurrentPlayerFrame = (ref: React.RefObject<PlayerRef>) => {
  const { current } = ref;

  const data = useSyncExternalStore<number>(
    (onStoreChange: (newVal: number) => void) => {
      if (!current) {
        return () => undefined;
      }
      const updater: CallbackListener<"frameupdate"> = ({ detail }) => {
        onStoreChange(detail.frame);
      };

      current.addEventListener("frameupdate", updater);
      return () => {
        current.removeEventListener("frameupdate", updater);
      };
    },
    () => ref.current?.getCurrentFrame() ?? 0,
    () => 0
  );

  return data;
};
```

## Usage example

Add a ref to a React Player and pass it to another component:

```tsx twoslash
// @allowUmdGlobalAccess
// @filename: ./remotion/MyVideo.tsx
export const MyVideo = () => <></>;
// @filename: ./remotion/TimeDisplay.tsx
export const TimeDisplay: React.FC<{
  playerRef: React.RefObject<PlayerRef>;
}> = () => <></>;

// @filename: index.tsx
// ---cut---
import { Player, PlayerRef } from "@remotion/player";
import { useRef } from "react";
import { MyVideo } from "./remotion/MyVideo";
import { TimeDisplay } from "./remotion/TimeDisplay";

export const App: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);

  return (
    <>
      <Player
        ref={playerRef}
        component={MyVideo}
        durationInFrames={120}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
      />
      <TimeDisplay playerRef={playerRef} />
    </>
  );
};
```

This is how a component could access the current time:

```tsx twoslash title="TimeDisplay.tsx"
// @filename: ./use-current-player-frame.ts
import { CallbackListener, PlayerRef } from "@remotion/player";
import React, { useSyncExternalStore } from "react";

export const useCurrentPlayerFrame = (ref: React.RefObject<PlayerRef>) => {
  const { current } = ref;

  const data = useSyncExternalStore<number>(
    (onStoreChange: (newVal: number) => void) => {
      if (!current) {
        return () => undefined;
      }
      const updater: CallbackListener<"frameupdate"> = ({ detail }) => {
        onStoreChange(detail.frame);
      };

      current.addEventListener("frameupdate", updater);
      return () => {
        current.removeEventListener("frameupdate", updater);
      };
    },
    () => ref.current?.getCurrentFrame() ?? 0,
    () => 0
  );

  return data;
};

// @filename: TimeDisplay.tsx
// ---cut---
import { useCurrentPlayerFrame } from "./use-current-player-frame";
import type {PlayerRef} from '@remotion/player'
import React from 'react';

export const TimeDisplay: React.FC<{
  playerRef: React.RefObject<PlayerRef>;
}> = ({ playerRef }) => {
  const frame = useCurrentPlayerFrame(playerRef);

  return <div>current frame: {frame}</div>;
};
```

This approach is efficient, because only the video itself and the component relying on the time are re-rendering, but the `<App>` component is not.