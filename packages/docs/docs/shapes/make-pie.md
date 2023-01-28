---
title: makePie()
crumb: "@remotion/shapes"
---

import {MakeShapeSeeAlso, ShapeOptions, MakeShapeReturnType} from "../../components/shapes/shapes-info"

_Part of the [`@remotion/shapes`](/docs/shapes) package._

Generates a piece of pie SVG path.

## Example

```tsx twoslash title="pie.ts"
import { makePie } from "@remotion/shapes";

const { path, width, height, transformOrigin } = makePie({
  radius: 50,
  fillAmount: 0.5,
});

// TOOD: Wrong paths
console.log(path); // M 0 0 m -50, 0 a 50,50 0 1,0 100,0  50,50 0 1,0 -100,0
console.log(width); // 100
console.log(height); // 100
console.log(transformOrigin); // '50 50'
```

## Arguments

<ShapeOptions shape="pie"/>

## Return type

<MakeShapeReturnType shape="pie"/>

## See also

<MakeShapeSeeAlso shape="pie"/>
