---
image: /generated/articles-docs-shapes-make-ellipse.png
title: makeEllipse()
crumb: "@remotion/shapes"
---

import {MakeShapeSeeAlso, ShapeOptions, MakeShapeReturnType} from "../../components/shapes/shapes-info"

_Part of the [`@remotion/shapes`](/docs/shapes) package._

Generates an ellipse SVG path.

## Example

```tsx twoslash title="ellipse.ts"
import { makeEllipse } from "@remotion/shapes";

const { path, width, height, transformOrigin } = makeEllipse({
  rx: 100,
  ry: 50,
});

console.log(path); // M 100 0 a 100 100 0 1 0 1 0
console.log(width); // 200
console.log(height); // 100
console.log(transformOrigin); // '100 50'
```

## Arguments

<ShapeOptions shape="ellipse"/>

## Return type

<MakeShapeReturnType shape="ellipse"/>

## See also

<MakeShapeSeeAlso shape="ellipse"/>
