---
image: /generated/articles-docs-use-video-config.png
title: useVideoConfig()
id: use-video-config
crumb: "API"
---

With this hook, you can retrieve some info about the composition you are in.

## Example

```tsx twoslash
import React from "react";
import { useVideoConfig } from "remotion";

export const MyComp: React.FC = () => {
  const { width, height, fps, durationInFrames } = useVideoConfig();
  console.log(width); // 1920
  console.log(height); // 1080
  console.log(fps); // 30;
  console.log(durationInFrames); // 300

  return <div>Hello World!</div>;
};
```

## Return value

A object with the following properties:

### `width`

The width of the composition in pixels, or the `width` of a [`<Sequence>`](/docs/sequence) if the component that calls `useVideoConfig()` is a child of a [`<Sequence>`](/docs/sequence) that defines a width.

### `height`

The height of the composition in pixels, or the `height` of a [`<Sequence>`](/docs/sequence) if the component that calls `useVideoConfig()` is a child of a [`<Sequence>`](/docs/sequence) that defines a height.

### `fps`

The frame rate of the composition, in frames per seconds.

### `durationInFrames`

The duration of the composition in frames or the `durationInFrames` of a [`<Sequence>`](/docs/sequence) if the component that calls `useVideoConfig()` is a child of a [`<Sequence>`](/docs/sequence) that defines a `durationInFrames`.

### `id`

The ID of the composition. This is the same as the `id` prop of the [`<Composition>`](/docs/composition) component.

### `defaultProps`

The object that you have defined as the `defaultProps` in your composition.

### `props`<AvailableFrom v="4.0.0" />

The props that were passed to the composition, after [all transformations](/docs/props-resolution).

### `defaultCodec`<AvailableFrom v="4.0.54" />

The default codec that is used for rendering this composition. Use [`calculateMetadata()`](/docs/calculate-metadata) to modify it.

## See also

These properties are controlled by passing them as props to [`<Composition>`](/docs/composition). Read the page about [the fundamentals](/docs/the-fundamentals) to read how to setup a Remotion project.

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/use-video-config.ts)
- [useCurrentFrame()](/docs/use-current-frame)
