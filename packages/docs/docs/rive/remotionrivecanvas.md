---
image: /generated/articles-docs-rive-remotionrivecanvas.png
crumb: "@remotion/rive"
sidebar_label: "<RemotionRiveCanvas>"
title: "<RemotionRiveCanvas>"
---

<AvailableFrom v="3.3.75"/>

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

### `onLoad?`<AvailableFrom v="4.0.58" />

A callback function that will be executed when the Rive Runtime is loaded. The argument callback is an object of type Rive `File`

## Basic Example

```tsx twoslash
import { RemotionRiveCanvas } from "@remotion/rive";

function App() {
  return <RemotionRiveCanvas src="https://example.com/myAnimation.riv" />;
}
```

## Set Text Run at Runtime Example

This example assumes that your Rive animation has a text run named "city". See [here](https://help.rive.app/runtimes/text#low-level-api-usage) for
more information about Text Runs on Rive.

```tsx twoslash
import { RemotionRiveCanvas } from "@remotion/rive";
import { File } from "@rive-app/canvas-advanced";
import { useCallback } from "react";

// Make sure to wrap your onLoad handler on `useCallback` to avoid re-rendering this component every single time
const onLoadHandler = useCallback((file: File) => {
  const artboard = file.defaultArtboard();
  const textRun = artboard.textRun("city");
  textRun.text = "Tokyo";
}, []);

function App() {
  return (
    <RemotionRiveCanvas
      src="https://example.com/myAnimation.riv"
      onLoad={onLoadHandler}
    />
  );
}
```

## See also

- [`@remotion/lottie`](/docs/lottie)
