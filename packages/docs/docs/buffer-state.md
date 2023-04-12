---
title: Display a buffer state
---

In your [`<Player>`](/docs/player), you might have videos and other assets that might take some time to load after they enter the scene.
You can [preload those assets](/docs/player/preload), but sometimes browser policies prevent preloading and [a brief flash may still be possible](/docs/troubleshooting/player-flicker) while the browser needs to decode the video before playing.

In this case, you might want to pause the Player if media is loading and show a spinner, and unpause the video once the media is ready to play.

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
    [sendEvents]
  );

  const needsToBuffer = useCallback(
    (id: string) => {
      bufferState.current[id] = true;
      sendEvents();
    },
    [sendEvents]
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
    [sendEvents]
  );

  const needsToBuffer = useCallback(
    (id: string) => {
      bufferState.current[id] = true;
      sendEvents();
    },
    [sendEvents]
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

  return <Video {...props} ref={videoRef} src={src}></Video>;
};

export const PausableVideo = forwardRef(PausableVideoFunction);
```

If you are using `<OffthreadVideo>` instead, [use this technique](/docs/miscellaneous/snippets/offthread-video-while-rendering) to use `<OffthreadVideo>` only during rendering to avoid the limitation that `<OffthreadVideo>` cannot have a ref attached to it.
