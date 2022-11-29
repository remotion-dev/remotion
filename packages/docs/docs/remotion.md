---
title: "remotion"
crumb: "npm i"
---

import {TableOfContents} from '../components/TableOfContents/remotion';

A package containing the essential building blocks of expressing videos in Remotion.

Some pure functions such as [`interpolate()`](/docs/interpolate) and [`interpolateColors()`](/docs/interpolate-colors) can also be used outside of Remotion.

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
npm i remotion
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i remotion
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add remotion
```

  </TabItem>
</Tabs>

## API

The following functions and components are exposed:

<TableOfContents />

## License

[Remotion License](https://remotion.dev/license)
