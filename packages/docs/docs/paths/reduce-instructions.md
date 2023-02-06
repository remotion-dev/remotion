---
title: reduceInstructions()
crumb: "@remotion/paths"
---

_Part of the [`@remotion/paths`](/docs/paths) package. Available from v3.3.40_

Takes an array of [`Instruction`](/docs/paths/parse-path)'s and reduces them so the path only consists of `M`, `L`, `C`, `Q` and `Z` instructions.  
This is useful if you want to manually edit a path and want to make sure it's as simple as possible.

Note that this may result in a longer path.

```ts twoslash
import { reduceInstructions } from "@remotion/paths";

const simplified = reduceInstructions([
  { type: "m", dx: 10, dy: 10 },
  { type: "h", dx: 100 },
]);

/*
  [
    {type: 'M', x: 10, y: 10},
    {type: 'L', x: 110, y: 10},
  ]
*/
```

## See also

- [`@remotion/paths`](/docs/paths)
- [`parsePath()`](/docs/paths/parse-path)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/paths/src/reduce-instructions.ts)
