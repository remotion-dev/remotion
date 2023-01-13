---
image: /generated/articles-docs-shapes-triangle.png
title: <Triangle />
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Generate Triangle SVG component

## Arguments

### `options`
An object with the following arguments:

- `width`: `number` - The width of the triangle
- `height`: `number` - he height of the triangle
- `fill`: `string` `optional` - The fill color 
- `direction`: `string`  - The identifier what kind of rectangle, possible values `left`, `right`, `top` and `bottom`
- `style`: `React.CSSProperties` - The radius of the circle. A value lower or equal to zero disables rendering of the circle


Example Triangle SVG

```tsx twoslash

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
       	<Triangle
          width={100}
          height={100}
          fill="red"
          direction="left"
          />
      </AbsoluteFill>
  );
};
```

## See also
- [makeTriangle()](/docs/shapes/make-triangle)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/shapes/src/triangle.tsx)
