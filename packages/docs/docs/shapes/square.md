---
title: <Rect />
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Generate a rectangle using SVG

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

## Example

```tsx twoslash
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

## See also

- [makeTriangle()](/docs/shapes/make-triangle)
- [makeRect()](/docs/shapes/make-rect)
- [`@remotion/shapes`](/docs/shapes)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/shapes/src/rect.tsx)
