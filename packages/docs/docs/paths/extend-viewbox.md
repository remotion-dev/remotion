---
image: /generated/articles-docs-paths-extend-viewbox.png
title: extendViewBox()
crumb: "@remotion/paths"
---

_Part of the [`@remotion/paths`](/docs/paths) package. Available since v3.2.25_

Widens an SVG `viewBox` in all directions by a certain scale factor.

:::note
This function may be unnecessary: If you want the parts that go outside of the viewbox to be visible, you can also set `style={{overflow: 'visible'}}` on the SVG container.
:::

```tsx twoslash
import { extendViewBox } from "@remotion/paths";

const extended = extendViewBox("0 0 1000 1000", 2);
console.log(extended); // "-500 -500 2000 2000"
```

The function will throw if the viewBox is invalid.

## Example: Displaying an SVG path that goes out of bounds

Consider the following SVG:

The path will go from `0` to `1500` on the horizontal axis, but it will be cut off because it goes beyond the viewport area.

```tsx twoslash
const viewBox = "0 0 1000 1000";

export const ViewBoxExample: React.FC = () => {
  return (
    <svg viewBox={viewBox}>
      <path d={"0 500 1500 500"} stroke="black" strokeWidth={4} />
    </svg>
  );
};
```

We can fix the cutoff by doing two things:

- Scaling the viewBox by a factor of 2
- Applying a 2x scale transform to the SVG.

```tsx twoslash
import { extendViewBox } from "@remotion/paths";

const viewBox = "0 0 1000 1000";

export const ViewBoxExample: React.FC = () => {
  return (
    <svg style={{ scale: "2" }} viewBox={extendViewBox(viewBox, 2)}>
      <path d={"0 500 1500 500"} stroke="black" strokeWidth={4} />
    </svg>
  );
};
```

By doing that, the each dimensions of the viewBox will be doubled, which will result in the picture being scaled down. By applying a scale transform, this can be corrected.

In this example, a factor of `2` was chosen because it is enough to fix the cutoff problem. The more the SVG path goes outside the container, the higher the factor needs to be to compensate.

## See also

- [`@remotion/paths`](/docs/paths)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/paths/src/extend-viewbox.ts)
