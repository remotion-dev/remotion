---
image: /generated/articles-docs-noise-noise-3d.png
title: noise3D()
crumb: "Make some"
---

_Part of the [`@remotion/noise`](/docs/noise) package._

Creates 3D noise.

## API

The function takes four arguments:

### `seed`

Pass any _string_ or _number_. If the seed is the same, you will get the same result for same `x`, `y` and `z` values. Change the seed to get different results for your `x`, `y` and `z` values.

### `x`

_number_

The first dimensional value.

### `y`

_number_

The second dimensional value.

### `z`

_number_

The third dimensional value.

## Return value

A value between `-1` and `1`, swinging as your `x`, `y` and `z` values change.

## Example

```tsx twoslash
import { noise3D } from "@remotion/noise";

const x = 32;
const y = 40;
const z = 50;
console.log(noise3D("my-seed", x, y, z));
```

## Credits

Uses the [simplex-noise](https://www.npmjs.com/package/simplex-noise) dependency

## See also

- [Example: Noise visualization](/docs/noise-visualization)
- [noise2D()](/docs/noise/noise-2d)
- [noise4D()](/docs/noise/noise-4d)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/noise/src/index.ts)
- [`@remotion/noise`](/docs/noise)
