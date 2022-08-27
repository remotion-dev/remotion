---
title: evolvePath()
---

_Part of the [`@remotion/paths`](/docs/paths) package._

Animates an SVG path from being invisible to it's full length. The function takes two arguments:

- `progress` is the progress towards full evolution, where `0` means the path being invisible, and `1` meaning the path being fully drawn out.
  :::note
  Passing in a value above 1 will result in the start of the path getting devolved. Passing in a value below 0 will result in the path getting evolved from the end.
  :::

- `path` must be a valid SVG path.

```tsx twoslash
import { evolvePath } from "@remotion/paths";

const evolution = evolvePath(0.5, "M 0 0 L 100 0");
console.log(evolution); // { strokeDasharray: '100 100',  strokeDashoffset: 50,}
```

## See also

- [`@remotion/paths`](/docs/paths)
- [reversePath()](/docs/paths/reverse-path)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/paths/src/evolve-path.ts)
