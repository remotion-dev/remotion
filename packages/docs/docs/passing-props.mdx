---
image: /generated/articles-docs-passing-props.png
id: passing-props
title: Passing props to a composition
sidebar_label: Passing props
crumb: 'How To'
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

To define which props your video accepts, give your component the `React.FC` type and pass in a generic argument describing the shape of the props you want to accept:

```tsx twoslash title="src/MyComponent.tsx"
// @include: example-MyComponent
```

## Define default props

When registering a component that takes props as a composition, you must define default props:

```tsx twoslash {14-17} title="src/Root.tsx"
// organize-imports-ignore

// @filename: MyComponent.tsx
import React from 'react';
export const MyComponent: React.FC<{
  propOne: string;
  propTwo: number;
}> = () => null;

// @filename: Root.tsx

// ---cut---
import React from 'react';
import {Composition} from 'remotion';
import {MyComponent} from './MyComponent';

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
          propOne: 'Hi',
          propTwo: 10,
        }}
      />
    </>
  );
};
```

Default props are useful so you don't preview your video with no data. [Default props will be overriden by input props](/docs/props-resolution).

## Define a schema<AvailableFrom v="4.0.0"/>

You can use [Zod](https://github.com/colinhacks/zod) to [define a typesafe schema for your composition](/docs/schemas).

## Input props

Input props are props that are passed in while invoking a render that can replace or override the default props.

:::note
Input props must be an object and serializable to JSON.
:::

### Passing input props in the CLI

When rendering, you can override default props by passing a [CLI](/docs/cli/render) flag. It must be either valid JSON or a path to a file that contains valid JSON.

```bash title="Using inline JSON"
npx remotion render HelloWorld out/helloworld.mp4 --props='{"propOne": "Hi", "propTwo": 10}'
```

```bash title="Using a file path"
npx remotion render HelloWorld out/helloworld.mp4 --props=./path/to/props.json
```

### Passing input props when using server-side rendering

When server-rendering using [`renderMedia()`](/docs/renderer/render-media) or [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda), you can pass props using the [`inputProps`](/docs/renderer/render-media#inputprops) option:

```tsx twoslash {3-5, 10, 18}
const serveUrl = '/path/to/bundle';
const outputLocation = '/path/to/frames';
// ---cut---
import {renderMedia, selectComposition} from '@remotion/renderer';

const inputProps = {
  titleText: 'Hello World',
};

const composition = await selectComposition({
  serveUrl,
  id: 'my-video',
  inputProps,
});

await renderMedia({
  composition,
  serveUrl,
  codec: 'h264',
  outputLocation,
  inputProps,
});
```

You should pass your `inputProps` to both [`selectComposition()`](/docs/renderer/select-composition) and [`renderMedia()`](/docs/renderer/render-media).

### Passing input props in GitHub Actions

[See: Render using GitHub Actions](/docs/ssr#render-using-github-actions)

When using GitHub Actions, you need to adjust the file at `.github/workflows/render-video.yml` to make the inputs in the `workflow_dispatch` section manually match the shape of the props your root component accepts.

```yaml {3, 7}
workflow_dispatch:
  inputs:
    titleText:
      description: 'Which text should it say?'
      required: true
      default: 'Welcome to Remotion'
    titleColor:
      description: 'Which color should it be in?'
      required: true
      default: 'black'
```

### Retrieve input props

Input props are passed to the [`component`](/docs/composition) of your [`<Composition>`](/docs/composition) directly and you can access them like regular React component props.

If you need the input props in your root component, use the [`getInputProps()`](/docs/get-input-props) function to retrieve input props.

## You can still use components normally

Even if a component is registered as a composition, you can still use it like a regular React component and pass the props directly:

```tsx twoslash
// @include: example-MyComponent
// ---cut---
<MyComponent propOne="hi" propTwo={10} />
```

This is useful if you want to concatenate multiple scenes together. You can use a [`<Series>`](/docs/series) to play two components after each other:

```tsx twoslash title="ChainedScenes.tsx"
// @include: example-MyComponent
const AnotherComponent: React.FC = () => {
  return null;
};
// ---cut---
import {Series} from 'remotion';

const ChainedScenes = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={90}>
        <MyComponent propOne="hi" propTwo={10} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={90}>
        <AnotherComponent />
      </Series.Sequence>
    </Series>
  );
};
```

You may then register this "Master" component as an additional [`<Composition>`](/docs/the-fundamentals#compositions).

## See also

- [Avoid huge payloads for `defaultProps`](/docs/troubleshooting/defaultprops-too-big)
