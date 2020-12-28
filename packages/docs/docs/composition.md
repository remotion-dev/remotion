---
id: composition
title: <Composition />
---

This is the component to use to register a video to make it renderable and make it show up in the sidebar of the Remotion Player.

## API

A `<Composition />` should be placed within a fragment of the root component (which is registered using [`registerRoot()`](register-root)).

The component takes the following props:

- `name`: Name, as shown in the sidebar and also the ID of the composition that you need to specify if you want to render it. The name can only contain letters, numbers and `-`.

- `fps`: At how many frames the composition should be rendered.

- `durationInFrames`: How many frames the composition should be long.

- `height`: Height of the composition in pixels.

- `width`: Width of the composition in pixels.

- `component` **or** `lazyComponent`: Pass the component in directly **or** pass a function that returns a dynamic import. Passing neither or both of the props is an error.

:::tip
If you use `lazyComponent`, Remotion will use React Suspense to load the component. This can help bring down the weight of the webpage if you have a lot of compositions. However, these components will still be bundled using Webpack, let us know if you know how to improve this!
:::

:::info
If you use `lazyComponent`, you need to use a default export for your component. This is a restriction of React Suspense.
:::

## Example using `component`

```tsx
import {MyComp} from './MyComp';

export const MyVideo = () => {
  return (
    <>
      <Composition
        name="my-comp"
        component={MyComp}
        width={1080}
        height={1080}
        fps={30}
        durationInFrames={3 * 30}
      />
    </>
  );
}
```

## Example using `lazyComponent`

```tsx
export const MyVideo = () => {
  return (
    <>
      <Composition
        name="my-comp"
        lazyComponent={() => import('./LazyComponent')}
        width={1080}
        height={1080}
        fps={30}
        durationInFrames={3 * 30}
      />
    </>
  );
}
```

## See also

- [registerRoot()](register-root)
- [The fundamentals](the-fundamentals)
