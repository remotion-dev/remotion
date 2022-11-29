---
image: /generated/articles-docs-player-installation.png
id: installation
title: Installation
slug: /player/installation
crumb: "@remotion/player"
---

import {TableOfContents} from '../../components/TableOfContents/player';

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To install the Player, run the following command in a React project:

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
npm i remotion @remotion/player
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i remotion @remotion/player
```

  </TabItem>
  <TabItem value="yarn">

```bash
yarn add remotion @remotion/player
```

  </TabItem>

</Tabs>

Also update **all the other Remotion packages** to have the same version: `remotion`, `@remotion/cli` and others.

:::note
Make sure no package version number has a `^` character in front of it as it can lead to a version conflict.
:::

Read the [examples](/docs/player/examples) and [API reference](/docs/player/player) next.

## Components

<TableOfContents />
