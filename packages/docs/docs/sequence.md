---
image: /generated/articles-docs-sequence.png
id: sequence
title: <Sequence>
crumb: "API"
---

import { SequenceForwardExample } from "../components/SequenceExamples/SequenceForward";

```twoslash include example
const BlueSquare: React.FC = () => <div></div>
// - BlueSquare
```

By using a sequence, you can time-shift the display of your components or parts of your animation in the video.

```tsx twoslash
import { Sequence } from "remotion";

export const Intro = () => <></>;
export const Clip = () => <></>;
export const Outro = () => <></>;

// ---cut---

const MyTrailer = () => {
  return (
    <>
      <Sequence durationInFrames={10}>
        <Intro />
      </Sequence>
      <Sequence from={10}>
        <Clip />
      </Sequence>
      <Sequence from={20}>
        <Outro />
      </Sequence>
    </>
  );
};
```

All child components inside a `<Sequence>` will have their value of [`useCurrentFrame()`](/docs/use-current-frame) shifted by the `from` value.

Using the `durationInFrames` prop, you can define for how long the children of a `<Sequence>` should be mounted.

By default, the children of a `<Sequence>` are wrapped in an [`<AbsoluteFill>`](/docs/absolute-fill) component. If you don't want this behavior, add `layout="none"` as a prop.

## Props

The Sequence component is a high order component and accepts, besides children, the following props:

### `from`

_optional_ (From v3.2.36, _required_ in previous versions)

At which frame it's children should assume the video starts. When the sequence is at `frame`, it's children are at frame `0`.
From v3.2.36 onwards, this prop will be optional; by default, it will be 0.

### `durationInFrames`

_optional_

For how many frames the sequence should be displayed. Children are unmounted if they are not within the time range of display. By default it will be `Infinity` to avoid limit the duration of the sequence.

### `name`

_optional_

You can give your sequence a name and it will be shown as the label of the sequence in the timeline of the Remotion Studio. This property is purely for helping you keep track of sequences in the timeline.

### `layout`

_optional_

Either `"absolute-fill"` _(default)_ or `"none"` By default, your sequences will be absolutely positioned, so they will overlay each other. If you would like to opt out of it and handle layouting yourself, pass `layout="none"`. Available since v1.4.

### `style`<AvailableFrom v="3.0.27"/>

_optional_

CSS styles to be applied to the container. If `layout` is set to `none`, there is no container and setting this style is not allowed.

### `className`<AvailableFrom v="3.3.45"/>

_optional_

A class name to be applied to the container. If `layout` is set to `none`, there is no container and setting this style is not allowed.

## Cascading

You can nest sequences within each other and they will cascade.  
For example, a sequence that starts at frame 60 which is inside a sequence that starts at frame 30 will have it's children start at frame 90.

## Examples

All the examples below are based on the following animation of a blue square:

<SequenceForwardExample type="base" />

<br />

```tsx twoslash
// @include: example-BlueSquare
// ---cut---
const MyVideo = () => {
  return <BlueSquare />;
};
```

### Delay

If you would like to delay the content by say 30 frames, you can wrap it in <br/> `<Sequence from={30}>`.

<SequenceForwardExample type="delay" />
<br />

```tsx twoslash
// @include: example-BlueSquare
import { Sequence } from "remotion";
// ---cut---
const MyVideo = () => {
  return (
    <Sequence from={30}>
      <BlueSquare />
    </Sequence>
  );
};
```

### Trim end

We can clip some content so it only stays visible for a certain time by specifying a non-finite `durationInFrames` number.
In this example, we wrap the square in `<Sequence durationInFrames={45}>` and as you can see, it disappears after 45 frames.

<SequenceForwardExample type="clip" />
<br />

### Trim start

To trim the start of some content, we can pass a negative value to `from`.
In this example, we wrap the square in `<Sequence from={-15}>` and as a result, the animation has already progressed by 15 frames at the start of the video.

<SequenceForwardExample type="trim-start" />

### Trim and delay

What if you want to trim the start of the content and delay it at the same time?
You need to wrap the videos in two sequences. To the inner one we pass a negative start value `from={-15}` to trim away the first 15 frames of the content, to the outer one we pass a positive value `from={30}` to then shift it forwards by 30 frames.

<SequenceForwardExample type="trim-and-delay" />
<br />

```tsx twoslash
// @include: example-BlueSquare
import { Sequence } from "remotion";
// ---cut---
const TrimAndDelayExample: React.FC = () => {
  return (
    <Sequence from={30}>
      <Sequence from={-15}>
        <BlueSquare />
      </Sequence>
    </Sequence>
  );
};
```

## Play Sequences sequentially

See the [`<Series />`](/docs/series) helper component, which helps you calculate markup that makes sequences play after each other.

## Adding a ref

You can add a [React ref](https://react.dev/learn/manipulating-the-dom-with-refs) to an `<Sequence>` from version `v3.2.13` on. If you use TypeScript, you need to type it with `HTMLDivElement`:

```tsx twoslash
import { useRef } from "react";
import { Sequence } from "remotion";

const content = <div>Hello, World</div>;
// ---cut---
const MyComp = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Sequence from={10} ref={ref}>
      {content}
    </Sequence>
  );
};
```

## Note for `@remotion/three`

A `<Sequence>` by default will return a `<div>` component which is not allows inside a [`<ThreeCanvas>`](/docs/three-canvas). To avoid an error, pass `layout="none"` to `<Sequence>`.

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/Sequence.tsx)
- [Reuse components using Sequences](/docs/reusability)
- [`<Composition />`](/docs/composition)
- [`<Series />`](/docs/series)
