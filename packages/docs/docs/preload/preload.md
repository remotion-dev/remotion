---
image: /generated/articles-docs-preload-preload.png
id: preload
sidebar_label: Overview
title: "@remotion/preload"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {TableOfContents} from '../../components/TableOfContents/preload';

This package provides functions for preloading assets. While preload is not necessary for rendering, it can help with seamless playback in the [`<Player />`](/docs/player) and in the Studio. Currently, three functions are implemented:

<TableOfContents />

An alternative to `@remotion/preload` is the [`prefetch()`](/docs/prefetch) API. See [`@remotion/preload` vs `prefetch()`](/docs/player/preloading#remotionpreload-vs-prefetch) to decide which one is better for your usecase.

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
npm i @remotion/preload
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i @remotion/preload
```

  </TabItem>
  <TabItem value="yarn">

```bash
yarn add @remotion/preload
```

  </TabItem>

</Tabs>

Also update **all the other Remotion packages** to have the same version: `remotion`, `@remotion/cli` and others.

:::note
Make sure no package version number has a `^` character in front of it as it can lead to a version conflict.
:::
