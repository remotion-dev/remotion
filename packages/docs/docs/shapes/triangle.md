---
title: <Triangle />
crumb: "@remotion/shapes"
---

import {ShapeSeeAlso, ShapeOptions} from "../../components/shapes/shapes-info"

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Renders an SVG element containing a triangle.

## Props

<ShapeOptions shape="ellipse" all />

## Example

```tsx twoslash title="src/Triangle.tsx"
import { Triangle } from "@remotion/shapes";
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
      <Triangle length={100} fill="red" direction="left" />
    </AbsoluteFill>
  );
};
```

## See also

<ShapeSeeAlso shape="triangle"/>
