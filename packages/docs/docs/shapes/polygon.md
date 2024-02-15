---
image: /generated/articles-docs-shapes-polygon.png
title: <Polygon />
crumb: "@remotion/shapes"
---

import {ShapeSeeAlso, ShapeOptions} from "../../components/shapes/shapes-info"

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Renders an SVG element containing a polygon.

## Explorer

<Demo type="polygon"/>

## Example

```tsx twoslash title="src/Polygon.tsx"
import { Polygon } from "@remotion/shapes";
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
      <Polygon points={5} radius={80} />
    </AbsoluteFill>
  );
};
```

## Props

<ShapeOptions shape="polygon" all />

## See also

<ShapeSeeAlso shape="polygon"/>
