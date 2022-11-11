---
id: register-root
title: registerRoot()
---

`registerRoot` is a function that registers the root component of the Remotion project. In the root component, one or multiple compositions should be returned (in the case of multiple compositions, they should be wrapped in a React Fragment).

:::info
`registerRoot()` should live in a file that is separate from the list of compositions. This is because when using React Fast Refresh, all the code in the file that gets refreshed gets executed again, however, this function should only be called once.
:::

## Example

```tsx twoslash title="src/index.ts"
// @filename: ./Root.tsx
export const RemotionRoot = () => <></>;

// @filename: index.ts
// ---cut---
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
```

```tsx twoslash title="src/Root.tsx"
// @allowUmdGlobalAccess
// @filename: MyComponent.tsx
export default () => <></>;

// @filename: MyOtherComponent.tsx
export default () => <></>;

// @filename: index.tsx
import { Composition } from "remotion";
// ---cut---
import MyComponent from "./MyComponent";
import MyOtherComponent from "./MyOtherComponent";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="comp"
        fps={30}
        height={1080}
        width={1920}
        durationInFrames={90}
        component={MyComponent}
      />
      <Composition
        id="anothercomp"
        fps={30}
        height={1080}
        width={1920}
        durationInFrames={90}
        component={MyOtherComponent}
      />
    </>
  );
};
```

## Defer registerRoot()

In some cases, such as dynamically importing roots or loading WebAssembly, you might want to defer the loading of registerRoot(). If you are doing that, you need to tell Remotion to wait by using the [`delayRender()` / `continueRender()`](/docs/delay-render) pattern.

```tsx twoslash
// @filename: ./Root.tsx
export const RemotionRoot = () => <></>;

// @filename: index.ts
const loadWebAssembly = () => Promise.resolve();
// ---cut---

import { continueRender, delayRender, registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

const wait = delayRender();

loadWebAssembly().then(() => {
  registerRoot(RemotionRoot);
  continueRender(wait);
});
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/register-root.ts)
- [`<Composition />` component](/docs/composition)
- [The fundamentals](/docs/the-fundamentals)
