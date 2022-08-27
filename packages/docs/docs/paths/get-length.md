---
title: getLength()
---

_Part of the [`@remotion/paths`](/docs/paths) package._

Gets the length of an SVG path. The length must

A number is returned if the path is valid:

```tsx twoslash
import { getLength } from "@remotion/paths";

const length = getLength("M 0 0 L 100 0");
console.log(length); // 100
```

The function will throw if the path is invalid:

```tsx twoslash
import { getLength } from "@remotion/paths";
// ---cut---
getLength("remotion"); // Error: Malformed path data: ...
```

## See also

- [getPointAtLength()](/docs/paths/get-point-at-length)
- [getTangentAtLength()](/docs/paths/get-point-at-length)
- [`@remotion/paths`](/docs/paths)
