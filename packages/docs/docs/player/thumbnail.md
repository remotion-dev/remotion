---
id: thumbnail
title: "<Thumbnail>"
---

A component which can be rendered in a regular React App (for example: [Create React App](https://create-react-app.dev/), [Next.JS](https://nextjs.org)) to display a thumbnail from a video.
This component share React props definition of the [`<Player>`](/player/api) component.

```tsx twoslash title="MyApp.tsx"
// @allowUmdGlobalAccess
// @filename: ./remotion/MyVideo.tsx
export const MyVideo = ({ title }) => <>{ title }</>;

// @filename: index.tsx
// ---cut---
import { Thumbnail } from "@remotion/player";
import { MyVideo } from "./remotion/MyVideo";

export const App: React.FC = () => {
  return (
      <Thumbnail 
          inputProps={{
              title: 'Foo'
          }} 
          component={MyVideo} 
          compositionWidth={600}
          compositionHeight={600} 
          frameToDisplay={30} 
          durationInFrames={120} f
          ps={30}
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

The width you would like the video to have when rendered. Use `style={{width: <width>}}` to define a different natural width for the Thumbnail.

### `compositionHeight`

The height of the canvas in pixels.
The height you would like the video to have when rendered. Use `style={{height: <height>}}` to define a different natural height for the Thumbnail.

### `inputProps`

_optional_

Pass props to the component that you have specified using the `component` prop. The Typescript definition takes the shape of the props that you have given to your `component`. Default `undefined`.

### `style`

_optional_

A regular `style` prop for a HTMLDivElement. You can pass a different height and width if you would like different dimensions for the player than the original composition dimensions.

### `durationInFrames`

The duration of the video in frames. Must be an integer and greater than 0.

### `fps`

The frame rate of the video. Must be a number.




## See also

- [`<Composition>`](/docs/composition)
- [`<Player>`](/docs/player)