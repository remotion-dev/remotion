---
image: /generated/articles-docs-shapes-circle.png
title: <Circle />
crumb: "@remotion/shapes"
---

import {ShapeSeeAlso, ShapeOptions} from "../../components/shapes/shapes-info"

_Part of the [`@remotion/shapes`](/docs/shapes) package._

Renders an SVG element drawing a circle.

## Explorer

<Demo type="circle" />

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

## Props

<ShapeOptions shape="circle" all />

## See also

<ShapeSeeAlso shape="circle"/>
