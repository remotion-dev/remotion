---
title: useVideoConfig()
id: use-video-config
---

With this hook, you can retrieve some info about the context of the video that you are making.
Namely, `useVideoConfig` will return an object with the following properties:

- `width`: The width of the composition in pixels.
- `height`: The height of the composition in pixels.
- `fps`: The frame rate of the composition, in frames per seconds.
- `durationInFrames` The duration of the composition in frames.
- `id`: The composition ID.
- `defaultProps`: The object that you have defined as the `defaultProps` in your composition.

These properties are controlled by passing them as props to [`<Composition>`](/docs/composition). Read the page about [the fundamentals](/docs/the-fundamentals) to read how to setup a Remotion project.

### Example

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

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/use-video-config.ts)
- [useCurrentFrame()](/docs/use-current-frame)
