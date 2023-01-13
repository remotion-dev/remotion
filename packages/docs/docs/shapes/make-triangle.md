---
image: /generated/articles-docs-shapes-make-triangle.png
title: makeTriangle()
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/shapes) package._


Generates Triangle SVG path

## Arguments

### `options`

An object with the following arguments:


- `width`: `number` - The width of the triangle
- `height`: `number` - The height of the triangle.
- `direction`: `string`  - The identifier what kind of rectangle, possible values `left`, `right`, `top` and `bottom`


Example Triangle path generation

```tsx twoslash
import { makeTriangle } from "@remotion/shapes";
const rightTriangle = makeTriangle({width : 100, height : 100, direction : 'right'});

console.log(rightTriangle); // M 0,0 L 0,100 L 100,50 z

```



## Credits

Source code stems mostly from [triangle](https://stackblitz.com/edit/react-triangle-svg?file=index.js).

## See also

- [makeCircle()](/docs/shapes/make-circle)
- [makeSquare()](/docs/shapes/make-square)
- [`@remotion/shapes`](/docs/shapes)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/shapes/src/make-triangle.ts)
