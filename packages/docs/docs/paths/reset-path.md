---
title: resetPath()
crumb: "@remotion/paths"
---

_Part of the [`@remotion/paths`](/docs/paths) package. Available from v3.3.40_

Translates an SVG path so that the top-left corner of the bounding box is at `0,0`. Useful for simplifying the math when transforming the coordinates of an SVG path.

```tsx twoslash title="reset-path.ts"
import { getBoundingBox, resetPath } from "@remotion/paths";

const newPath = resetPath("M 35,50 a 25,25,0,1,1,50,0 a 25,25,0,1,1,-50,0");
const { x1, y1 } = getBoundingBox(newPath);
// {x1: 0, x2: 0};
```

This function will throw if the SVG path is invalid.

## See also

- [`@remotion/paths`](/docs/paths)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/paths/src/reset-path.ts)
