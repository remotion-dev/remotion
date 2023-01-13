---
image: /generated/articles-docs-shapes-square.png
title: <Square />
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Generate Square SVG component

## Arguments

### `options`
An object with the following arguments:

- `width`: `number` - The width of the svg
- `height`: `number` - The height of the svg
- `size`: `number`  - The size of the square
- `fill`: `string`  - The fill color
- `style`: `React.CSSProperties` - The css styles applied to `svg` component


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
      	<Square width={200} height={200} size={100} fill="red" />
      </AbsoluteFill>
  );
};
```

## See also
- [makeTriangle()](/docs/shapes/make-triangle)
- [makeSquare()](/docs/shapes/make-square)
- [`@remotion/shapes`](/docs/shapes)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/shapes/src/square.tsx)
