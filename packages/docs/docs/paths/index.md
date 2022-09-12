---
title: "@remotion/paths"
---

import {TableOfContents} from '../../components/TableOfContents/paths';

A package providing utility functions for dealing with SVG paths. This package includes code from [`svg-path-properties`](https://www.npmjs.com/package/svg-path-properties), [`svg-path-reverse`](https://github.com/Pomax/svg-path-reverse#readme) and [`d3-interpolate-path`](https://github.com/pbeshai/d3-interpolate-path) with the following improvements:

- Functional style APIs
- First class Typescript types
- Documentation with examples
- ESM import style

This package has no dependencies, meaning this package can be used without Remotion.

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
npm i @remotion/paths
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i @remotion/paths
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add @remotion/paths
```

  </TabItem>
</Tabs>

## Functions

<TableOfContents />

## License

MIT
