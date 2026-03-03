---
image: /generated/articles-docs-google-fonts-index.png
id: google-fonts
sidebar_label: Overview
title: '@remotion/google-fonts'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {TableOfContents} from './TableOfContents';

The `@remotion/google-fonts` package provides APIs for easily integrating [Google Fonts](https://fonts.google.com/) into Remotion.

## Installation

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
]
}>
<TabItem value="npm">

```bash
npm i @remotion/google-fonts
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add @remotion/google-fonts
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i @remotion/google-fonts
```

  </TabItem>
</Tabs>

## Usage

To load a font, import the package `@remotion/google-fonts/<FontName>` and call [`loadFont()`](/docs/google-fonts/load-font).

For production, start with these defaults:

- Pass a style and usually `weights` + `subsets` to avoid loading unnecessary variants.
- Load your fonts in one module and reuse the exports.
- If you use text measurement APIs, gate rendering until fonts are ready using a higher-order component.

```tsx twoslash title="Load one style, weight and subset"
import {loadFont} from '@remotion/google-fonts/TitanOne';

const {fontFamily} = loadFont('normal', {
  weights: ['400'],
  subsets: ['latin'],
}); // "Titan One"
```

If you want to import multiple fonts and want to avoid a variable name collision, you can import the fonts using an `import * as` statement.

```tsx twoslash title="Scope loadFont() variable"
import * as Montserrat from '@remotion/google-fonts/Montserrat';
Montserrat.loadFont('normal', {
  weights: ['400'],
  subsets: ['latin'],
});
```

Call [`loadFont()`](/docs/google-fonts/load-font) to start the loading process. Calling it without arguments loads every style, weight and subset, which can cause unnecessary requests.

Use TypeScript autocomplete to see the available styles. To further narrow down what's being loaded, specify `weights` and `subsets`. If you need multiple styles, call `loadFont()` multiple times.

```tsx twoslash title="Load multiple styles explicitly"
import * as Montserrat from '@remotion/google-fonts/Montserrat';

Montserrat.loadFont('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
});
Montserrat.loadFont('italic', {
  weights: ['400'],
  subsets: ['latin'],
});
```

[`loadFont()`](/docs/google-fonts/load-font) returns an object with a `fontFamily` property. You can use the `style` attribute to render text in the font you loaded.

```tsx twoslash title="Use the fontFamily property"
import {loadFont} from '@remotion/google-fonts/TitanOne';
import {AbsoluteFill} from 'remotion';

const {fontFamily} = loadFont('normal', {
  weights: ['400'],
  subsets: ['latin'],
});

export const GoogleFontsDemoComposition = () => {
  return (
    <AbsoluteFill
      style={{
        fontFamily,
      }}
    >
      <div>Hallo Google Fonts</div>
    </AbsoluteFill>
  );
};
```

If your project uses multiple fonts, define them in one file and export a `waitForFonts()` helper:

```tsx twoslash title="fonts.ts"
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadRobotoMono} from '@remotion/google-fonts/RobotoMono';

const inter = loadInter('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
});
const mono = loadRobotoMono('normal', {
  weights: ['400'],
  subsets: ['latin'],
});

export const waitForFonts = async () => {
  await Promise.all([inter.waitUntilDone(), mono.waitUntilDone()]);
};
```

If you use text measurement APIs, wrap your content in a component that waits for your fonts before rendering. See the [higher-order component example](/docs/layout-utils/best-practices#example-with-high-order-component) and [font loading troubleshooting](/docs/troubleshooting/font-loading-errors).

To get information about a font, you can import the `getInfo()` function:

```tsx twoslash title="Get info about the font"
import {getInfo} from '@remotion/google-fonts/Montserrat';
console.log(getInfo());
```

```json title="Example value of info object"
{
  "fontFamily": "Titan One",
  "importName": "TitanOne",
  "version": "v13",
  "url": "https://fonts.googleapis.com/css2?family=Titan+One:ital,wght@0,400",
  "unicodeRanges": {
    "latin-ext": "U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF",
    "latin": "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
  },
  "fonts": {
    "normal": {
      "400": {
        "latin-ext": "https://fonts.gstatic.com/s/titanone/v13/mFTzWbsGxbbS_J5cQcjCmjgm6Es.woff2",
        "latin": "https://fonts.gstatic.com/s/titanone/v13/mFTzWbsGxbbS_J5cQcjClDgm.woff2"
      }
    }
  },
  "subsets": ["latin", "latin-ext"]
}
```

To get a list of all available fonts, you can call [`getAvailableFonts()`](/docs/google-fonts/get-available-fonts) imported from `@remotion/google-fonts`:

```ts twoslash
import {getAvailableFonts} from '@remotion/google-fonts';

console.log(getAvailableFonts());
```

## APIs

<TableOfContents />

## Troubleshooting

Known issues:

- [delayRender timeout when fetching fonts](/docs/troubleshooting/font-loading-errors#render-timeout-when-loading-google-fonts)

## Credits

Implemented by [Hidayatullah](https://github.com/ayatkyo).

## License

MIT

## See also

- [Fonts](/docs/fonts)
- [`loadFont()`](/docs/google-fonts/load-font)
