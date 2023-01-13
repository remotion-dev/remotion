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

- `width`: `number` - The x axis coordinate of the center of the circle
- `height`: `number` - The y axis coordinate of the center of the circle
- `fill`: `string` `optional` - The radius of the circle. A value lower or equal to zero disables rendering of the circle
- `stroke`: `number` - The x axis coordinate of the center of the circle
- `strokeWidth`: `number` - The y axis coordinate of the center of the circle
- `style`: `React.CSSProperties` - The radius of the circle. A value lower or equal to zero disables rendering of the circle


Use Triangle SVG into Remotion

```tsx twoslash

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
       <Circle
				width={100}
				height={100}
				fill="green"
				stroke="red"
				strokeWidth={1}
			/>
      </AbsoluteFill>
  );
};
```

## See also
- [makeTriangle()](/docs/shapes/make-triangle)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/shapes/src/make-triangle.tsx)
