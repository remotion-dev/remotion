---
title: createNoise2D()
---

_Part of the [`@remotion/noise`](/docs/noise) package._

Creates 2D noise. The function takes one argument:

- `seed`, same as for [`random()`](/docs/random)

A `NoiseFunction2D` is returned:

```tsx twoslash
import type { NoiseFunction2D } from "@remotion/noise";
import { createNoise2D } from "@remotion/noise";

const noise2d: NoiseFunction2D = createNoise2D("my-seed");

const x = 32;
const y = 40;
console.log(noise2d(x, y)); // a number in the interval [-1, 1] which corresponds to (x, y) coord.
```

## Credits

Dependency: [simplex-noise](https://www.npmjs.com/package/simplex-noise)

## See also

- [createNoise3D()](/docs/noise/create-noise-3d)
- [createNoise4D()](/docs/noise/create-noise-4d)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/noise/src/index.ts)
- [`@remotion/noise`](/docs/noise)
