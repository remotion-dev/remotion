---
title: makeTriangle()
crumb: "@remotion/shapes"
---

import {MakeShapeSeeAlso, ShapeOptions} from "../../components/shapes/shapes-info"

_Part of the [`@remotion/shapes`](/docs/shapes) package._

Generates a triangle SVG path.

## Arguments

<ShapeOptions shape="triangle"/>

## Example

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

Source code partially taken from [this StackBlitz](https://stackblitz.com/edit/react-triangle-svg?file=index.js).

## See also

<MakeShapeSeeAlso shape="triangle"/>
