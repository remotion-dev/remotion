---
image: /generated/articles-docs-random.png
id: random
title: random()
crumb: "API"
---

The `random()` API will give deterministic pseudorandom values between `0` and `1`. Unlike the `Math.random()` function, Remotions function takes in a seed which can be a `number` or a `string`. If the seed is the same, the output is always the same.

```ts twoslash
import { random } from "remotion";

const rand = random(1); // 0.07301638228818774
const rand2 = random(1); // still 0.07301638228818774

const randomCoordinates = new Array(10).fill(true).map((a, i) => {
  return {
    x: random(`random-x-${i}`),
    y: random(`random-y-${i}`),
  };
}); // will always be [{x: 0.2887063352391124, y: 0.18660089606419206}, ...]

// @ts-expect-error
random(); // Error: random() argument must be a number or a string
```

## Use cases

Randomness can be used to create interesting visualizations, such as particle effect for example. Since Remotion renders a video on multiple threads and opens the website multiple times, the value returned by a `Math.random()` call will not be the same across multiple threads, making it hard to create animations based on randomness. Using this API will ensure that the pseudorandom number will be the same always.

## Accessing true randomness

Calling `Math.random()` results in an ESLint warning in Remotion since often it leads to bugs in rendering. If you are sure you want a true random number, and want to bypass this message without adding an ignore comment, use `random(null)`

```ts twoslash
const random = (seed: number | string | null) => Math.random();
// ---cut---
// Passing null will result in a different value every time.
random(null) === random(null); // false
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/random.ts)
- [Using randomness](/docs/using-randomness)
