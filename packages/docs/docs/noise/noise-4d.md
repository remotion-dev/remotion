---
title: noise4D()
---

_Part of the [`@remotion/noise`](/docs/noise) package._

Creates 4D noise. The function takes one argument:

- `seed`, same as for [`random()`](/docs/random)

A `NoiseFunction4D` is returned:

```tsx twoslash
import { noise4D } from "@remotion/noise";

const x = 32;
const y = 40;
const z = 50;
const w = 64;
console.log(noise4D("my-seed", x, y, z, w)); // a number in the interval [-1, 1] which corresponds to (x, y, z, w) coord.
```

## Credits

Dependency: [simplex-noise](https://www.npmjs.com/package/simplex-noise)

## See also

- [Example: Noise visualization](/docs/noise-visualization)
- [noise2D()](/docs/noise/noise-2d)
- [noise3D()](/docs/noise/noise-3d)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/noise/src/index.ts)
- [`@remotion/noise`](/docs/noise)
