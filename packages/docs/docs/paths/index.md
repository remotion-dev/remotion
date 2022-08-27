---
title: "@remotion/paths"
---

A package providing utility functions for dealing with SVG paths. This package consists of code from [`svg-path-properties`](https://www.npmjs.com/package/svg-path-properties) and [`svg-path-reverse`](https://github.com/Pomax/svg-path-reverse#readme) with the following improvements:

- Functional style APIs
- First class Typescript types
- Documentation with examples
- ESM import style

No dependencies are needed, meaning this package can be used independently of Remotion.

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

- [`getLength()`](/docs/paths/get-length)
- [`getParts()`](/docs/paths/get-parts)
- [`getPointAtLength()`](/docs/paths/get-point-at-length)
- [`reversePath()`](/docs/paths/reverse-path)
- [`normalizePath()`](/docs/paths/normalize-path)
- [`getTangentAtLength()`](/docs/paths/get-tangent-at-length)

## License

MIT
