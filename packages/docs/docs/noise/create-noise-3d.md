---
title: createNoise3D()
---

_Part of the [`@remotion/noise`](/docs/noise) package._

Creates 3D noise. The function takes one argument:

- `seed`, same as for [`random()`](/docs/random)

A `NoiseFunction3D` is returned:

```tsx twoslash
import type { NoiseFunction3D } from "@remotion/noise";
import { createNoise3D } from "@remotion/noise";

const noise3d: NoiseFunction3D = createNoise3D("my-seed");

const x = 32;
const y = 40;
const z = 50;
console.log(noise3d(x, y, z)); // a number in the interval [-1, 1] which corresponds to (x, y, z) coord.
```

## Credits

Dependency: [simplex-noise](https://www.npmjs.com/package/simplex-noise)

## See also

- [Example: Noise visualization](/docs/noise-visualization)
- [createNoise2D()](/docs/noise/create-noise-2d)
- [createNoise4D()](/docs/noise/create-noise-4d)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/noise/src/index.ts)
- [`@remotion/noise`](/docs/noise)
