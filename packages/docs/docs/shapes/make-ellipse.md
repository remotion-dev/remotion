---
title: makeEllipse()
crumb: "@remotion/shapes"
---

_Part of the [`@remotion/shapes`](/docs/shapes) package._

Renders an SVG element with an ellipse inside.

## Arguments

### `options`

An object with the following arguments:

- `rx`: `number` - The width of the triangle
- `ry`: `number` - The height of the triangle.

Example Triangle path generation

```tsx twoslash
import { makeEllipse } from "@remotion/shapes";

const ellipse = makeEllipse({
  rx: 100,
  ry: 50,
});

console.log(ellipse); // M 100 0 a 100 100 0 1 0 1 0
```

## Credits

Source code stems mostly from [triangle](https://stackblitz.com/edit/react-triangle-svg?file=index.js).

## See also

import {MakeShapeSeeAlso} from "../../components/shapes/shapes-info"

<MakeShapeSeeAlso shape="ellipse"/>
