---
image: /generated/articles-docs-shapes-make-polygon.png
title: makePolygon()
crumb: "@remotion/shapes"
---

import {MakeShapeSeeAlso, ShapeOptions, MakeShapeReturnType} from "../../components/shapes/shapes-info"

_Part of the [`@remotion/shapes`](/docs/shapes) package._

Generates a polygon SVG path.

## Example

```tsx twoslash title="polygon.ts"
import { makePolygon } from "@remotion/shapes";

const { path, width, height, transformOrigin, instructions } = makePolygon({
  points: 5,
  radius: 80,
});

console.log(path); // M 76.08452130361228 0 L 152.16904260722458 55.278640450004204 L 123.10734148701013 144.72135954999578 L 29.061701120214437 144.72135954999578 L 0 55.27864045000418
console.log(width); // 160
console.log(height); // 160
console.log(transformOrigin); // '80 80'
console.log(instructions); // '[{type: "M"}, ...]'
```

## Arguments

<ShapeOptions shape="polygon"/>

## Return type

<MakeShapeReturnType shape="polygon"/>

## See also

<MakeShapeSeeAlso shape="polygon"/>
