---
id: parametrized-rendering
title: Parametrized rendering
---

Parametrized rendering is the idea of creating a video template once and then render as many videos as you want with different parameters. Just like in regular React, we use props to reuse and customize components!

## Defining accepted props and default values

To define which props your video accepts, simply give your component the `React.FC` type and pass in a generic argument describing the shape of the props you want to accept.

```tsx {2-3}
export const MyComponent: React.FC<{
  propOne: string;
  propTwo: number;
}> = ({propOne, propTwo}) => {
  return (
    <div>props: {propOne}, {propTwo}</div>
  );
}
```

When registering the component as a sequence, you can define the default props:

```tsx {13-16}
import {Sequence} from 'remotion';
import {MyComponent} from './MyComponent';

export const Root = () => {
  return (
    <>
      <Sequence
        id="my-video"
        width={1080}
        height={1080}
        fps={30}
        component={MyComponent}
        defaultProps={{
          propOne: 'Hi',
          propTwo: 10
        }}
      />
    </>
  )
}
```

By using `React.FC`, you can ensure type safety and avoid errors caused by typos.

## Passing props in the CLI

When rendering (for example using the `npm run build` script defined in `package.json`), you can override some or all default props by passing a CLI flag. It must be valid JSON, pay attention to quote escaping. Using this technique, no type safety can be guaranteed.

```bash
npx remotion render src/index.tsx HelloWorld helloworld.mp4 --props=defaultProps.json
```

:::tip
make sure `defaultProps.json` is in your root folder.
:::

```json
//defaultProps.json
{
  "propOne": "Hi",
  "propTwo": 10
}
```
### Or for inline json

```bash
npx remotion render src/index.tsx HelloWorld helloworld.mp4 --props='{"propOne": "Hi", "propTwo": 10}'
```

[See also: CLI flags](/docs/cli)

## Passing props when server rendering

When server-rendering using `renderFrames`, you can pass props using the `userProps` option:

```tsx {8-10}
await renderFrames({
  config: video,
  webpackBundle: bundled,
  onStart: () => void 0,
  onFrameUpdate: (f) => void 0,
  parallelism: null,
  outputDir: framesDir,
  userProps: {
    titleText: 'Hello World'
  },
  compositionId: 'HelloWorld',
  imageFormat: 'jpeg'
});
```

## Passing props in GitHub Actions

[See: Render using GitHub Actions](/docs/ssr#render-using-github-actions)

When using GitHub Actions, you need to adjust the file at `.github/workflows/render-video.yml` to make the inputs in the `workflow_dispatch` section manually match the shape of the props your root component accepts.

```yml {3,7}
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

## You can still use components as normal

Even if you have registered a component as a sequence,
you can still use it as normal in your videos and pass it's props directly. Default props don't apply in this case.

```tsx
<MyComponent propOne="hi" propTwo={10} />
```
