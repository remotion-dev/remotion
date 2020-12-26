---
id: register-root
title: registerRoot()
---

`registerRoot` is a function that the root component of the Remotion project. In the root component, one or multiple compositions should be returned (in the case of multiple compositions, they should be wrapped in a React Fragment).

:::info
The list of compositions can be updated without reloading the page, but calling `registerRoot()` multiple times is an error. This is why the root component should be placed in a different file than `registerRoot()` itself.
:::

## Example

`index.ts`

```tsx
import {registerRoot} from 'remotion';
import {RemotionVideo} from './RemotionVideo';

registerRoot(RemotionVideo);
```

`Video.tsx`

```tsx
import MyComponent from './MyComponent';
import MyOtherComponent from './MyOtherComponent';

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        name="comp"
        fps={30}
        height={1080}
        width={1920}
        component={MyComponent}
      />
      <Composition
        name="anothercomp"
        fps={30}
        height={1080}
        width={1920}
        component={MyOtherComponent}
      />
    </>
  )
}
```

## See also

- [The fundamentals](the-fundamentals)
