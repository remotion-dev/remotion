---
image: /generated/articles-docs-animation-utils-use-interpolate-styles.png
title: useInterpolateStyles()
id: use-interpolate-styles
crumb: "@remotion/animation-utils"
---

_Part of the [`@remotion/animation-utils`](/docs/animation-utils) package._

This hook provides a convenient way to interpolate styles based on a specified range of frames or seconds, allowing for smooth animations between different styles.

## API

### `useInterpolateStyles(options: InterpolateStylesParams): Style`

#### Parameters

- **inputRangeInFrames**: _Optional_. An array of frame steps for interpolation.
- **inputRangeInSeconds**: _Optional_. An array of duration steps in seconds for interpolation.
- **outputStyles**: _Required_. An array of styles to be interpolated.

### Return value

- A style object representing the interpolated styles based on the current frame.

### Example

```tsx twoslash
// ---cut---
import {
  useInterpolateStyles,
  makeTransform,
  translateY,
} from "@remotion/animation-utils";

const MyComponent: React.FC = () => {
  const animatedStyles = useInterpolateStyles({
    inputRangeInFrames: [0, 30, 60],
    outputStyles: [
      { opacity: 0, transform: makeTransform([translateY(-50)]) },
      { opacity: 1, transform: makeTransform([translateY(0)]) },
      { opacity: 0, transform: makeTransform([translateY(50)]) },
    ],
  });

  return <div style={animatedStyles}>Animating Styles!</div>;
};
```

### Usage Notes

- Ensure that the `inputRangeInFrames` or `inputRangeInSeconds` arrays contain at least two values to facilitate interpolation between styles.

- The `outputStyles` array must have the same number of elements as either `inputRangeInFrames` or `inputRangeInSeconds`. Each style in `outputStyles` corresponds to a specific frame or time interval in the input range.

### Dependencies

- The hook internally relies on Remotion's `useCurrentFrame` and `useVideoConfig` hooks to synchronize with the video playback.

## See also

- [Source code for this hook](https://github.com/remotion-dev/remotion/blob/main/packages/animation-utils/src/transformation-helpers/use-interpolate-styles/index.tsx)
- [`@remotion/animation-utils`](/docs/animation-utils)
