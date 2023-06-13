---
image: /generated/articles-docs-troubleshooting-video-flicker.png
id: player-flicker
title: "Avoiding flickering in <Player>"
crumb: "Frame-perfection"
---

Consider the following markup:

```tsx twoslash title="MyComponent.tsx"
import { AbsoluteFill, Sequence, Video } from "remotion";

const MyComponent: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={120}>
        <Video src="https://example.com/video1.mp4" />
      </Sequence>
      <Sequence from={120} durationInFrames={120}>
        <Video src="https://example.com/video2.mp4" />
      </Sequence>
    </AbsoluteFill>
  );
};
```

Since Remotion is only aware of the current frame, the video with the source `video2.mp4` will only start loading once it starts appearing in the scene. This can lead to an effect in the Player where some frames will be empty, since the loading of the video will usually not complete immediately.

This is a design tradeoff of Remotion, but can be fought with different levels of aggression.

## Strategies

<strong><Step>1</Step>Option 1: Ignore</strong><br/>

It should be mentioned that this effect is only happening in the Remotion Studio and the Remotion Player, and will not appear in the rendered video. If you are only looking for a frame-perfect rendered video, you do not need to take additional steps.

<strong><Step>2</Step>Option 2: Pause the <code>{"<Player/>"}</code> when media is buffering</strong><br/>

You may want to pause the `<Player>` temporarily to allow loading of the assets and resume once the assets are ready for playback. [See here](/docs/buffer-state) for how to implement this.

<strong><Step>3</Step>Option 3: Preloading to avoid network request</strong><br/>

You may signal to the browser to preload videos and other assets, so that when the embedded element appears in the video, it can save the network request.

See [Preloading](/docs/player/preloading) for instructions on how to achieve this.

The signal that you give to the browser may be ignored, for example if the device has data saver or battery saver mode enabled. This is specifically a concern for mobile devices.

<strong><Step>4</Step>Option 4: Prefetching as blob URL to more aggressively avoid network request</strong><br/>

By [prefetching](/docs/prefetch) an asset, it will be downloaded and cached into memory. Unlike preloading, you force the browser to download the asset, however, you can only use the loaded asset once it has fully downloaded.

<strong><Step>5</Step>Option 5: Prefetching as Base64 to avoid network request and local HTTP server</strong><br/>

In Safari prefetching as described in <InlineStep>4</InlineStep> is not enough, since the Blob URL will be saved to disk and a slight delay may still occur even if the asset is pre-saved.

Alternatively, the [`prefetch()`](/docs/prefetch) function allows to fetch an asset and save it in memory as Base64, which does not require the blob URL to be loaded from disk through HTTP.

<strong><Step>6</Step>Option 6: Premounting the video</strong><br/>

As the most aggressive strategy, you can pre-mount a video to already trigger decoding of the video. Use the following component to pre-mount a video:

```tsx twoslash title="Premount.tsx"
import React, { useContext, useMemo } from "react";
import { Internals, TimelineContextValue } from "remotion";

type PremountProps = {
  for: number;
  children: React.ReactNode;
};

export const Premount: React.FC<PremountProps> = ({
  for: premountFor,
  children,
}) => {
  const sequenceContext = useContext(Internals.SequenceContext);
  if (typeof premountFor === "undefined") {
    throw new Error(
      `The <Premount /> component requires a 'for' prop, but none was passed.`
    );
  }

  if (typeof premountFor !== "number") {
    throw new Error(
      `The 'for' prop of <Premount /> must be a number, but is of type ${typeof premountFor}`
    );
  }

  if (Number.isNaN(premountFor)) {
    throw new Error(
      `The 'for' prop of <Premount /> must be a real number, but it is NaN.`
    );
  }

  if (!Number.isFinite(premountFor)) {
    throw new Error(
      `The 'for' prop of <Premount /> must be a finite number, but it is ${premountFor}.`
    );
  }

  const context = useContext(Internals.Timeline.TimelineContext);
  const value: TimelineContextValue = useMemo(() => {
    const contextOffset = sequenceContext
      ? sequenceContext.cumulatedFrom + sequenceContext.relativeFrom
      : 0;

    const currentFrame = context.frame - contextOffset;
    return {
      ...context,
      playing: currentFrame < premountFor ? false : context.playing,
      imperativePlaying: {
        current:
          currentFrame < premountFor
            ? false
            : context.imperativePlaying.current,
      },
      frame: Math.max(0, currentFrame - premountFor) + contextOffset,
    };
  }, [context, premountFor, sequenceContext]);

  return (
    <Internals.Timeline.TimelineContext.Provider value={value}>
      {children}
    </Internals.Timeline.TimelineContext.Provider>
  );
};
```

The following usage would make the video mount 60 frames before it appears in the scene:

```tsx twoslash title="MyComponent.tsx"
import React, { useContext, useMemo } from "react";
import { Internals, TimelineContextValue } from "remotion";

type PremountProps = {
  for: number;
  children: React.ReactNode;
};

export const Premount: React.FC<PremountProps> = ({
  for: premountFor,
  children,
}) => {
  const sequenceContext = useContext(Internals.SequenceContext);
  if (typeof premountFor === "undefined") {
    throw new Error(
      `The <Premount /> component requires a 'for' prop, but none was passed.`
    );
  }

  if (typeof premountFor !== "number") {
    throw new Error(
      `The 'for' prop of <Premount /> must be a number, but is of type ${typeof premountFor}`
    );
  }

  if (Number.isNaN(premountFor)) {
    throw new Error(
      `The 'for' prop of <Premount /> must be a real number, but it is NaN.`
    );
  }

  if (!Number.isFinite(premountFor)) {
    throw new Error(
      `The 'for' prop of <Premount /> must be a finite number, but it is ${premountFor}.`
    );
  }

  const context = useContext(Internals.Timeline.TimelineContext);
  const value: TimelineContextValue = useMemo(() => {
    const contextOffset = sequenceContext
      ? sequenceContext.cumulatedFrom + sequenceContext.relativeFrom
      : 0;

    const currentFrame = context.frame - contextOffset;
    return {
      ...context,
      playing: currentFrame < premountFor ? false : context.playing,
      imperativePlaying: {
        current:
          currentFrame < premountFor
            ? false
            : context.imperativePlaying.current,
      },
      frame: Math.max(0, currentFrame - premountFor) + contextOffset,
    };
  }, [context, premountFor, sequenceContext]);

  return (
    <Internals.Timeline.TimelineContext.Provider value={value}>
      {children}
    </Internals.Timeline.TimelineContext.Provider>
  );
};
// ---cut---
import { AbsoluteFill, Sequence, Video } from "remotion";

const MyComponent: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={120}>
        <Video src="https://example.com/video1.mp4" />
      </Sequence>
      <Sequence from={60} durationInFrames={180}>
        <Premount for={60}>
          <Video src="https://example.com/video2.mp4" />
        </Premount>
      </Sequence>
    </AbsoluteFill>
  );
};
```

You are responsible yourself for making the video invisible while it is being pre-mounted.

## See also

- [Preloading assets](/docs/player/preloading)
- [Displaying a buffer state](/docs/buffer-state)
- [`prefetch()`](/docs/prefetch)
- [`@remotion/preload` vs `prefetch()`](/docs/player/preloading#remotionpreload-vs-prefetch)
- [`preloadVideo()`](/docs/preload/preload-video)
- [Flickering (during rendering)](/docs/flickering)
