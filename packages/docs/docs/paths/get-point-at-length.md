---
title: getPointAtLength()
---

_Part of the [`@remotion/paths`](/docs/paths) package._

Gets the coordinates of a point which is on an SVG path.
The first argument is an SVG path, the second one is the at which length the point should be sampled. It must be between `0` and the return value of [`getLength()`](/docs/paths/get-length).

An object containing `x` and `y` is returned if the path is valid:

```tsx twoslash
import { getPointAtLength } from "@remotion/paths";

const point = getPointAtLength("M 0 0 L 100 0", 50);
console.log(point); // { x: 50, y: 0 }
```

The function will throw if the path is invalid:

```tsx twoslash
import { getPointAtLength } from "@remotion/paths";
// ---cut---
getPointAtLength("remotion", 50); // Error: Malformed path data: ...
```

## Example: Getting the middle point of a path

Use [`getLength()`](/docs/paths/get-length) to get the total length of a path and then multiply it with a number between 0 and 1 to get any point on the path. For example, `length * 0.5` to get the coordinate of the middle of the path.

```tsx twoslash
import { getLength, getPointAtLength } from "@remotion/paths";

const path = "M 0 0 L 100 0";
const length = getLength(path);
const point = getPointAtLength(path, length * 0.5);

console.log(point); // { x: 50, y: 0 }
```

## See also

- [getLength()](/docs/paths/get-length)
- [`@remotion/paths`](/docs/paths)
