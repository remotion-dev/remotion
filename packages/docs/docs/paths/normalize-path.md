---
title: normalizePath()
---

_Part of the [`@remotion/paths`](/docs/paths) package._

Removes all relative coordinates from a path and converts them into absolute coordinates.

Returns a string if the path is valid:

```tsx twoslash
import { normalizePath } from "@remotion/paths";

const reversedPath = normalizePath("M 50 50 L 150 50");
console.log(reversedPath); // "M 50 50 L 150 50"
```

The function will throw if the path is invalid:

```tsx twoslash
import { normalizePath } from "@remotion/paths";
// ---cut---
normalizePath("remotion"); // Error: Malformed path data: ...
```

## Credits

Source code stems mostly from [svg-path-reverse](https://www.npmjs.com/package/svg-path-reverse).

## See also

- [`@remotion/paths`](/docs/paths)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/paths/src/normalize-path.ts)
