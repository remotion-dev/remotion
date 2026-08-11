---
image: /generated/articles-docs-the-fundamentals.png
id: the-fundamentals
title: The fundamentals
crumb: Getting started
---

## React components

```twoslash include example
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const MyComposition = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontSize: 100,
        backgroundColor: "white",
      }}
    >
      The current frame is {frame}.
    </AbsoluteFill>
  );
};
// - MyComposition
```

The idea of Remotion is to give you a frame number and a blank canvas, to which you can render anything you want using [React](https://react.dev). This is an example React component that renders the current frame as text:

```tsx twoslash title="MyComposition.tsx"
// @include: example-MyComposition
```

A video is a function of images over time. If you change content every frame, you'll end up with an animation.

## Video properties

A video has 4 properties:

- `width` in pixels.
- `height` in pixels.
- `durationInFrames`: the total number of frames in the video.
- `fps`: framerate of the video.

You can obtain these values from the [`useVideoConfig()`](/docs/use-video-config) hook:

```tsx twoslash
import {AbsoluteFill, useVideoConfig} from 'remotion';

export const MyComposition = () => {
  const {fps, durationInFrames, width, height} = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 60,
        backgroundColor: 'white',
      }}
    >
      This {width}x{height}px video is {durationInFrames / fps} seconds long.
    </AbsoluteFill>
  );
};
```

:::note
A video's first frame is `0` and its last frame is `durationInFrames - 1`.
:::

## Compositions

A composition is the combination of a React component and video metadata.

By rendering a [`<Composition>`](/docs/composition) component in `src/Root.tsx`, you can register a renderable video and make it visible in the Remotion sidebar.

```tsx twoslash title="src/Root.tsx"
import {Composition} from 'remotion';
// @include: example-MyComposition
// ---cut---

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyComposition"
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      component={MyComposition}
    />
  );
};
```

:::note
You can register multiple compositions in `src/Root.tsx` by wrapping them in a React Fragment:  
`<><Composition/><Composition/></>`. See also: [How to combine compositions?](/docs/miscellaneous/snippets/combine-compositions)
:::
