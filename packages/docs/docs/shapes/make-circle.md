---
image: /generated/articles-docs-paths-make-circle.png
title: makeCircle()
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Generates Circle SVG path


## Arguments

### `options`
An object with the following arguments:

- `cx`: `number` - The x axis coordinate of the center of the circle
- `cy`: `number` - The y axis coordinate of the center of the circle
- `radius`: `number` - The radius of the circle. A value lower or equal to zero disables rendering of the circle


Generate Circle path

```tsx twoslash
import { makeCircle } from "@remotion/shapes";
const circlePath = makeCircle({cx : 50, cy : 50, radius : 50});

console.log(circlePath); // M 50 50 m -50, 0 a 50,50 0 1,0 100,0  50,50 0 1,0 -100,0

```


## See also
- [makeTriangle()](/docs/shapes/make-triangle)
- [makeSquare()](/docs/shapes/make-square)
- [`@remotion/shapes`](/docs/shapes)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/paths/src/make-triangle.tsx)
