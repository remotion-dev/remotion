---
title: <Circle />
crumb: "@remotion/shapes"
---

import {ShapeSeeAlso, ShapeOptions} from "../../components/shapes/shapes-info"

_Part of the [`@remotion/shapes`](/docs/shapes) package._

Renders an SVG element drawing a circle.

## Props

<ShapeOptions shape="circle" all />

## Example

```tsx twoslash title="src/Circle.tsx"
import { Circle } from "@remotion/shapes";
import { AbsoluteFill } from "remotion";

export const MyComposition = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Circle radius={100} fill="green" stroke="red" strokeWidth={1} />
    </AbsoluteFill>
  );
};
```

## See also

- [makeCircle()](/docs/shapes/make-circle)
- [`@remotion/shapes`](/docs/shapes)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/shapes/src/circle.tsx)
