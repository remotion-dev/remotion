---
title: loadFont()
---

Load font with selected style, weights, and subsets.

```tsx
const loadFont: (
  style?: string,
  options?: {
    weights?: string[],
    subsets?: string[],
  }
) => void;
```

## Example

### Load all variant

```tsx
import { loadFont, fontFamily } from "@remotion/google-fonts/Lobster";

loadFont();

export const GoogleFontsExample: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: fontFamily,
        fontSize: 280,
      }}
    >
      <h1>Google Fonts</h1>
    </AbsoluteFill>
  );
};
```

### Load specific variant

```tsx
import { loadFont, fontFamily } from "@remotion/google-fonts/Lobster";

loadFont("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

export const GoogleFontsExample: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: fontFamily,
        fontSize: 280,
      }}
    >
      <h1>Google Fonts</h1>
    </AbsoluteFill>
  );
};
```

### Load font and use returned information

```tsx
import { loadFont } from "@remotion/google-fonts/Lobster";

const { fontFamily } = loadFont();

export const GoogleFontsExample: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: fontFamily,
        fontSize: 280,
      }}
    >
      <h1>Google Fonts</h1>
    </AbsoluteFill>
  );
};
```

## Argumets

Arguments can be omited if we want to load all variant available.

### style

_optional_

The font style we want to load.

### options

_optional_

#### weights

_optional_

List of Font weights that we want to load.

#### subsets

_optional_

List of Font subsets that we want to load.

## Return value

### fontFamily

The font family name.

### fonts

The font variant information.

**Example:**

```js
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

The font unicode ranges information.

**Example:**

```js
{
  'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
  'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
}
```