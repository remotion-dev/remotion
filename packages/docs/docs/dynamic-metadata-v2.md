---
id: dynamic-metadata-v2
title: Dynamic duration, FPS & dimensions
crumb: "How To"
---

To dynamically set the `width`, `height`, `durationInFrames` or `fps` of a video, you can use the `calculateMetadata()` option of a [`<Composition>`](/docs/composition).

```tsx twoslash title="Root.tsx"
import React from "react";
const MyComp: React.FC = () => null;

import { Composition } from "remotion";

// ---cut---
<Composition
  id="my-comp"
  component={MyComp}
  durationInFrames={100}
  fps={30}
  width={1080}
  height={1080}
  calculateMetadata={async ({ defaultProps }) => {
    return {
      fps: 30,
      width: 1080,
      height: 1080,
      durationInFrames: 100,
      props: defaultProps,
    };
  }}
/>;
```

## Data loading

## How props flow

## In a `<Player>`
