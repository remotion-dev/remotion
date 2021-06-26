---
id: the-fundamentals
title: The fundamentals
---

```twoslash include sample
import { useCurrentFrame } from "remotion";

export const MyVideo = () => {
  const frame = useCurrentFrame();

  return (
    <div style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      The current frame is {frame}.
    </div>
  );
};
// - MyVideo
```

The basic idea behind Remotion is that you get a frame number and blank canvas to render anything you want.

You express those ideas using **[React](https://reactjs.org)**.

```tsx twoslash
// @include: sample-MyVideo
```

## Video properties

A video has 4 properties:

- `width` and `height` in pixels.
- `durationInFrames`: The number of frames which the video is long.
- `fps`: The amount of frames per second. The duration in frames divided by FPS results in the duration in seconds.

These properties are variable and you can reuse a component multiple times with different properties. This is why you better not hard-code these properties, but instead derive them from the `useVideoConfig` hook:

```tsx twoslash
import { useVideoConfig } from "remotion";

export const MyVideo = () => {
  const { fps, durationInFrames, width, height } = useVideoConfig();

  return (
    <div style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      This video is {durationInFrames / fps} seconds long.
    </div>
  );
};
```

A video's first frame is `0` and it's last frame is `durationInFrames - 1`.

## Defining compositions

Compositions are components with the above mentioned metadata. You can define compositions in `src/Video.tsx` to make them show up in the left sidebar.

```tsx twoslash
import { Composition } from "remotion"
// @include: sample-MyVideo
// ---cut---

export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
```

Remember that if you like, you can register multiple compositions that rely on the same component. For example, if you like to make a square video for social media feeds, and a portrait video for Stories, you can reuse the component and try to make it 'responsive'.
