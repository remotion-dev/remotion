---
title: <SkiaCanvas />
---

A [React Native Skia `<Canvas />` component](https://shopify.github.io/react-native-skia/docs/canvas/overview) that wraps Remotion contexts.

You can place elements from `@shopify/react-native-skia` in it!

```tsx twoslash
import React from "react";
import { useVideoConfig } from "remotion";
import { SkiaCanvas } from "@remotion/skia";
import { Fill } from "@shopify/react-native-skia";

const MySkiaVideo: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <SkiaCanvas width={width} height={height}>
      <Fill color="black" />
    </SkiaCanvas>
  );
};
```

## Props

### `width`

The width of the canvas in pixels.

### `height`

The height of the canvas in pixels.

### Inherited props

All the props that are accepted by [`<Canvas>`](https://shopify.github.io/react-native-skia/docs/canvas/overview) are accepted as well.

## See also

- [Installation](/docs/skia)
