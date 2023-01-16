---
title: makeCircle()
crumb: "@remotion/shapes"
---

_Part of the [`@remotion/shapes`](/docs/shapes) package._

Generates a circle SVG path.

## Arguments

<ShapeOptions shape="circle"/>

## Example

```tsx twoslash title="circle.ts"
import { makeCircle } from "@remotion/shapes";

const { path, width, height } = makeCircle({ radius: 50 });

console.log(path); // M 0 0 m -50, 0 a 50,50 0 1,0 100,0  50,50 0 1,0 -100,0
console.log(width); // 100
console.log(height); // 100
```

## See also

import {MakeShapeSeeAlso, ShapeOptions} from "../../components/shapes/shapes-info"

<MakeShapeSeeAlso shape="circle"/>
