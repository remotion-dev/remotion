---
image: /generated/articles-docs-using-randomness.png
id: using-randomness
sidebar_label: Randomness
title: Using randomness
crumb: "Roll the dice"
---

The following thing is an anti-pattern in Remotion:

```tsx twoslash
import { useState } from "react";
// ---cut---
const MyComp: React.FC = () => {
  const [randomValues] = useState(() =>
    new Array(10).fill(true).map((a, i) => {
      return {
        x: Math.random(),
        y: Math.random(),
      };
    }),
  );
  // Do something with coordinates
  return <></>;
};
```

While this will work during preview, it will break while rendering. The reason is that Remotion is spinning up multiple instances of the webpage to render frames in parallel, and the random values will be different on every instance.

## Fixing the problem

Use the [`random()`](/docs/random) API from Remotion to get deterministic pseudorandom values. Pass in a seed (number or string) and as long as the seed is the same, the return value will be the same.

```tsx twoslash {5-6}
import { random } from "remotion";
const MyComp: React.FC = () => {
  // No need to use useState
  const randomValues = new Array(10).fill(true).map((a, i) => {
    return {
      x: random(`x-${i}`),
      y: random(`y-${i}`),
    };
  });

  return <></>;
};
```

Now the random values will be the same on all threads.

## False positives

Did you get an ESLint warning when using `Math.random()`, but you are fully aware of the circumstances described above? Use `random(null)` to get a true random value without getting a warning.

## Exception: Inside `calculateMetadata()`

It is safe to use true random values inside [`calculateMetadata()`](/docs/calculate-metadata), as it is only called once and not in parallel.

## See also

- [`random()`](/docs/random)
