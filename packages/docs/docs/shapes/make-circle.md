---
title: makeCircle()
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Generates Circle SVG path

## Arguments

### `options`

An object with the following arguments:

- `cx`: `number` - The x axis coordinate of the center of the circle
- `cy`: `number` - The y axis coordinate of the center of the circle
- `radius`: `number` - The radius of the circle. A value lower or equal to zero disables rendering of the circle

Example Circle path generation

```tsx twoslash
import { makeCircle } from "@remotion/shapes";
const circlePath = makeCircle({ cx: 50, cy: 50, radius: 50 });

console.log(circlePath); // M 50 50 m -50, 0 a 50,50 0 1,0 100,0  50,50 0 1,0 -100,0
```

## See also

import {MakeShapeSeeAlso} from "../../components/shapes/shapes-info"

<MakeShapeSeeAlso shape="circle"/>
