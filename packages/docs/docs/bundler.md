---
title: "@remotion/bundler"
---

import {TableOfContents} from '../components/TableOfContents/bundler';

A package containing the [`bundle()`](/docs/bundle) function, which takes a Remotion project and bundles it using Webpack, preparing it to be used by server-side rendering functions such as [`getCompositions()`](/docs/renderer/get-compositions) and [`renderMedia()`](/docs/renderer/render-media)

## Installation

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'pnpm', value: 'pnpm', },
{ label: 'yarn', value: 'yarn', },
]
}>
<TabItem value="npm">

```bash
npm i @remotion/bundler
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i @remotion/bundler
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add @remotion/bundler
```

  </TabItem>
</Tabs>

## API

<TableOfContents />

## License

[Remotion License](https://remotion.dev/license)
