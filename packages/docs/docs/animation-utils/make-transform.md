---
image: /generated/articles-docs-animation-utils-make-transform.png
title: makeTransform()
id: make-transform
crumb: "@remotion/animation-utils"
---

_Part of the [`@remotion/animation-utils`](/docs/animation-utils) package._

Applies a sequence of transformation functions to generate a combined CSS `transform` property.

## API

### `makeTransform(transforms: TransformFunctionReturnType[]): string`

Generates a combined CSS transform property string by applying an array of transformation functions.

#### Parameters

- **transforms**: _Required_.
  An array of transformation functions obtained from the provided utility functions.

## Usage

```ts twoslash
import { makeTransform, rotate, translate } from "@remotion/animation-utils";

const transforms = [rotate(45), translate(50, 50)];

const combinedTransform = makeTransform(transforms);
// Result: "rotate(45deg) translate(50px, 50px)"
```

## Transformation Functions

| Function                                             | Description                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| **matrix(a, b, c, d, tx, ty)**                       | Applies a 2D transformation with a matrix of six values.     |
| **matrix3d(a1, b1, ..., d4)**                        | Applies a 3D transformation with a matrix of sixteen values. |
| **perspective(length, unit = 'px')**                 | Sets the perspective value for 3D transformations.           |
| **rotate(angle, unit = 'deg')**                      | Rotates an element around a fixed point on the 2D plane.     |
| **rotate3d(x, y, z, angle, unit = 'deg')**           | Rotates an element around a vector in 3D space.              |
| **rotateX(angle, unit = 'deg')**                     | Rotates an element around the horizontal axis in 3D space.   |
| **rotateY(angle, unit = 'deg')**                     | Rotates an element around the vertical axis in 3D space.     |
| **rotateZ(angle, unit = 'deg')**                     | Rotates an element around the z-axis in 3D space.            |
| **scale(x, y = x)**                                  | Scales an element in the 2D plane.                           |
| **scale3d(x, y, z)**                                 | Scales an element in 3D space.                               |
| **scaleX(x)**                                        | Scales an element along the horizontal axis in 3D space.     |
| **scaleY(y)**                                        | Scales an element along the vertical axis in 3D space.       |
| **scaleZ(z)**                                        | Scales an element along the z-axis in 3D space.              |
| **skew(x, y = x, unit = 'deg')**                     | Skews an element in the 2D plane.                            |
| **skewX(angle, unit = 'deg')**                       | Skews an element along the horizontal axis in 2D space.      |
| **skewY(angle, unit = 'deg')**                       | Skews an element along the vertical axis in 2D space.        |
| **translate(x, y = 0, unitX = 'px', unitY = unitX)** | Translates an element in the 2D plane.                       |
| **translate3d(x, y, z, unitX = 'px', ...)**          | Translates an element in 3D space.                           |
| **translateX(x, unit = 'px')**                       | Translates an element along the horizontal axis in 2D space. |
| **translateY(y, unit = 'px')**                       | Translates an element along the vertical axis in 2D space.   |
| **translateZ(z, unit = 'px')**                       | Translates an element along the z-axis in 3D space.          |

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/animation-utils/src/transformation-helpers/make-transform/index.ts)
- [`@remotion/animation-utils`](/docs/animation-utils)
