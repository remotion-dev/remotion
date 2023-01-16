---
title: makeRect()
crumb: "@remotion/shapes"
---

_Part of the [` @remotion/shapes`](/docs/shapes) package._

Generates an SVG path for a rectangle.

## Arguments

An object with the following entries:

### `width`

The width of the rectangle

### `height`

The height of the rectangle

## Example

```tsx twoslash
import { makeRect } from "@remotion/shapes";
const rect = makeRect({ width: 100, height: 100 });

console.log(rect); // M 0 0 l 100 0 l 0 100 l -100 0 Z
```

## See also

import {MakeShapeSeeAlso} from "../../components/shapes/shapes-info"

<MakeShapeSeeAlso shape="rect"/>
