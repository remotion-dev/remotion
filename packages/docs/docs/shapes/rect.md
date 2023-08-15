---
image: /generated/articles-docs-shapes-rect.png
title: <Rect />
crumb: "@remotion/shapes"
---

import {ShapeSeeAlso, ShapeOptions} from "../../components/shapes/shapes-info"

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Renders an SVG element containing a rectangle.

## Explorer

<Demo type="rect"/>

## Example

```tsx twoslash title="src/Rect.tsx"
import { Rect } from "@remotion/shapes";
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
      <Rect width={200} height={200} fill="red" />
    </AbsoluteFill>
  );
};
```

## Props

<ShapeOptions shape="rect" all />

## See also

<ShapeSeeAlso shape="rect"/>
