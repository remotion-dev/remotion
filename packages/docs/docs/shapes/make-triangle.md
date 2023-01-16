---
title: makeTriangle()
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Generates a triangle SVG path.

## Arguments

### `options`

An object with the following arguments:

- `width`: `number` - The width of the triangle
- `height`: `number` - The height of the triangle.
- `direction`: `string` - The identifier what kind of rectangle, possible values are `left`, `right`, `top` and `bottom`

Example Triangle path generation

```tsx twoslash title="triangle.ts"
import { makeTriangle } from "@remotion/shapes";

const { path, width, height } = makeTriangle({
  length: 100,
  direction: "right",
});

console.log(path); // M 0 0 L 0 100 L 86.60254037844386 50 z
console.log(width); // 86.60254037844386
console.log(height); // 100
```

## Credits

Source code stems mostly from [triangle](https://stackblitz.com/edit/react-triangle-svg?file=index.js).

## See also

<MakeShapeSeeAlso shape="triangle"/>
