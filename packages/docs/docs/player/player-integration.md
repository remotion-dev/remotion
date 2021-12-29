---
id: integration
sidebar_label: "Integrate into your app"
title: "Integrating Player into your app"
slug: /player/integration
---

import Tabs from "@theme/Tabs";

If you are using the player, a common desire is to share the code with your Remotion Preview and/or server-side rendering. With the correct setup, you can write the component once and use it for previewing, displaying and rendering.

## Setup

Set up a React project with your preferred setup, such as [Create React App](https://reactjs.org/docs/create-a-new-react-app.html) or [Next.JS](https://nextjs.org/learn/basics/create-nextjs-app/setup).

When your project is setup, add the necessary Remotion dependencies:

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
]
}>
<TabItem value="npm">

```bash
npm i remotion @remotion/renderer @remotion/cli @remotion/bundler @remotion/player
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add remotion @remotion/renderer @remotion/cli @remotion/bundler @remotion/player
```

  </TabItem>
</Tabs>

Afterwards, create a subfolder for Remotion within your project and add three files: An index file, a `Video.tsx` file for your list of compositions, and a file with your composition. It could look like this:

```diff
 └── src/
+  ├── remotion/
+  │   ├── index.tsx
+  │   ├── MyComp.tsx
+  │   └── Video.tsx
   └── app/
       └── App.tsx
```

Your composition (`remotion/MyComp.tsx` in the example) could look for example look like this:

```tsx twoslash
export const MyComp: React.FC<{ text: string }> = ({ text }) => {
  return <div>Hello {text}!</div>;
};
```

Your list of videos (`remotion/Video.tsx` in the example) could look like this:

```tsx twoslash
// @allowUmdGlobalAccess
// @filename: ./MyComp.tsx
export const MyComp = () => <></>;

// @filename: index.tsx
// ---cut---
import React from "react";
import { Composition } from "remotion";
import { MyComp } from "./MyComp";

export const MyVideo = () => {
  return (
    <>
      <Composition
        component={MyComp}
        durationInFrames={120}
        width={1920}
        height={1080}
        fps={30}
        id="my-comp"
        defaultProps={{ text: "World" }}
      />
    </>
  );
};
```

Your index file (`remotion/index.tsx` in the example) could look like this:

```tsx twoslash
// @filename: ./Video.tsx
export const Video: React.FC<{ text: string }> = () => <></>;

// ---cut---
import { registerRoot } from "remotion";
import { Video } from "./Video";

registerRoot(Video);
```

:::tip
Don't move these statements together into one file, as you might break Fast Refresh.
:::

## Using Remotion Preview

You can open the Remotion Preview using the `npx remotion preview command`:

```bash
npx remotion preview src/remotion/index.tsx
```

We recommend adding a new script into your package.json for easy access:

```diff
  "scripts": {
+    "video": "remotion preview src/remotion/index.tsx"
  }
```

## Adding `<Player />` to your app

Anywhere in your app, import the [`<Player />`](/docs/player) component and your Composition component.

```tsx twoslash
// @allowUmdGlobalAccess
// @filename: ./remotion/MyComp.tsx
export const MyComp = () => <></>;

// @filename: index.tsx
// ---cut---
import { Player } from "@remotion/player";
import { MyComp } from "./remotion/MyComp";

export const App: React.FC = () => {
  return (
    <Player
      component={MyComp}
      durationInFrames={120}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      style={{
        width: 1280,
        height: 720,
      }}
      controls
    />
  );
};
```

:::tip
Don't import your composition list or index file into your webapp. It will do nothing.
:::

If everything worked, you can now run your webapp and preview your video.

## Creating a bundle for server-side rendering

In any Node.JS context, you can call [`bundle()`](/docs/bundle) to bundle your video using Webpack and to server-side render the video.

```ts twoslash title="server.tsx"
// @module: ESNext
// @target: ESNext

import path from "path";
import { bundle } from "@remotion/bundler";

const bundled = await bundle(
  path.join(process.cwd(), "src", "remotion", "index.tsx")
);
```

See [Server-side rendering](/docs/ssr) for a full example.

:::tip
When using Lambda, you don't need this, you can use the CLI or `deploySite()` which will bundle the video for you.
:::

## See also

- [`<Player />`](/docs/player)
