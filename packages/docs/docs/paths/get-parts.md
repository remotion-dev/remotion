---
image: /generated/articles-docs-paths-get-parts.png
title: getParts()
crumb: "@remotion/paths"
---

_Part of the [`@remotion/paths`](/docs/paths) package._

:::warning
**Deprecated** in favor of [`getSubpaths()`](/docs/paths/get-subpaths).
:::

Takes an SVG path and returns an array of parts of the path.

Example of a path that has two straight lines:

```tsx twoslash
import { getParts } from "@remotion/paths";

const parts = getParts(`
  M 0 0 L 100 0
  M 0 100 L 200 100
`);
```

An array is returned containing two parts.

```tsx twoslash
import { getParts } from "@remotion/paths";

const parts = getParts(`
  M 0 0 L 100 0
  M 0 100 L 200 100
`);

// ---cut---

console.log(parts[0].length); // 100
console.log(parts[1].length); // 200
```

## Properties of a part

### `length`

Returns the length of the part.

```tsx twoslash
import { getParts } from "@remotion/paths";

const parts = getParts(`
  M 0 0 L 100 0
  M 0 100 L 200 100
`);

// ---cut---
console.log(parts[0].length); // 100
```

### `start`

Returns the `x` and `y` coordinates of the start point of the part.

```tsx twoslash
import { getParts } from "@remotion/paths";

const parts = getParts(`
  M 0 0 L 100 0
  M 0 100 L 200 100
`);

console.log(parts[1].length); // 200
// ---cut---
console.log(parts[0].start); // { x: 0, y: 0 }
```

### `end`

Returns the `x` and `y` coordinates of the end point of the part.

```tsx twoslash
import { getParts } from "@remotion/paths";

const parts = getParts(`
  M 0 0 L 100 0
  M 0 100 L 200 100
`);

// ---cut---
console.log(parts[0].end); // { x: 100, y: 0 }
```

### `getPointAtLength()`

Returns the `x` and `y` coordinates of a point along the line of a part. The input must be between `0` and `length`.

```tsx twoslash
import { getParts } from "@remotion/paths";

const parts = getParts(`
  M 0 0 L 100 0
  M 0 100 L 200 100
`);

// ---cut---
console.log(parts[0].getPointAtLength(50)); // { x: 50, y: 0 }
```

### `getTangentAtLength()`

Returns tangents `x` and `y` of a point along the line of a part. The input must be between `0` and the return value of [`getLength()`](/docs/paths/get-length).

```tsx twoslash
import { getParts } from "@remotion/paths";

const parts = getParts(`
  M 0 0 L 100 0
  M 0 100 L 200 100
`);

// ---cut---
console.log(parts[0].getTangentAtLength(50)); // { x: 1, y: 0 }
```

## Credits

Source code stems mostly from [svg-path-properties](https://www.npmjs.com/package/svg-path-properties).

## See also

- [`@remotion/paths`](/docs/paths)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/paths/src/get-parts.ts)
