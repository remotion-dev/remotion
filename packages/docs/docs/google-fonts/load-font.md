---
title: loadFont()
---

Load font with selected style, weights, and subsets.

```tsx
const loadFont: (
  style: string,
  options: {
    weights: string[],
    subsets: string[],
  }
) => void;
```

## Example

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

## Argumets

### style

The font style we want to load.

### options

#### weights

List of Font weights that we want to load.

#### subsets

List of Font subsets that we want to load.