---
image: /generated/articles-docs-gif-index.png
sidebar_label: "@remotion/gif"
title: "@remotion/gif"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {TableOfContents} from '../../components/TableOfContents/gif';

You can install this package from NPM to get a component for displaying GIFs that synchronize with Remotions [`useCurrentFrame()`](/docs/use-current-frame).

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
npm i @remotion/gif
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i @remotion/gif
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add @remotion/gif
```

  </TabItem>
</Tabs>

Also update **all the other Remotion packages** to have the same version: `remotion`, `@remotion/cli` and others.

:::note
Make sure no package version number has a `^` character in front of it as it can lead to a version conflict.
:::

## APIs

The following APIs are available:

<TableOfContents />
