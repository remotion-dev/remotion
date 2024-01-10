---
image: /generated/articles-docs-layout-utils-measure-text.png
title: measureText()
crumb: "@remotion/layout-utils"
---

_Part of the [`@remotion/layout-utils`](/docs/layout-utils) package._

Calculates the width and height of specified text to be used for layout calculations. Only works in the browser, not in Node.js or Bun.

## API

This function has a cache. If there are two duplicate arguments inputs, the second one will return the first result without repeating the calculation.

The function takes the following options:

### `text`

_Required_ _string_

Any string.

### `fontFamily`

_Required_ _string_

Same as CSS style `font-family`

### `fontSize`

_Required_ _number_

Same as CSS style `font-size`. Only _numbers_ allowed, unit `px`

### `fontWeight`

_string_

Same as CSS style `font-weight`

### `letterSpacing`

_string_

Same as CSS style `font-spacing`.

### `fontVariantNumeric`<AvailableFrom v="4.0.57"/>

_string_

Same as CSS style `font-variant-numeric`.

## Return value

An object with `height` and `width`

## Example

```tsx twoslash
import { measureText } from "@remotion/layout-utils";

const text = "remotion";
const fontFamily = "Arial";
const fontWeight = "500";
const fontSize = 12;
const letterSpacing = "1px";

measureText({
  text,
  fontFamily,
  fontWeight,
  fontSize,
  letterSpacing,
}); // { height: 14, width: 20 }
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/layout-utils/src/layouts/measure-text.ts)
- [`@remotion/layout-utils`](/docs/layout-utils)
