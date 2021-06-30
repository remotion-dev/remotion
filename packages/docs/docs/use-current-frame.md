---
title: useCurrentFrame()
id: use-current-frame
---

With this hook, you can retrieve the current frame of the video. Frames are 0-indexed, meaning the first frame is `0`, the last frame is the duration of the composition in frames minus one. To learn more about how Remotion works with time, read the page about [the fundamentals](/docs/the-fundamentals).

If the component you are writing is wrapped in a `<Sequence>`, `useCurrentFrame` will return the frame relative to when the Sequence starts.

Say the timeline marker is positioned at frame 25. In the example below, `useCurrentFrame` will return `20`, except within the Subtitle component, where it will return `15` because it is within a sequence that starts at frame 10.

```tsx twoslash
import {useCurrentFrame, Sequence} from 'remotion';

const Title = () => {
  const frame = useCurrentFrame(); // 25
  return (
    <div>{frame}</div>
  )
}

const Subtitle = () => {
  const frame = useCurrentFrame(); // 15
  return (
    <div>{frame}</div>
  )
}

const MyVideo = () => {
  const frame = useCurrentFrame(); // 25

  return (
    <div>
      <Title />
      <Sequence from={10} durationInFrames={Infinity}>
        <Subtitle />
      </Sequence>
    </div>
  );
}
```

## See also

- [useVideoConfig()](/docs/use-video-config)
