---
title: getInputProps()
id: get-input-props
crumb: "API"
---

_Available from v2.0_.

Using this method, you can retrieve inputs that you pass in from the command line using [`--props`](/docs/cli), or the [`inputProps`](/docs/ssr#render-a-video-programmatically) parameter if you are using the Node.JS API.

You should whenever possible prefer to retrieve props directly in your composition, like you would read props from a component if you were to code a React application, but this method is useful if you want to retrieve the input props outside of a composition.

:::info
This method is not available when inside a Remotion Player. Instead, get the props as React props from the component you passed as the `component` prop to the player.
:::

## API

Pass in a [parseable](/docs/cli) JSON representation using the `--props` flag to either `remotion preview` or `remotion render`:

```bash
npx remotion render --props='{"hello": "world"}' my-composition out/video.mp4
```

You can then access the props in JavaScript:

```tsx twoslash
const getInputProps = () => ({ hello: "world" } as const);
// ---cut---
const { hello } = getInputProps(); // "world"
```

In this example, the props also get passed to the component of the composition with the id `my-composition`.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/config/input-props.ts)
- [Dynamic duration, FPS & dimensions](/docs/dynamic-metadata)
