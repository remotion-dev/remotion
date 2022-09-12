---
id: gif
sidebar_label: "@remotion/gif"
title: "@remotion/gif"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

## Props

### `src`

_required_

The source of the GIF. Can be an URL or a local image - see [Importing assets](/docs/assets).

:::info
Remote GIFs need to support [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

<details>
<summary>More info</summary>
<ul>
<li>
Remotion's origin is usually <code>http://localhost:3000</code>, but it may be different if rendering on Lambda or the port is busy.
</li>
<li>
You can <a href="/docs/chromium-flags#--disable-web-security">disable CORS</a> during renders.
</li>
</ul>
</details>
:::

### `width`

The display width.

### `height`

The display height.

### `fit`

Must be one of these values:

- `'fill'`: The GIF will completely fill the container, and will be stretched if necessary. (_default_)
- `'contain'`: The GIF is scaled to fit the box, while aspect ratio is maintained.
- `'cover'`: The GIF completely fills the container and maintains it's aspect ratio. It will be cropped if necessary.

### `onLoad`

Callback that gets called once the GIF has loaded and finished processing. As its only argument, the callback gives the following object:

- `loaded`: Will be always `true`.
- `width`: Width of the GIF file in pixels.
- `height`: Height of the GIF file in pixels.
- `delays`: Array of timestamps of type `number` containing position of each frame.
- `frames`: Array of frames of type [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)

### `style`

Allows to pass in custom CSS styles.

## Example

```tsx twoslash
import { useVideoConfig } from "remotion";
// ---cut---
import { Gif } from "@remotion/gif";

export const MyComponent: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <Gif
      src="https://media.giphy.com/media/3o72F7YT6s0EMFI0Za/giphy.gif"
      width={width}
      height={height}
      fit="fill"
    />
  );
};
```
