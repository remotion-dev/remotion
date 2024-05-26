---
image: /generated/articles-docs-tailwind-overview.png
id: tailwind
sidebar_label: Overview
title: "@remotion/tailwind"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {ExperimentalBadge} from '../../components/Experimental';

This package provides utilities useful for integrating [TailwindCSS](https://tailwindcss.com/) with Remotion, as documented on our [TailwindCSS](/docs/tailwind) page.

## Installation

Install `@remotion/tailwind` as well as TailwindCSS dependencies.

<Installation pkg="@remotion/tailwind"/>

<br/>

[Override the Webpack config](/docs/webpack) by using [`enableTailwind()`](/docs/tailwind/enable-tailwind).

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind";

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration);
});
```

Then follow the remaining set up steps from the [TailwindCSS](/docs/tailwind) page.

## Templates

You can find the [starter template](https://github.com/remotion-dev/template-tailwind) here or install it using:

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
{ label: 'bun', value: 'bun', },
]
}>
<TabItem value="npm">

```bash
npx create-video --tailwind
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn create video --tailwind
```

  </TabItem>
    <TabItem value="bun">

```bash
bun create video --tailwind
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm create video --tailwind
```

  </TabItem>

</Tabs>

## APIs

- [`enableTailwind()`](/docs/tailwind/enable-tailwind)
