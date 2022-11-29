---
image: /generated/articles-docs-dataset-render.png
id: dataset-render
sidebar_label: Render a dataset
title: Render videos programmatically from a dataset
crumb: "Tutorials"
---

import { Player } from "@remotion/player";
import { DatasetDemo} from "../components/Dataset/DatasetDemo";

You can use Remotion to do a batch render to create many videos based on a dataset. In the following example, we are going to turn a JSON dataset into a series of videos.

We'll start by creating a blank Remotion project:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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
npm init video --blank
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm create video --blank
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn create video --blank
```

  </TabItem>
</Tabs>

## Sample dataset

JSON is the most convienient format to import in Remotion. If your dataset is in a different format, you can convert it using one of many available libraries on NPM.

```ts title="my-data.ts"
export const data = [
  {
    name: "React",
    repo: "facebook/react",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
  },
  {
    name: "Remotion",
    repo: "remotion-dev/remotion",
    logo: "https://github.com/remotion-dev/logo/raw/main/withouttitle/element-0.png",
  },
];
```

## Sample component

This component will animate a title, subtitle and image using Remotion. Replace the contents of the `src/Composition.tsx` file with the following:

```tsx title="Composition.tsx"
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface Props {
  name: string;
  logo: string;
  repo: string;
}

export const MyComposition: React.FC<Props> = ({ name, repo, logo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame - 10,
    config: {
      damping: 100,
    },
  });

  const opacity = interpolate(frame, [30, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const moveY = interpolate(frame, [20, 30], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        scale: String(scale),
        backgroundColor: "white",
        fontWeight: "bold",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
        }}
      >
        <Img
          src={logo}
          style={{
            height: 80,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 40,
              transform: `translateY(${moveY}px)`,
              lineHeight: 1,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 20,
              opacity,
              lineHeight: 1.25,
            }}
          >
            {repo}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

<DatasetDemo />

## Writing the script

In order to render our videos, we'll first need to bundle our project using Webpack and prepare it for rendering.
This can be done by using the [`bundle()`](/docs/bundle) function from the [`@remotion/bundler`](/docs/bundler) package.

```ts twoslash
// @module: esnext
// @target: es2022
import { bundle } from "@remotion/bundler";

const bundleLocation = await bundle({
  entryPoint: "./src/index.ts",
});
```

## Getting the composition

We can use [`getCompositions()`](/docs/renderer/get-compositions) to extract all the defined compositions. Select the composition by searching for the composition ID that is defined in `src/Root.tsx` - by default `MyComp`:

```tsx twoslash
// @module: esnext
// @target: es2022

const bundleLocation = "xxx";
// ---cut---

import { getCompositions } from "@remotion/renderer";

const compositionId = "MyComp";
const allCompositions = await getCompositions(bundleLocation);

const composition = allCompositions.find((c) => c.id === compositionId);

if (!composition) {
  throw new Error(`No composition with the ID ${compositionId} found.`);
}
```

By throwing an error if the composition does not exist, we tell TypeScript that we are sure that `composition` is not `undefined`.

## Rendering videos

Import the dataset and loop over each entry. Trigger a render using [`renderMedia()`](/docs/renderer/render-media) and pass the data entry as [`inputProps`](/docs/renderer/render-media#inputprops). This will pass the object as React props to the component above.

```ts twoslash
// @module: esnext
// @target: es2022
// @filename: dataset.ts
export const data = [
  {
    name: "React",
    repo: "facebook/react",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
  },
  {
    name: "Remotion",
    repo: "remotion-dev/remotion",
    logo: "https://github.com/remotion-dev/logo/raw/main/withouttitle/element-0.png",
  },
];

const bundleLocation = "xxx";

// @filename: render.ts
const composition = {
  width: 1000,
  height: 1000,
  fps: 30,
  durationInFrames: 30,
  id: "hi",
};
const bundleLocation = "xxx";
// ---cut---
import { renderMedia } from "@remotion/renderer";
import { data } from "./dataset";

for (const entry of data) {
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: `out/${entry.name}.mp4`,
    inputProps: entry,
  });
}
```

:::note
It is not recommended to render more than one video at once.
:::

## Full script

Currently, top level `await` is not well supported, so all asynchronous functions were wrapped in an async function and which is immediately called.

```ts twoslash title="render.ts"
// @filename: dataset.ts
export const data = [
  {
    name: "React",
    repo: "facebook/react",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
  },
  {
    name: "Remotion",
    repo: "remotion-dev/remotion",
    logo: "https://github.com/remotion-dev/logo/raw/main/withouttitle/element-0.png",
  },
];

// @filename: render.ts
// ---cut---
import { getCompositions, renderMedia } from "@remotion/renderer";
import { bundle } from "@remotion/bundler";
import { data } from "./dataset";

const compositionId = "MyComp";

const start = async () => {
  const bundleLocation = await bundle({
    entryPoint: "./src/index.ts",
  });

  const allCompositions = await getCompositions(bundleLocation);

  const composition = allCompositions.find((c) => c.id === compositionId);

  if (!composition) {
    throw new Error(`No composition with the ID ${compositionId} found.`);
  }

  for (const entry of data) {
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: `out/${entry.name}.mp4`,
      inputProps: entry,
    });
  }
};

start()
  .then(() => {
    console.log("Rendered all videos");
  })
  .catch((err) => {
    console.log("Error occurred:", err);
  });
```

## Running the script

To help us in running the render, we need to install `ts-node` from npm.

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
npm i ts-node
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm i ts-node
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add ts-node
```

  </TabItem>
</Tabs>

You can then run the script using

```bash
npx ts-node render.ts
```

## Rendering videos from a CSV dataset

Use a package like [`csv2json`](https://www.npmjs.com/package/csv2json) to convert your dataset into a JSON.

## Change duration, width or height dynamically

Call [`getCompositions()`](/docs/renderer/get-compositions) with the [`inputProps`](/docs/renderer/get-compositions#inputprops) option and [change the metadata programmatically as described here](/docs/dynamic-metadata).

## Credits

Authored by [Alex Fernandez](https://github.com/alexfernandez803) and [ThePerfectSystem](https://github.com/ThePerfectSystem), edited by Jonny Burger.

## See also

- [Example repository using a dataset](https://github.com/alexfernandez803/remotion-dataset)
