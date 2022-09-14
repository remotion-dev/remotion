---
id: the-fundamentals
title: The fundamentals
---

```twoslash include example
import { useCurrentFrame } from "remotion";

export const MyVideo = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        fontSize: "7em",
      }}
    >
      The current frame is {frame}.
    </div>
  );
};
// - MyVideo
```

The basic idea behind Remotion is that we'll give you a frame number and a blank canvas, and the freedom to render anything you want using **[React](https://reactjs.org)**.

```tsx twoslash
// @include: example-MyVideo
```

A video is a function of images over time. If you change content every frame, you'll end up with an animation.

## Video properties

A video has 4 properties:

- `width` and `height` in pixels.
- `durationInFrames`: The number of frames which the video is long.
- `fps`: The amount of frames per second. The duration in frames divided by FPS results in the duration in seconds.

These properties are variable and you can reuse a component multiple times with different properties. This is why you better not hard-code these properties, but instead derive them from the [`useVideoConfig()`](/docs/use-video-config) hook:

```tsx twoslash
import { useVideoConfig } from "remotion";

export const MyVideo = () => {
  const { fps, durationInFrames, width, height } = useVideoConfig();

  return (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        fontSize: "7em",
       }}
      >
      This {width}px x {height}px video is {durationInFrames / fps} seconds long.
    </div>
  );
};
```

A video's first frame is `0` and it's last frame is `durationInFrames - 1`.

## Defining compositions

Compositions are components with the above mentioned metadata. You can define compositions in `src/Video.tsx` to make them show up in the left sidebar.

```tsx twoslash
import { Composition } from "remotion";
// @include: example-MyVideo
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
        // Optionally, you can define props that get passed to the component
        defaultProps={{ hello: "world" }}
      />
    </>
  );
};
```

Remember that if you like, you can register multiple compositions that rely on the same component. For example, if you like to make a square video for social media feeds, and a portrait video for Stories, you can reuse the component and try to make it 'responsive'.

Besides the [`<Composition />`](/docs/composition) component, you can also use a [`<Still />`](/docs/still) component and define a still image rather than a video.
