---
image: /generated/articles-docs-google-fonts-load-font.png
title: loadFont()
crumb: "@remotion/google-fonts"
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

:::info
A large font file paired with a limited bandwith can potentially lead to a render timeout. By specifing the exact style, weights and subsets you need, the filesize can be reduced and possibly prevent the render from timing out. If the if the problem persists, [increasing the timeout](/docs/timeout#increase-timeout) will help further.
:::

If you want to load multiple styles, use multiple `loadFont()` statements.

```tsx twoslash title="Load a specific style, weight and subset"
import { AbsoluteFill } from "remotion";
import { fontFamily, loadFont } from "@remotion/google-fonts/Lobster";

const { waitUntilDone } = loadFont("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

// Optional: Act once the font has been loaded
waitUntilDone().then(() => {
  console.log("Font is loaded");
});

export const GoogleFontsExample: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        // Pass the `fontFamily` you imported as a style
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

All arguments and options are optional. Use TypeScript autocompletion or [`getInfo`](/docs/google-fonts/get-info) to discover available options. With any of them, all styles, weights and subsets are loaded.

### style

The font style we want to load. While each font has a different set of styles, common options are: `normal`, `italic` etc.

### options

#### weights

_optional_

Array of weights that should be loaded. By default, all.

#### subsets

_optional_

Array of font subsets that should be loaded. By default, all.

#### document

_optional_

Allows you to specify a [`Document`](https://developer.mozilla.org/en-US/docs/Web/API/Document?retiredLocale=de). If you want to inject the fonts into an iframe, you want to give it a ref and pass `iframeRef.contentDocument` to this parameter. By default, the global `window.document` is used.

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

### `waitUntilDone`<AvailableFrom v="4.0.135"/>

A function that returns a promise that resolves when the font is loaded.

```tsx title="Load a font in the background"
import { loadFont } from "@remotion/google-fonts/Lobster";

loadFont("normal", {
  weights: ["400"],
  subsets: ["latin"],
})
  .waitUntilDone()
  .then(() => {
    console.log("Done loading");
  });
```

## See also

- [Fonts](/docs/fonts)
- [`@remotion/google-fonts`](/docs/google-fonts)
