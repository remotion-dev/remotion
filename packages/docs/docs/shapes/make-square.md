---
title: makeRect()
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Generates an SVG path for a rectangle

## Arguments

An object with the following entries:

### `x`

_`number`, optional_

The x-axis coordinate to start drawing the rect. Defaults to `0`.

### `y`

_`number`, optional_

The y-axis coordinate to start drawing the rect. Defaults to `0`.

### `width`

The width of the rectangle

### `height`

The height of the rectangle

```tsx twoslash
import { makeRect } from "@remotion/shapes";
const rect = makeRect({ x: 50, y: 50, width: 100, height: 100 });

console.log(rect); // M 50 50 l 100 0 l 0 100 l -100 0 Z
```

## See also

- [makeTriangle()](/docs/shapes/make-triangle)
- [makeCircle()](/docs/shapes/make-circle)
- [`@remotion/shapes`](/docs/shapes)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/shapes/src/make-rect.ts)
