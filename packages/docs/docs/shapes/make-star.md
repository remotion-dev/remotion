---
image: /generated/articles-docs-shapes-make-star.png
title: makeStar()
crumb: "@remotion/shapes"
---

import {MakeShapeSeeAlso, ShapeOptions, MakeShapeReturnType} from "../../components/shapes/shapes-info"

_Part of the [`@remotion/shapes`](/docs/shapes) package._

Generates an star SVG path.

## Example

```tsx twoslash title="star.ts"
import { makeStar } from "@remotion/shapes";

const { path, width, height, transformOrigin, instructions } = makeStar({
  innerRadius: 200,
  outerRadius: 150,
  points: 5,
});

console.log(path); // M 200 0 L 288.167787843871 78.64745084375788 L 390.21130325903073 138.19660112501052 L 342.658477444273 246.3525491562421 L 317.55705045849464 361.8033988749895 L 200 350 L 82.4429495415054 361.8033988749895 L 57.34152255572698 246.35254915624213 L 9.788696740969272 138.19660112501055 L 111.83221215612902 78.6474508437579 L 200 0
console.log(width); // 400
console.log(height); // 400
console.log(transformOrigin); // '200 200'
console.log(instructions); // '[{type: "M"}, ...]'
```

## Arguments

<ShapeOptions shape="star"/>

## Return type

<MakeShapeReturnType shape="star"/>

## See also

<MakeShapeSeeAlso shape="star"/>
