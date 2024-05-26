---
image: /generated/articles-docs-fonts-index.png
id: fonts
sidebar_label: Overview
title: "@remotion/fonts"
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


The `@remotion/fonts` package provides APIs for easily load local fonts into Remotion.

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
npm i @remotion/fonts
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add @remotion/fonts
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i @remotion/fonts
```

  </TabItem>
</Tabs>

## Usage

Put the font into your `public/` folder.
To load a font, import the package `@remotion/fonts` and call [`loadFont()`](/docs/fonts/load-font).

```tsx twoslash
import { loadFont } from "@remotion/fonts/";
loadFont({  
	family: 'some name',
	url: 'someName',
	weight: '500',
	// ... other options 
}).then(() => console.log('Font loaded!'))
```

:::note
Check the available options [around the URL](/docs/fonts/load-font).  
The font format should be one of `woff2` for WOFF2 files, `woff` for WOFF, `opentype` for OTF, `truetype` for TTF.
:::
