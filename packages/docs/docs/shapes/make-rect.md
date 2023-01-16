---
title: makeRect()
crumb: "@remotion/shapes"
---

import {MakeShapeSeeAlso, ShapeOptions} from "../../components/shapes/shapes-info"

_Part of the [`@remotion/shapes`](/docs/shapes) package._

Generates an SVG rectangle.

## Arguments

<ShapeOptions shape="rect"/>

## Example

```tsx twoslash title="rect.ts"
import { makeRect } from "@remotion/shapes";

const { path, width, height } = makeRect({ width: 100, height: 100 });

console.log(path); // M 0 0 l 100 0 l 0 100 l -100 0 Z
console.log(width); // 100
console.log(height); // 100
```

## See also

<MakeShapeSeeAlso shape="rect"/>
