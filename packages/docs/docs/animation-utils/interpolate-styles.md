---
image: /generated/articles-docs-animation-utils-interpolate-styles.png
title: interpolateStyles()
id: interpolate-styles
crumb: "@remotion/animation-utils"
---

_Part of the [`@remotion/animation-utils`](/docs/animation-utils) package._

This function provides a convenient way to interpolate styles based on a specified range of values, allowing for smooth animations between different styles.

## Example

```tsx twoslash
// ---cut---
import {
  interpolateStyles,
  makeTransform,
  translateY,
} from "@remotion/animation-utils";

const MyComponent: React.FC = () => {
  const animatedStyles = interpolateStyles(
    15,
    [0, 30, 60],
    [
      { opacity: 0, transform: makeTransform([translateY(-50)]) },
      { opacity: 1, transform: makeTransform([translateY(0)]) },
      { opacity: 0, transform: makeTransform([translateY(50)]) },
    ],
  );

  return <div style={animatedStyles} />;
};
```

## API

A function that takes 3-4 arguments:

1. The input value.
2. The range of values that you expect the input to assume.
3. The range of output styles that you want the input to map to.
4. Options object, same as the options of [`interpolate()`](/docs/interpolate#options) (_optional_)

## Return value

- A style object representing the interpolated styles based on the current frame.

## Usage Notes

- Ensure that the `inputRange` and `outputStylesRange` arrays contain at least two values to facilitate interpolation between styles.

- The `outputStylesRange` array must have the same number of elements as `inputRange`. Each style in `outputStylesRange` corresponds to a specific value in the input range.

## See also

- [Source code for this hook](https://github.com/remotion-dev/remotion/blob/main/packages/animation-utils/src/transformation-helpers/interpolate-styles/index.tsx)
- [`@remotion/animation-utils`](/docs/animation-utils)
