---
image: /generated/articles-docs-buffer-state.png
title: Display a buffer state
crumb: Building video apps
---

:::warning
Since Remotion v4.0.111, Remotion has a [native buffer state](/docs/player/buffer-state). The technique described on this page should only be used for older versions of Remotion.
:::

In your [`<Player>`](/docs/player), you might have videos and other assets that might take some time to load after they enter the scene.
You can [preload those assets](/docs/player/preloading), but sometimes browser policies prevent preloading and [a brief flash is possible](/docs/troubleshooting/player-flicker) while the browser needs to decode the video before playing.

In this case, you might want to pause the Player if media is loading and show a spinner, and unpause the video once the media is ready to play. This can be implemented using regular Web APIs and React primitives.

## Reference application

Visit this [GitHub repo](https://github.com/remotion-dev/video-buffering-example) to see a fully functioning example of this technique.

## Implementing a buffer state

We create a new React Context that can handle the buffering states of media inside our Player. We implement default functions that do nothing, since no buffer state is necessary during rendering.

```tsx title="BufferManager.tsx"
import { createContext } from "react";

type BufferState = { [key: string]: boolean };

type BufferContextType = {
  canPlay: (id: string) => void;
  needsToBuffer: (id: string) => void;
};

export const BufferContext = createContext<BufferContextType>({
  // By default, do nothing if the context is not set, for example in rendering
  canPlay: () => {},
  needsToBuffer: () => {},
});
```

The following component can be wrapped around the Player to provide it with the `onBuffer` and `onContinue` functions. By using a context, we don't have to pass those functions as props to every media element, even though it is also possible.

If one media element is buffering, it can register that to the manager using `onBuffer()`. If all media elements are loaded, the buffer manager will call the `onContinue()` event.

```tsx twoslash title="BufferManager.tsx"
import { createContext } from "react";

type BufferState = { [key: string]: boolean };

type BufferContextType = {
  canPlay: (id: string) => void;
  needsToBuffer: (id: string) => void;
};

export const BufferContext = createContext<BufferContextType>({
  // By default, do nothing if the context is not set, for example in rendering
  canPlay: () => {},
  needsToBuffer: () => {},
});

// ---cut---
import { useCallback, useMemo, useRef } from "react";

export const BufferManager: React.FC<{
  children: React.ReactNode;
  onBuffer: () => void;
  onContinue: () => void;
}> = ({ children, onBuffer, onContinue }) => {
  const bufferState = useRef<BufferState>({});
  const currentState = useRef(false);

  const sendEvents = useCallback(() => {
    let previousState = currentState.current;
    currentState.current = Object.values(bufferState.current).some(Boolean);

    if (currentState.current && !previousState) {
      onBuffer();
    } else if (!currentState.current && previousState) {
      onContinue();
    }
  }, [onBuffer, onContinue]);

  const canPlay = useCallback(
    (id: string) => {
      bufferState.current[id] = false;
      sendEvents();
    },
    [sendEvents],
  );

  const needsToBuffer = useCallback(
    (id: string) => {
      bufferState.current[id] = true;
      sendEvents();
    },
    [sendEvents],
  );

  const bufferEvents = useMemo(() => {
    return {
      canPlay,
      needsToBuffer,
    };
  }, [canPlay, needsToBuffer]);

  return (
    <BufferContext.Provider value={bufferEvents}>
      {children}
    </BufferContext.Provider>
  );
};
```

## Making the `<Video>` report buffering

The following component `<PausableVideo>` wraps the `<Video>` tag, so that you can use it instead of it. It grabs the context we have defined beforehand and reports buffering and resuming of the video to the `BufferManager`.

```tsx twoslash title="PausableVideo.tsx"
// @filename: BufferManager.tsx

import React, { createContext, useCallback, useMemo, useRef } from "react";

type BufferState = { [key: string]: boolean };

type BufferContextType = {
  canPlay: (id: string) => void;
  needsToBuffer: (id: string) => void;
};

export const BufferContext = createContext<BufferContextType>({
  // By default, do nothing if the context is not set, for example in rendering
  canPlay: () => {},
  needsToBuffer: () => {},
});

export const BufferManager: React.FC<{
  children: React.ReactNode;
  onBuffer: () => void;
  onContinue: () => void;
}> = ({ children, onBuffer, onContinue }) => {
  const bufferState = useRef<BufferState>({});
  const currentState = useRef(false);

  const sendEvents = useCallback(() => {
    let previousState = currentState.current;
    currentState.current = Object.values(bufferState.current).some(Boolean);

    if (currentState.current && !previousState) {
      onBuffer();
    } else if (!currentState.current && previousState) {
      onContinue();
    }
  }, [onBuffer, onContinue]);

  const canPlay = useCallback(
    (id: string) => {
      bufferState.current[id] = false;
      sendEvents();
    },
    [sendEvents],
  );

  const needsToBuffer = useCallback(
    (id: string) => {
      bufferState.current[id] = true;
      sendEvents();
    },
    [sendEvents],
  );

  const bufferEvents = useMemo(() => {
    return {
      canPlay,
      needsToBuffer,
    };
  }, [canPlay, needsToBuffer]);

  return (
    <BufferContext.Provider value={bufferEvents}>
      {children}
    </BufferContext.Provider>
  );
};
// organize-imports-ignore
// @filename: PausableVideo.tsx
// ---cut---
import React, {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react";
import { RemotionMainVideoProps, RemotionVideoProps, Video } from "remotion";
import { BufferContext } from "./BufferManager";

const PausableVideoFunction: React.ForwardRefRenderFunction<
  HTMLVideoElement,
  RemotionVideoProps & RemotionMainVideoProps
> = ({ src, ...props }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const id = useId();

  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

  const { canPlay, needsToBuffer } = useContext(BufferContext);

  useEffect(() => {
    const { current } = videoRef;
    if (!current) {
      return;
    }

    const onPlay = () => {
      canPlay(id);
    };

    const onBuffer = () => {
      needsToBuffer(id);
    };

    current.addEventListener("canplay", onPlay);
    current.addEventListener("waiting", onBuffer);

    return () => {
      current.removeEventListener("canplay", onPlay);
      current.removeEventListener("waiting", onBuffer);

      // If component is unmounted, unblock the buffer manager
      canPlay(id);
    };
  }, [canPlay, id, needsToBuffer]);

  return <Video {...props} ref={videoRef} src={src} />;
};

export const PausableVideo = forwardRef(PausableVideoFunction);
```

If you are using `<OffthreadVideo>` instead, you cannot have a ref attached to it.  
[Use this technique](/docs/miscellaneous/snippets/offthread-video-while-rendering) to use `<OffthreadVideo>` only during rendering.

Replace `<Video>` elements in your Remotion component with `<PausableVideoFunction>` to make them report buffering state.

## Pause video and display loading UI

Wrap your Player in the newly created `<BufferManager>`. Create two functions `onBuffer` and `onContinue` that implement what should happen if the video goes into a buffering state. Pass them to the `<BufferManager>`.

In this example, a ref is being used to track whether the video was paused due to buffering, so that the video will only be resumed in that case.  
By using a ref, we eliminate the risk of asynchronous React state leading to a race condition.

```tsx twoslash title="App.tsx" {6-28,30,38}
// @filename: BufferManager.tsx
import { createContext } from "react";

type BufferState = { [key: string]: boolean };

type BufferContextType = {
  canPlay: (id: string) => void;
  needsToBuffer: (id: string) => void;
};

export const BufferContext = createContext<BufferContextType>({
  // By default, do nothing if the context is not set, for example in rendering
  canPlay: () => {},
  needsToBuffer: () => {},
});

// ---cut---
import React, { useCallback, useMemo, useRef } from "react";

export const BufferManager: React.FC<{
  children: React.ReactNode;
  onBuffer: () => void;
  onContinue: () => void;
}> = ({ children, onBuffer, onContinue }) => {
  const bufferState = useRef<BufferState>({});
  const currentState = useRef(false);

  const sendEvents = useCallback(() => {
    let previousState = currentState.current;
    currentState.current = Object.values(bufferState.current).some(Boolean);

    if (currentState.current && !previousState) {
      onBuffer();
    } else if (!currentState.current && previousState) {
      onContinue();
    }
  }, [onBuffer, onContinue]);

  const canPlay = useCallback(
    (id: string) => {
      bufferState.current[id] = false;
      sendEvents();
    },
    [sendEvents],
  );

  const needsToBuffer = useCallback(
    (id: string) => {
      bufferState.current[id] = true;
      sendEvents();
    },
    [sendEvents],
  );

  const bufferEvents = useMemo(() => {
    return {
      canPlay,
      needsToBuffer,
    };
  }, [canPlay, needsToBuffer]);

  return (
    <BufferContext.Provider value={bufferEvents}>
      {children}
    </BufferContext.Provider>
  );
};

// @filename: App.tsx
const MyComp: React.FC = () => null;

// organize-imports-ignore
// ---cut---
import { Player, PlayerRef } from "@remotion/player";
import React, { useState, useRef, useCallback } from "react";
import { BufferManager } from "./BufferManager";

function App() {
  const playerRef = useRef<PlayerRef>(null);
  const [buffering, setBuffering] = useState(false);
  const pausedBecauseOfBuffering = useRef(false);

  const onBuffer = useCallback(() => {
    setBuffering(true);

    playerRef.current?.pause();
    pausedBecauseOfBuffering.current = true;
  }, []);

  const onContinue = useCallback(() => {
    setBuffering(false);

    // Play only if we paused because of buffering
    if (pausedBecauseOfBuffering.current) {
      pausedBecauseOfBuffering.current = false;
      playerRef.current?.play();
    }
  }, []);

  return (
    <BufferManager onBuffer={onBuffer} onContinue={onContinue}>
      <Player
        ref={playerRef}
        component={MyComp}
        compositionHeight={720}
        compositionWidth={1280}
        durationInFrames={200}
        fps={30}
        controls
      />
    </BufferManager>
  );
}

export default App;
```

In addition to pausing the video, you can also display custom UI that will overlay the video while it is buffering. Usually, you would display a branded spinner, in this simplified example, we are showing a ⏳ emoji.

```tsx twoslash title="App.tsx" {1, 8-25,34-36}
const MyComp = () => null;
// ---cut---
import { Player, RenderPoster } from "@remotion/player";
import { useCallback, useState } from "react";
import { AbsoluteFill } from "remotion";

function App() {
  const [buffering, setBuffering] = useState();

  // Add this to your component rendering the <Player>
  const renderPoster: RenderPoster = useCallback(() => {
    if (buffering) {
      return (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            fontSize: 100,
          }}
        >
          ⏳
        </AbsoluteFill>
      );
    }

    return null;
  }, [buffering]);

  return (
    <Player
      fps={30}
      component={MyComp}
      compositionHeight={720}
      compositionWidth={1280}
      durationInFrames={200}
      // Add these two props to the Player
      showPosterWhenPaused
      renderPoster={renderPoster}
    />
  );
}
```

## See also

- [Preloading assets](/docs/player/preloading)
- [Avoiding flickering in the `<Player>`](/docs/troubleshooting/player-flicker)
