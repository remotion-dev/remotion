---
image: /generated/articles-docs-parametrized-rendering.png
id: parametrized-rendering
title: Parametrized videos
crumb: "How To"
---

```twoslash include example
type Props = {
  propOne: string;
  propTwo: number;
}

export const MyComponent: React.FC<Props> = ({propOne, propTwo}) => {
  return (
    <div>props: {propOne}, {propTwo}</div>
  );
}
// - MyComponent
```

You can parametrize the content of the videos using [React properties ("props")](https://react.dev/learn/passing-props-to-a-component).

## Defining accepted props

To define which props your video accepts, simply give your component the `React.FC` type and pass in a generic argument describing the shape of the props you want to accept.

```tsx twoslash title="src/MyComponent.tsx"
// @include: example-MyComponent
```

## Define default props

When registering the component as a composition, you can define default props:

```tsx twoslash {14-17} title="src/Root.tsx"
// organize-imports-ignore

// @filename: MyComponent.tsx
import React from "react";
export const MyComponent: React.FC<{
  propOne: string;
  propTwo: number;
}> = () => null;

// @filename: Root.tsx

// ---cut---
import React from "react";
import { Composition } from "remotion";
import { MyComponent } from "./MyComponent";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="my-video"
        width={1080}
        height={1080}
        fps={30}
        durationInFrames={30}
        component={MyComponent}
        defaultProps={{
          propOne: "Hi",
          propTwo: 10,
        }}
      />
    </>
  );
};
```

Default props are useful so you don't preview your video with no data. Default props will overriden by input props.

## Define a schema <AvailableFrom v="4.0.0"/>

You can use [Zod](https://github.com/colinhacks/zod) to define a typesafe schema for your composition.

Install Zod using:

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
npm i zod @remotion/zod-types
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add zod @remotion/zod-types
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i zod @remotion/zod-types
```

  </TabItem>
</Tabs>

```tsx twoslash title="MyComp.tsx"
import { z } from "zod";

export const myCompSchema = z.object({
  propOne: z.string(),
  propTwo: z.string(),
});

export const MyComp: React.FC<z.infer<typeof myCompSchema>> = ({
  propOne,
  propTwo,
}) => {
  return (
    <div>
      props: {propOne}, {propTwo}
    </div>
  );
};
```

To define a schema, create a type using Zod and infer the props in your component using `z.infer`.  
Then, export the schema, and import it in your root file:

```tsx twoslash title="src/Root.tsx" {14-18}
// @filename: MyComponent.tsx
import React from "react";
import { z } from "zod";

export const myCompSchema = z.object({
  propOne: z.string(),
  propTwo: z.string(),
});

export const MyComponent: React.FC<z.infer<typeof myCompSchema>> = ({
  propOne,
  propTwo,
}) => {
  return (
    <div>
      <h1>{propOne}</h1>
      <h2>{propTwo}</h2>
    </div>
  );
};

// @filename: Root.tsx
// organize-imports-ignore
// ---cut---
import React from "react";
import { Composition } from "remotion";
import { MyComponent, myCompSchema } from "./MyComponent";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="my-video"
      component={MyComponent}
      durationInFrames={100}
      fps={30}
      width={1920}
      height={1080}
      schema={myCompSchema}
      defaultProps={{
        propOne: "Hello World",
        propTwo: "Welcome to Remotion",
      }}
    />
  );
};
```

If you define a schema, you will be able to visually manipulate the props in the Remotion Preview and render a parametrized video by filling out a form.

:::note
The schema must use an object `{}` as the top-level type because React props are passed as an object.
:::

## Input props

Input props are props that are passed in externally while rendering that can replace or override the default props.

:::note
Input props must be an object and serializable.
:::

### Passing input props in the CLI

When rendering (for example using the `npm run build` script defined in `package.json`), you can override some or all default props by passing a CLI flag. It must be either valid JSON or a path to a file that contains valid JSON. Using this technique, type safety cannot be guaranteed.

**Using inline JSON**

```bash
npx remotion render HelloWorld out/helloworld.mp4 --props='{"propOne": "Hi", "propTwo": 10}'
```

**Using a file path:**

```bash
npx remotion render HelloWorld out/helloworld.mp4 --props=./path/to/props.json
```

[See also: CLI flags](/docs/cli)

### Passing input props when server rendering

When server-rendering using [`renderMedia()`](/docs/renderer/render-media), you can pass props using the [`inputProps`](/docs/renderer/render-media#inputprops) option:

```tsx twoslash {8-10}
// @module: esnext
// @target: es2017
const composition = {
  fps: 30,
  durationInFrames: 30,
  width: 1080,
  height: 1080,
  id: "my-video",
  defaultProps: {},
};
const serveUrl = "/path/to/bundle";
const outputLocation = "/path/to/frames";
// ---cut---
import { renderMedia } from "@remotion/renderer";

await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation,
  inputProps: {
    titleText: "Hello World",
  },
});
```

### Passing input props in GitHub Actions

[See: Render using GitHub Actions](/docs/ssr#render-using-github-actions)

When using GitHub Actions, you need to adjust the file at `.github/workflows/render-video.yml` to make the inputs in the `workflow_dispatch` section manually match the shape of the props your root component accepts.

```yaml {3, 7}
workflow_dispatch:
  inputs:
    titleText:
      description: "Which text should it say?"
      required: true
      default: "Welcome to Remotion"
    titleColor:
      description: "Which color should it be in?"
      required: true
      default: "black"
```

### Retrieve input props

Input props are passed to the component of your composition directly and you can access as regular React component props.

_Available since v2.0._: You can also use the `getInputProps()` function to retrieve props that you have given as an input. This is useful if you need to retrieve the props in a position where you are not inside your component, such as when determining the video duration, dimensions or frame rate.

## You can still use components as normal

Even if you have registered a component as a composition,
you can still use it normally in your React markup and pass its props directly. Default props don't apply in this case.

```tsx twoslash
// @include: example-MyComponent
// ---cut---
<MyComponent propOne="hi" propTwo={10} />
```

## See also

- [Avoid huge payloads for `defaultProps`](/docs/troubleshooting/defaultprops-too-big)
