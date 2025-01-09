---
image: /generated/articles-docs-skia-skia.png
id: skia
sidebar_label: Overview
title: '@remotion/skia'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {ExperimentalBadge} from '../../components/Experimental';
import {TableOfContents} from './TableOfContents';

This package provides utilities useful for integrating [React Native Skia](https://github.com/Shopify/react-native-skia) with Remotion.

## Installation

Install, `@remotion/skia` as well as `@shopify/react-native-skia`.

<Installation pkg="@remotion/skia @shopify/react-native-skia" />

:::note
Since Remotion `v3.3.93` and React Native Skia `0.1.191`, `react-native-web` is not a dependency anymore. You may remove it from your project.
:::

Also update **all the other Remotion packages** to have the same version: `remotion`, `@remotion/cli` and others.

:::note
Make sure no package version number has a `^` character in front of it as it can lead to a version conflict.
:::

[Override the Webpack config](/docs/webpack) by using [`enableSkia()`](/docs/skia/enable-skia).

```ts twoslash title="remotion.config.ts"
import {Config} from '@remotion/cli/config';
import {enableSkia} from '@remotion/skia/enable';

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableSkia(currentConfiguration);
});
```

:::note
Prior to `v3.3.39`, the option was called `Config.Bundling.overrideWebpackConfig()`.
:::

Next, you need to refactor the [entry point](/docs/terminology/entry-point) file to first load the Skia WebAssembly binary before calling registerRoot():

```ts twoslash title="src/index.ts"
// @filename: ./Root.tsx
export const RemotionRoot = () => <></>;

// @filename: index.tsx
// ---cut---
import { LoadSkia } from "@shopify/react-native-skia/src/web";
import { registerRoot } from "remotion";

(async () => {
  await LoadSkia();
  const { RemotionRoot } = await import("./Root");
  registerRoot(RemotionRoot);
})();
```

You can now start using the [`<SkiaCanvas>`](/docs/skia/skia-canvas) in your Remotion project.

## Templates

You can find the [starter template](https://github.com/remotion-dev/template-skia) here or install it using:

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'bun', value: 'bun', },
{ label: 'pnpm', value: 'pnpm', },
{ label: 'yarn', value: 'yarn', },
]
}>
<TabItem value="npm">

```bash
npx create-video --skia
```

  </TabItem>
    <TabItem value="bun">

```bash
bun create video --skia
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn create video --skia
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm create video --skia
```

  </TabItem>
</Tabs>

## Rendering

By default Remotion rendering are done on the CPU. Some Skia effects rely on advanced GPU features, which may be slow to run on the CPU depending on the kind of effect you are using. If your Skia export is extremely slow, we found that enabling the GPU via the `--gl=angle` option improves things substantially. Please check out the documentation on [GPU rendering](/docs/gpu).

```sh
remotion render Main out/video.mp4 --gl=angle
```

## Resources

- [Example project by William Candillon](https://github.com/wcandillon/remotion-skia-tutorial)
- [Tutorial for the example project](https://www.youtube.com/watch?v=-7MOoWN2_nk)

## APIs

<TableOfContents />
