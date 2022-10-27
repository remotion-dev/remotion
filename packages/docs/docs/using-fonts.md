---
title: Using fonts
id: fonts
---

Here are some ways how you can use custom fonts in Remotion.

## Google Fonts using CSS

Import the CSS that Google Fonts gives you. From version 2.2 on, Remotion will automatically wait until the fonts are loaded.

```css title="font.css"
@import url("https://fonts.googleapis.com/css2?family=Bangers");
```

```tsx twoslash title="MyComp.tsx"
import "./font.css";

const MyComp: React.FC = () => {
  return <div style={{ fontFamily: "Bangers" }}>Hello</div>;
};
```

## Google Fonts using `@remotion/google-fonts`

Instead of writing separate CSS files to import Google Fonts, we can use [`@remotion/google-fonts`](./google-fonts/index.md) to easily integrate it in Remotion and get some TypeScript auto-complete feature.

```tsx title="MyComp.tsx"
import { fontFamily, loadFont } from "@remotion/google-fonts/TitanOne";

const GoogleFontsComp: React.FC = () => {
  return <div style={{ fontFamily: fontFamily }}>Hello, Google Fonts</div>;
};
```

## Example using local fonts

Put the font into your `public/` folder and use the [`staticFile()`](/docs/staticfile) API to load the font. Use the `FontFace` browser API to load the font. [Click here](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face) to read the syntax that can be used for the Font Face API.

Put this somewhere in your app where it gets executed:

```tsx twoslash title="load-fonts.ts"
import { continueRender, delayRender, staticFile } from "remotion";

const waitForFont = delayRender();
const font = new FontFace(
  `Bangers`,
  `url(${staticFile("bangers.woff2")}) format('woff2')`
);

font
  .load()
  .then(() => {
    document.fonts.add(font);
    continueRender(waitForFont);
  })
  .catch((err) => console.log("Error loading font", err));
```

The font is now available for use:

```tsx twoslash title="MyComp.tsx"
<div style={{ fontFamily: "Bangers" }}>Some text</div>
```

:::info
If your Typescript types give errors, install the newest version of the `@types/web` package.
:::
