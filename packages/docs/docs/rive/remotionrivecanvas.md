---
crumb: "@remotion/rive"
sidebar_label: "<RemotionRiveCanvas>"
---

# &lt;RemotionRiveCanvas&gt; <AvailableFrom v="3.3.66"/>

This component can render a [Rive](https://rive.app/) animation so it synchronizes with Remotion's time.

## Props

### `src`

a valid URL of the rive file to load. Can be a local file loaded using [`staticFile()`](/docs/staticfile) or a remote URL like `"https://cdn.rive.app/animations/vehicles.riv"`.

### `fit?`

One of: `"contain" | "cover" | "fill" | "fit-height" | "none" | "scale-down" | "fit-width"`. Default is `"contain"`.

### `alignment?`

One of: `"center" | "bottom-center" | "bottom-left" | "bottom-right" | "center-left" | "center-right" | "top-center" | "top-left" | "top-right"`. Default is `"center"`.

### `artboard?`

Either a `string` specifying the artboard name, a `number` specifying the artboard index, otherwise the default artboard is being used.

### `animation?`

Either a `string` specifying the animation name, a `number` specifying the animation index, otherwise the default animation is being used.

## Example

```tsx twoslash
import { RemotionRiveCanvas } from "@remotion/rive";

function App() {
  return <RemotionRiveCanvas src="https://example.com/myAnimation.riv" />;
}
```

## See also

- [`@remotion/lottie`](/docs/lottie)
