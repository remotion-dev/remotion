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

Remember that you control these properties by passing them as props to `<Composition>`. Read the page about [the fundamentals](/docs/the-fundamentals) to learn how to define a composition.

## See also

- [useCurrentFrame()](/docs/use-current-frame)
