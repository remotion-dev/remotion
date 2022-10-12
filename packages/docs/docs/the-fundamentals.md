---
id: the-fundamentals
title: The fundamentals
---

```twoslash include example
import { useCurrentFrame, AbsoluteFill } from "remotion";

export const MyComposition = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontSize: 100,
        backgroundColor: "white"
      }}
    >
      The current frame is {frame}.
    </AbsoluteFill>
  );
};
// - MyComposition
```

The basic idea behind Remotion is that we'll give you a frame number and a blank canvas, and the freedom to render anything you want using [React](https://reactjs.org).

```tsx twoslash
// @include: example-MyComposition
```

A video is a function of images over time. If you change content every frame, you'll end up with an animation.

## Video properties

A video has 4 properties:

- `width` in pixels.
- `height` in pixels.
- `durationInFrames`: The number of frames which the video is long.
- `fps`: Frames per second. The duration in frames divided by FPS results in the duration in seconds.

These properties are variable and you can reuse a component multiple times with different properties.  
Rather than hardcoding these values, we can derive them from the [`useVideoConfig()`](/docs/use-video-config) hook:

```tsx twoslash
import { AbsoluteFill, useVideoConfig } from "remotion";

export const MyComposition = () => {
  const { fps, durationInFrames, width, height } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontSize: 60,
        backgroundColor: "white",
      }}
    >
      This {width}x{height}px video is {durationInFrames / fps} seconds long.
    </AbsoluteFill>
  );
};
```

A video's first frame is `0` and it's last frame is `durationInFrames - 1`.

## Defining compositions

Using a [composition](/docs/terminology#composition) you can define a video that should be rendered.

You define a composition by rendering a [`<Composition>`](/docs/composition) component in `src/Video.tsx`, giving it an `id`, defining values for its `height`, `width`, `fps` and `durationInFrames`, and passing a React component to `component`.

```tsx twoslash title="src/Video.tsx"
import { Composition } from "remotion";
// @include: example-MyComposition
// ---cut---

export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComposition"
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        component={MyComposition}
      />
    </>
  );
};
```

You can render as many compositions as you like in `src/Video.tsx`.
