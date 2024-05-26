---
image: /generated/articles-docs-using-fonts.png
title: Using fonts
sidebar_label: Fonts
id: using-fonts
crumb: "Techniques"
---

Here are some ways how you can use custom fonts in Remotion.

## Google Fonts using `@remotion/google-fonts`

_available from v3.2.40_

[`@remotion/google-fonts`](/docs/google-fonts/index.md) is a type-safe way to load Google fonts without having to create CSS files.

```tsx title="MyComp.tsx"
import { loadFont } from "@remotion/google-fonts/TitanOne";

const { fontFamily } = loadFont();

const GoogleFontsComp: React.FC = () => {
  return <div style={{ fontFamily }}>Hello, Google Fonts</div>;
};
```

## Google Fonts using CSS

Import the CSS that Google Fonts gives you. From version 2.2 on, Remotion will automatically wait until the fonts are loaded.

:::note
This does not work if you use [`lazyComponent`](/docs/composition#lazycomponent).
:::

```css title="font.css"
@import url("https://fonts.googleapis.com/css2?family=Bangers");
```

```tsx twoslash title="MyComp.tsx"
import "./font.css";

const MyComp: React.FC = () => {
  return <div style={{ fontFamily: "Bangers" }}>Hello</div>;
};
```

## Local fonts using `@remotion/fonts`

_available from v4.0.164_

Put the font into your `public/` folder.
Put this somewhere in your app where it gets executed:

```tsx twoslash title="load-fonts.ts"
import {loadFont} from "@remotion/fonts";

loadFont({
	family: 'Font family name',
	url: 'Local font url',
	weight: '500',
	// ... other options 
}).then(() => console.log('Font loaded!'))
```

:::note
Check the available options [around the URL](/docs/fonts/load-font).  
The font format should be one of `woff2` for WOFF2 files, `woff` for WOFF, `opentype` for OTF, `truetype` for TTF.
:::

The font is now available for use:

```tsx twoslash title="MyComp.tsx"
<div style={{ fontFamily: "Bangers" }}>Some text</div>
```

:::info
If your Typescript types give errors, install the newest version of the `@types/web` package.
:::
