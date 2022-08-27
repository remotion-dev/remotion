---
title: reversePath()
---

_Part of the [`@remotion/paths`](/docs/paths) package._

Reverses a path so the end and start are switched.

```tsx twoslash
import { getLength } from "@remotion/paths";

const reversedPath = getLength("M 0 0 L 100 0");
console.log(reversedPath); // "L 100 0 M 0 0"
```

The function will throw if the path is invalid:

```tsx twoslash
import { getLength } from "@remotion/paths";
// ---cut---
getLength("remotion"); // Error: Malformed path data: ...
```

## See also

- [`@remotion/paths`](/docs/paths)
