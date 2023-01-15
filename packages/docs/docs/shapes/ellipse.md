---
title: <Ellipse />
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Renders an SVG element drawing an ellipse

## Arguments

### `options`

An object with the following arguments:

- `rx`: `number` - The x-axis radius of the ellipse
- `ry`: `number` - The y-axis radius of the ellipse
- `fill`: `string` `optional` - The color of the fill
- `stroke`: `string` - The color of the stroke
- `strokeWidth`: `number` - The width of the stroke
- `style`: `React.CSSProperties` - The css styles applied to `svg` component

```tsx twoslash
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

## See also

- [makeEllipse()](/docs/shapes/make-ellipse)
- [`@remotion/shapes`](/docs/shapes)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/shapes/src/ellipse.tsx)
