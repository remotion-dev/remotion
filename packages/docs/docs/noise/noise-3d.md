---
title: noise3D()
---

_Part of the [`@remotion/noise`](/docs/noise) package._

Creates 3D noise. The function takes one argument:

- `seed`, same as for [`random()`](/docs/random)

A `NoiseFunction3D` is returned:

```tsx twoslash
import { noise3D } from "@remotion/noise";

const x = 32;
const y = 40;
const z = 50;
console.log(noise3D("my-seed", x, y, z)); // a number in the interval [-1, 1] which corresponds to (x, y, z) coord.
```

## Credits

Dependency: [simplex-noise](https://www.npmjs.com/package/simplex-noise)

## See also

- [Example: Noise visualization](/docs/noise-visualization)
- [noise2D()](/docs/noise/noise-2d)
- [noise4D()](/docs/noise/noise-4d)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/noise/src/index.ts)
- [`@remotion/noise`](/docs/noise)
