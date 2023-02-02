---
image: /generated/articles-docs-use-current-frame.png
title: useCurrentFrame()
id: use-current-frame
crumb: "API"
---

With this hook, you can retrieve the current frame of the video. Frames are 0-indexed, meaning the first frame is `0`, the last frame is the duration of the composition in frames minus one. To learn more about how Remotion works with time, read the page about [the fundamentals](/docs/the-fundamentals).

If the component you are writing is wrapped in a [`<Sequence>`](/docs/sequence), `useCurrentFrame` will return the frame relative to when the Sequence starts.

Say the timeline marker is positioned at frame 25. In the example below, `useCurrentFrame()` will return `25`, except within the Subtitle component, where it will return `15` because it is within a sequence that starts at frame 10.

```tsx twoslash
import { Sequence, useCurrentFrame } from "remotion";

const Title = () => {
  const frame = useCurrentFrame(); // 25
  return <div>{frame}</div>;
};

const Subtitle = () => {
  const frame = useCurrentFrame(); // 15
  return <div>{frame}</div>;
};

const MyVideo = () => {
  const frame = useCurrentFrame(); // 25

  return (
    <div>
      <Title />
      <Sequence from={10}>
        <Subtitle />
      </Sequence>
    </div>
  );
};
```

Using `<Sequence />`'s, you can compose multiple elements together and time-shift them independently from each other without changing their animation.

### Getting the absolute frame of the timeline

In rare circumstances, you want access to the absolute frame of the timeline inside a sequence, use `useCurrentFrame()` at the top-level component and then pass it down as a prop to the children of the `<Sequence />`.

```tsx twoslash
import { Sequence, useCurrentFrame } from "remotion";

// ---cut---

const Subtitle: React.FC<{ absoluteFrame: number }> = ({ absoluteFrame }) => {
  console.log(useCurrentFrame()); // 15
  console.log(absoluteFrame); // 25

  return null;
};

const MyVideo = () => {
  const frame = useCurrentFrame(); // 25

  return (
    <Sequence from={10}>
      <Subtitle absoluteFrame={frame} />
    </Sequence>
  );
};
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/use-current-frame.ts)
- [useVideoConfig()](/docs/use-video-config)
- [`<Sequence />`](/docs/sequence)
