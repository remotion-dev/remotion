---
image: /generated/articles-docs-paths-get-subpaths.png
title: getSubpaths()
crumb: "@remotion/paths"
---

_Part of the [`@remotion/paths`](/docs/paths) package. Available from v3.3.6_

Takes an SVG path and returns an array of subpaths.

Each `M` and `m` statement in a path creates a new subpath.

Example of a path that has two straight lines:

```tsx twoslash
import { getSubpaths } from "@remotion/paths";

const parts = getSubpaths(`
  M 0 0 L 100 0
  M 0 100 L 200 100
`);
```

An array is returned containing two parts.

```tsx twoslash
import { getSubpaths } from "@remotion/paths";

const parts = getSubpaths(`
  M 0 0 L 100 0
  M 0 100 L 200 100
`);

// ---cut---

console.log(parts[0]); // "M 0 0 L 100 0"
console.log(parts[1]); // "M 0 100 L 200 100"
```

Paths containing relative `m` elements will be converted into `M` elements.

## See also

- [`@remotion/paths`](/docs/paths)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/paths/src/get-subpaths.ts)
