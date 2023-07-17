---
image: /generated/articles-docs-lottie-index.png
id: lottie-index
sidebar_label: Overview
title: "@remotion/lottie"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {TableOfContents} from "../../components/TableOfContents/lottie"

This package provides a component for displaying [Lottie](http://airbnb.io/lottie/) animations in Remotion.

## Installation

Install, `@remotion/lottie` as well as `lottie-web`.

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
npm i @remotion/lottie lottie-web
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add @remotion/lottie lottie-web
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i @remotion/lottie lottie-web
```

  </TabItem>
</Tabs>

You can now start using the [`<Lottie>`](/docs/lottie/lottie) component in your Remotion project.

## Supported features

- Playing Lottie animations using `lottie-web`
- Change the speed of the animation
- Playing animation forwards and backwards
- Playing remote files
- Determining dimensions and duration of a Lottie animation

## Unsupported features

- Rendering on other renderers as `svg`
- `setSubFrame()`, `setLocationHref()`
- Limited expression support: Remotion uses the `.goToAndStop()` method from `lottie-web` to seek through the Lottie file. Depending on the expression, the frame might not render deterministally, leading to [flickering](/docs/flickering) in the Remotion output. Remotion cannot fix this without a change in `lottie-web` upstream. You need to evaluate on a case-by-case basis whether the expression you are using is supported by Remotion.

:::note
[Open an issue](https://remotion.dev/issue) if you want to request a currently unsupported feature.
:::

## Table of contents

<TableOfContents />

## License

[Remotion License](https://remotion.dev/license)
