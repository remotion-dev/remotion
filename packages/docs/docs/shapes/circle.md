---
image: /generated/articles-docs-shapes-circle.png
title: <Circle />
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Generates Circle SVG component

## Arguments

### `options`
An object with the following arguments:

- `width`: `number` - The width of the circle
- `height`: `number` - The height of the circle
- `fill`: `string` `optional` - The color of the fill
- `stroke`: `string` - The color of the stroke
- `strokeWidth`: `number` - The width of the stroke
- `style`: `React.CSSProperties` - The css styles applied to `svg` component


Use Circle SVG into Remotion

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
- [makeCircle()](/docs/shapes/make-circle)
- [`@remotion/shapes`](/docs/shapes)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/shapes/src/circle.tsx)
