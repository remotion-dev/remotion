---
image: /generated/articles-docs-layout-utils-fit-text.png
title: fitText()
crumb: "@remotion/layout-utils"
---

_Part of the [`@remotion/layout-utils`](/docs/layout-utils) package. Available from v4.0.88_

Calculates the `font-size` needed to fit a text into a given width.

```tsx twoslash title="FitText.tsx"
import { fitText } from "@remotion/layout-utils";

const text = "Hello World";
const width = 100;
const fontFamily = "Arial";
const fontWeight = "bold";

const { fontSize } = fitText({
  text,
  withinWidth: width,
  fontFamily: fontFamily,
  fontWeight: fontWeight,
  textTransform: "uppercase",
});

// Example markup:
<div
  style={{
    fontSize,
    width,
    fontFamily,
    fontWeight,
    textTransform: "uppercase",
  }}
>
  {text}
</div>;
```

## API

Accepts an object with the following properties:

### `text`

_string_

The text to fit.

### `withinWidth`

_number_

The width to fit the text into.

:::info
In the default Remotion stylesheet, borders shrink the container due to `box-sizing: border-box`.  
Subtract any borders, or use `outline` instead of `border`.
:::

### `fontFamily`

_string_

The `font-family` CSS property you are going to assign to the text.

:::info
The font needs to be loaded before this API is being called.  
If you use [`@remotion/google-fonts`](/docs/google-fonts), wait until [`waitUntilDone()`](/docs/google-fonts/load-font#waituntildone) resolves first.
:::

### `fontWeight`

_string | number, optional_

Pass this option if you are going to assign a `font-weight` CSS property to the text.

### `letterSpacing`

_string, optional_

Pass this option if you are going to assign a `letter-spacing` CSS property to the text.

### `fontVariantNumeric`

_string, optional_

Pass this option if you are going to assign a `font-variant-numeric` CSS property to the text.

### `textTransform`<AvailableFrom v="4.0.140"/>

_string_

Same as CSS style `text-transform`.

### `validateFontIsLoaded?`<AvailableFrom v="4.0.136"/>

_boolean_

If set to `true`, will take a second measurement with the fallback font and if it produces the same measurements, it assumes the fallback font was used and will throw an error.

### `additionalStyles`<AvailableFrom v="4.0.140"/>

_object, optional_

Additional CSS properties that affect the layout of the text.

## Return value

An object with `fontSize` in pixels. Assign this to the `style` prop of your text element.

## Example

```tsx twoslash
import { fitText } from "@remotion/layout-utils";
import React from "react";
import { AbsoluteFill } from "remotion";

const boxWidth = 600;
// Must be loaded before calling fitText()
const fontFamily = "Helvetica";
const fontWeight = "bold";

export const FitText: React.FC<{ text: string }> = ({ text }) => {
  const fontSize = Math.min(
    80,
    fitText({
      fontFamily,
      text,
      withinWidth: boxWidth,
      fontWeight,
    }).fontSize,
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          width: boxWidth,
          outline: "1px dashed rgba(0, 0, 0, 0.5)",
          height: 100,
          fontSize,
          fontWeight,
          fontFamily,
          display: "flex",
          alignItems: "center",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
```

Notes:

- A maximum font size of `80` was specified to prevent the text from becoming too large.
- The `fontFamily` and `fontWeight` were passed to the `div` element to ensure that the text is rendered with the same font as the one used by `fitText()`.
- The `outline` CSS property was used instead of `border`.  
  This is because in Remotion, the border is inside by default and shrinks the container, due to `box-sizing: border-box` being in the default stylesheet.

## Important considerations

See [Best practices](/docs/layout-utils/best-practices) to ensure you get correct measurements.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/layout-utils/src/layouts/fit-text.ts)
- [`@remotion/layout-utils`](/docs/layout-utils)
- [`@remotion/google-fonts`](/docs/google-fonts)
