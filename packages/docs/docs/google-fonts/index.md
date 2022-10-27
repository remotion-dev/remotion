---
id: google-fonts
sidebar_label: Overview
title: "@remotion/google-fonts"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

All Google Fonts is available under `"@remotion/google-fonts/<FontName>"`.

So if we want to use **Montserrat** font then we can import it from `"@remotion/google-fonts/Montserrat"`.

## Usage

Before using it, we need to import the fonts we want first, there are 2 ways to do this.

**Import one font**

```tsx
import { loadFont, fontFamily } from "@remotion/google-fonts/TitanOne";
```

**Import multiple fonts**

```tsx
import * as TitanOne from "@remotion/google-fonts/TitanOne";
import * as Montserrat from "@remotion/google-fonts/Montserrat";
```

After that call [loadFont()](./load-font.md) function with specific style, weights, and subsets.

```tsx
import * as TitanOne from "@remotion/google-fonts/TitanOne";
import * as Montserrat from "@remotion/google-fonts/Montserrat";

// Load Titan One font
TitanOne.loadFont("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

// Load Montserrat using 2 font style
Montserrat.loadFont("normal", {
  weights: ["400", "600", "800"],
  subsets: ["latin", "latin-ext"],
});
Montserrat.loadFont("italic", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});
```

Then use it anywhere in our code.

```tsx
import * as TitanOne from "@remotion/google-fonts/TitanOne";

TitanOne.loadFont("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

export const GoogleFontsDemoComposition = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: TitanOne.fontFamily,
      }}
    >
      <div>Hallo Google Fonts</div>
    </AbsoluteFill>
  );
};
```

## APIs

Each font will export these variables:

### loadFont()

Load font with selected style, weights, and subsets. See [loadFont()](./load-font.md).


### fontFamily

The font family name, so we can pass this instead hardcode string.

### info

Complete information about the current font.
