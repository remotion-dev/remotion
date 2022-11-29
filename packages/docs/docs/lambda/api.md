---
title: "@remotion/lambda"
crumb: "Render videos without servers"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {TableOfContents} from '../../components/TableOfContents/lambda';

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
npm i @remotion/lambda
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i @remotion/lambda
```

  </TabItem>
  <TabItem value="yarn">

```bash
yarn add @remotion/lambda
```

  </TabItem>

</Tabs>

Also update **all the other Remotion packages** to have the same version: `remotion`, `@remotion/cli` and others.

:::note
Make sure no package version number has a `^` character in front of it as it can lead to a version conflict.
:::

**See the [setup guide](/docs/lambda/setup) for complete instructions on how to get started.**

## APIs

The following Node.JS are available:

<TableOfContents />

## CLI

See [here](/docs/lambda/cli) for a list of CLI commands.
