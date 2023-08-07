---
image: /generated/articles-docs-shapes-make-pie.png
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
  radius: 100,
  progress: 0.5,
});

console.log(path); // M 100 0 A 100 100 0 0 1 100 200 L 100 100 z
console.log(width); // 200
console.log(height); // 200
console.log(transformOrigin); // '100 100'
```

## Arguments

<ShapeOptions shape="pie"/>

## Return type

<MakeShapeReturnType shape="pie"/>

## See also

<MakeShapeSeeAlso shape="pie"/>
