---
id: thumbnail
title: "<Thumbnail>"
---

A component which can be rendered in a regular React App (for example: [Create React App](https://create-react-app.dev/), [Next.JS](https://nextjs.org)) to display a single frame of a video.

```tsx twoslash title="MyApp.tsx"
// @allowUmdGlobalAccess
// @filename: ./remotion/MyVideo.tsx
export const MyVideo = ({ title }) => <>{title}</>;

// @filename: index.tsx
// ---cut---
import { Thumbnail } from "@remotion/player";
import { MyVideo } from "./remotion/MyVideo";

export const App: React.FC = () => {
  return (
    <Thumbnail
      inputProps={{
        title: "Foo",
      }}
      component={MyVideo}
      compositionWidth={600}
      compositionHeight={600}
      frameToDisplay={30}
      durationInFrames={120}
      fps={30}
    />
  );
};
```

## API

### `component` or `lazyComponent`

Pass a React component in directly **or** pass a function that returns a dynamic import. Passing neither or both of the props is an error.

If you use `lazyComponent`, wrap it in a `useCallback()` to avoid constant rendering. [See here for an example.](/docs/player/examples#loading-a-component-lazily)

:::note
Thumbnail does not use [`<Composition>`](/docs/composition)'s. Pass your component directly and do not wrap it in a `<Composition>` component.
:::

### `frameToDisplay`

Index of the frame rendered by the composition in the Thumbnail.

### `compositionWidth`

The width you would like the video to have when rendered as an MP4. Use `style={{width: <width>}}` to define a width to be assumed in the browser.

:::note
**Example**:
If you want to render a Full HD video, set `compositionWidth` to `1920` and `compositionHeight` to `1080`. By default, the thumbnail will also assume these dimensions.
To make it smaller, pass a `style` prop to give the Thumbnail a different width: `{"style={{width: 400}}"}`. See [Player Scaling](/docs/player/scaling) to learn more.
:::

### `compositionHeight`

The height of the canvas in pixels.
The height you would like the video to have when rendered as an MP4. Use `style={{height: <height>}}` to define a height to be assumed in the browser.

### `inputProps`

_optional_

Pass props to the component that you have specified using the `component` prop. The Typescript definition takes the shape of the props that you have given to your `component`. Default `undefined`.

### `style`

_optional_

A regular `style` prop for a HTMLDivElement. You can pass a different height and width if you would like different dimensions for the player than the original composition dimensions.

### `durationInFrames`

The duration of the video in frames. Must be an integer and greater than 0.

:::note
This prop is required for the Thumbnail component because your component may render differently based on what `useVideoConfig()` returns.
:::

### `fps`

The frame rate of the video. Must be a number.

:::note
This prop is required for the Thumbnail component because your component may render differently based on what `useVideoConfig()` returns.
:::

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/player/src/Thumbnail.tsx)
- [`<Composition>`](/docs/composition)
- [`<Player>`](/docs/player)
