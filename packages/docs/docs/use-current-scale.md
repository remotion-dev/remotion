---
image: /generated/articles-docs-use-current-scale.png
title: useCurrentScale()
id: use-current-scale
crumb: "API"
---

With this hook, you can retrieve the scale factor of the canvas.  
In the Studio, it will correspond to the zoom level - the value is `1` if the zoom is at 100%.

```tsx twoslash
import { Sequence, useCurrentScale } from "remotion";

const MyVideo = () => {
  const scale = useCurrentScale({1});

  return (
    <div>{scale}</div>
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

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/use-current-scale.ts)
