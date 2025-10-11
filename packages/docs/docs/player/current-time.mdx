---
image: /generated/articles-docs-player-current-time.png
id: current-time
sidebar_label: 'Getting the current time'
title: 'Displaying the current time'
slug: /player/current-time
crumb: '@remotion/player'
---

When rendering a [`<Player>`](/docs/player) in your app, special considerations must be taken to prevent constant re-renders of the app or [`<Player>`](/docs/player) if the time changes.

This is why the [`useCurrentFrame()`](/docs/use-current-frame) hook does not work outside a composition.

:::warning
Do not put this hook into the same component in which the `<Player>` is rendered, otherwise you'll see constant re-renders. Instead, put it inside a component that is rendered adjacent to the component in which the Player is rendered.
:::

## Synchronizing a component with the Player time

If you want to display a component that synchronizes with the time of the player, for example the cursor of a timeline component or a custom time display, you can use the following hook:

```tsx twoslash title="use-current-player-frame.ts"
import {CallbackListener, PlayerRef} from '@remotion/player';
import {useCallback, useSyncExternalStore} from 'react';

export const useCurrentPlayerFrame = (
  ref: React.RefObject<PlayerRef | null>,
) => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const {current} = ref;
      if (!current) {
        return () => undefined;
      }
      const updater: CallbackListener<'frameupdate'> = ({detail}) => {
        onStoreChange();
      };
      current.addEventListener('frameupdate', updater);
      return () => {
        current.removeEventListener('frameupdate', updater);
      };
    },
    [ref],
  );

  const data = useSyncExternalStore<number>(
    subscribe,
    () => ref.current?.getCurrentFrame() ?? 0,
    () => 0,
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
  playerRef: React.RefObject<PlayerRef | null>;
}> = () => <></>;

// @filename: index.tsx
// ---cut---
import {Player, PlayerRef} from '@remotion/player';
import {useRef} from 'react';
import {MyVideo} from './remotion/MyVideo';
import {TimeDisplay} from './remotion/TimeDisplay';

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
import {CallbackListener, PlayerRef} from '@remotion/player';
import {useCallback, useSyncExternalStore} from 'react';

export const useCurrentPlayerFrame = (
  ref: React.RefObject<PlayerRef | null>,
) => {
  const subscribe = useCallback(
    (onStoreChange: (newVal: number) => void) => {
      const {current} = ref;
      if (!current) {
        return () => undefined;
      }
      const updater: CallbackListener<'frameupdate'> = ({detail}) => {
        onStoreChange(detail.frame);
      };
      current.addEventListener('frameupdate', updater);
      return () => {
        current.removeEventListener('frameupdate', updater);
      };
    },
    [ref],
  );

  const data = useSyncExternalStore<number>(
    subscribe,
    () => ref.current?.getCurrentFrame() ?? 0,
    () => 0,
  );

  return data;
};

// @filename: TimeDisplay.tsx
// ---cut---
import React from 'react';
import {PlayerRef} from '@remotion/player';
import {useCurrentPlayerFrame} from './use-current-player-frame';

export const TimeDisplay: React.FC<{
  playerRef: React.RefObject<PlayerRef | null>;
}> = ({playerRef}) => {
  const frame = useCurrentPlayerFrame(playerRef);

  return <div>current frame: {frame}</div>;
};
```

This approach is efficient, because only the video itself and the component relying on the time are re-rendering, but the `<App>` component is not.
