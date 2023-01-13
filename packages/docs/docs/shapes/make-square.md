---
image: /generated/articles-docs-shapes-make-square.png
title: makeSquare()
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/paths) package._


Generates Square SVG path

## Arguments

### `options`

An object with the following arguments:

- `x`: `number` `defaults: 50`- The x axis coordinate to start drawing the square
- `y`: `number` `defaults: 50` - The y axis coordinate to start drawing the square
- `size`: `number` - The size of the square inside the path


Example Square path generation

```tsx twoslash
import { makeSquare } from "@remotion/shapes";
const square = makeSquare({x : 50, y : 50, size : 100});

console.log(square); // M 50, 50 l 100, 0 l 0, 100 l -100, 0 Z

```


## See also

- [makeTriangle()](/docs/shapes/make-triangle)
- [makeCircle()](/docs/shapes/make-circle)
- [`@remotion/shapes`](/docs/shapes)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/shapes/src/make-square.ts)
