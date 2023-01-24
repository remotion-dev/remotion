---
title: makeStar()
crumb: "@remotion/shapes"
---

import {MakeShapeSeeAlso, ShapeOptions, MakeShapeReturnType} from "../../components/shapes/shapes-info"

_Part of the [`@remotion/shapes`](/docs/shapes) package._

Generates an star SVG path.

## Example

```tsx twoslash title="star.ts"
import { makeStar } from "@remotion/shapes";

const { path, width, height, transformOrigin } = makeStar({
  innerRadius: 200,
  outerRadius: 150,
  points: 5,
  height: 200,
  width: 200,
});

console.log(path); // M 100 0 a 100 100 0 1 0 1 0
console.log(width); // 200
console.log(height); // 100
console.log(transformOrigin); // '100 50'
```

## Arguments

<ShapeOptions shape="star"/>

## Return type

<MakeShapeReturnType shape="star"/>

## See also

<MakeShapeSeeAlso shape="star"/>
