---
image: /generated/articles-docs-shapes-ellipse.png
title: <Ellipse />
crumb: "@remotion/shapes"
---

import {ShapeSeeAlso, ShapeOptions} from "../../components/shapes/shapes-info"

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Renders an SVG element drawing an ellipse.

## Explorer

<Demo type="ellipse" />

## Example

```tsx twoslash title="src/Ellipse.tsx"
import { Ellipse } from "@remotion/shapes";
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
      <Ellipse rx={100} ry={50} fill="green" stroke="red" strokeWidth={1} />
    </AbsoluteFill>
  );
};
```

## Props

<ShapeOptions shape="ellipse" all />

## See also

<ShapeSeeAlso shape="ellipse"/>
