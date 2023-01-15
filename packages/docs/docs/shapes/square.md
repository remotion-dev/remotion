---
image: /generated/articles-docs-shapes-square.png
title: <Square />
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Generate Square SVG component

## Props

### `width`

_number_

The width of the rect and the view box.

### `height`

_number_

The height of the rect and the view box.

### `fill`

_string_

The fill color of the rect.

### `style`

_`React.CSSProperties`, optional_

CSS styles applied to `svg` element.

Example Square SVG

```tsx twoslash
import { Square } from "@remotion/shapes";
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
      <Square width={200} height={200} fill="red" />
    </AbsoluteFill>
  );
};
```

## See also

- [makeTriangle()](/docs/shapes/make-triangle)
- [makeSquare()](/docs/shapes/make-square)
- [`@remotion/shapes`](/docs/shapes)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/shapes/src/square.tsx)
