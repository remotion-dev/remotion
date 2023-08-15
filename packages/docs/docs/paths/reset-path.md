---
image: /generated/articles-docs-paths-reset-path.png
title: resetPath()
crumb: "@remotion/paths"
---

_Part of the [`@remotion/paths`](/docs/paths) package. Available from v3.3.40_

Translates an SVG path so that the top-left corner of the [bounding box](/docs/paths/get-bounding-box) is at `0, 0`. Useful for simplifying the math when transforming the coordinates of an SVG path.

```tsx twoslash title="reset-path.ts"
import { resetPath } from "@remotion/paths";

const newPath = resetPath("M 10 10 L 20 20"); // M 0 0 L 10 10
```

This function will throw if the SVG path is invalid.

## See also

- [`@remotion/paths`](/docs/paths)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/paths/src/reset-path.ts)
