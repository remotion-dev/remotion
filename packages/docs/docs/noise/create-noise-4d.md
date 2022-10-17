---
title: createNoise4D()
---

_Part of the [`@remotion/noise`](/docs/noise) package._

Creates 4D noise. The function takes one argument:

- `seed`, same as for [`random()`](/docs/random)

A `NoiseFunction4D` is returned:

```tsx twoslash
import type { NoiseFunction4D } from "@remotion/noise";
import { createNoise4D } from "@remotion/noise";

const noise4d: NoiseFunction4D = createNoise4D("my-seed");

const x = 32;
const y = 40;
const z = 50;
const w = 64;
console.log(noise4d(x, y, z, w)); // a number in the interval [-1, 1] which corresponds to (x, y, z, w) coord.
```

## Credits

Dependency: [simplex-noise](https://www.npmjs.com/package/simplex-noise)

## See also

- [createNoise2D()](/docs/noise/create-noise-2d)
- [createNoise3D()](/docs/noise/create-noise-3d)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/noise/src/index.ts)
- [`@remotion/noise`](/docs/noise)
