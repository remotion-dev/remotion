---
title: loadFont()
---

_Part of the [`@remotion/google-fonts`](/docs/google-fonts) package_

Load a [Google Font](https://fonts.google.com) for use in Remotion.

- Automatically blocks the render until the font is ready
- Offers a way to narrow down weights, styles and character subsets.
- Each `loadFont()` call is typesafe and available options are exposed through autocompletion.

## Usage

Without arguments, all styles, weights and character subsets of a font are being loaded.

```tsx twoslash title="Load all variants of the Lobster font"
import { loadFont } from "@remotion/google-fonts/Lobster";
import { AbsoluteFill } from "remotion";

const { fontFamily } = loadFont();

export const GoogleFontsExample: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        fontFamily: fontFamily,
      }}
    >
      <h1>Google Fonts</h1>
    </AbsoluteFill>
  );
};
```

Pass a specific style (e.g. `normal`, `italic`) and optionally weights and subsets to narrow down what gets loaded.  
If you want to load multiple styles, use multiple `loadFont()` statements.

```tsx title="Load a specific style, weight and subset"
import { fontFamily, loadFont } from "@remotion/google-fonts/Lobster";

loadFont("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

export const GoogleFontsExample: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: fontFamily,
        fontSize: 280,
      }}
    >
      <h1>Google Fonts</h1>
    </AbsoluteFill>
  );
};
```

## Arguments

All arguments and options are optional. Use TypeScript autocompletion or `info` to discover available options. With any of them, all styles, weights and subsets are loaded.

### style

The font style we want to load. While each font has a different set of styles, common options are: `normal`, `italic` etc.

### options

#### weights

Array of weights that should be loaded. By default, all.

#### subsets

Array of font subsets that should be loaded. By default, all.

## Return value

An object with the following properties:

### fontFamily

The font family name, be used as the `fontFamily` CSS property.

### fonts

Variant information about the font.

```js title="Example value"
{
  normal: {
    '400': {
      'latin-ext': 'https://fonts.gstatic.com/s/titanone/v13/mFTzWbsGxbbS_J5cQcjCmjgm6Es.woff2',
      'latin': 'https://fonts.gstatic.com/s/titanone/v13/mFTzWbsGxbbS_J5cQcjClDgm.woff2',
    },
  },
}
```

### unicodeRanges

Unicode range information about the font.

```js title="Example value"
{
  'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
  'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
}
```

## See also

- [Fonts](/docs/fonts)
- [`@remotion/google-fonts`](/docs/google-fonts)
