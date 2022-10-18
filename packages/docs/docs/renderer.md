---
slug: renderer
sidebar_label: Overview
title: "@remotion/renderer"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {TableOfContents} from '../components/TableOfContents/renderer';

The `@remotion/renderer` package provides APIs for rendering video server-side.
The package is also internally used by the Remotion CLI and [Remotion Lambda](/docs/lambda).

:::warning
The configuration file has no effect when using these APIs.
:::warn

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
npm i @remotion/renderer
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i @remotion/renderer
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add @remotion/renderer
```

  </TabItem>
</Tabs>

Also update **all the other Remotion packages** to have the same version: `remotion`, `@remotion/cli` and others.

:::note
Make sure no package version number has a `^` character in front of it as it can lead to a version conflict.
:::

## Server-side rendering examples

See the [Server-side rendering](/docs/ssr) for some examples of how to use server-side rendering.

## Available functions

The following APIs are available in the `@remotion/renderer` package:

<TableOfContents />

## What's the difference between `renderMedia()` and `renderFrames()`?

In Remotion 3.0, we added the [`renderMedia()`](/docs/renderer/render-media) API which combines `renderFrames()` and `stitchFramesToVideo()` into one simplified step and performs the render faster. Prefer `renderMedia()` if you can.
