---
id: loop
title: <Loop>
---

import { LoopExamples, BlueSquare } from "../components/LoopExamples/LoopExamples";

```twoslash include example
const BlueSquare: React.FC = () => <div></div>
// - BlueSquare
```

_available from v2.5.0_

The `<Loop />` component allows you to quickly lay out an animation so it repeats itself.

## API

The Loop component is a high order component and accepts, besides it's children, the following props:

- `durationInFrames` _(required)_: How many frames of the content the loop should include.

- `times` _(optional)_: How many times to loop the content. By default it will be `Infinity`.

- `layout`: _(optional)_: Either `"absolute-fill"` _(default)_ or `"none"` By default, your content will be absolutely positioned. If you would like to disable layout side effects, pass `layout="none"`.

:::info
Good to know: You can nest loops within each other and they will cascade. For example, a loop that has a duration of 30 frames which is inside a loop that has a duration of 75 will play 2 times. However, nested loops are not currently displayed in the timeline.
:::

## Examples

All the examples below are based on the following animation of a blue square:

<LoopExamples />
<br />

```tsx twoslash
// @include: example-BlueSquare
// ---cut---
const MyVideo = () => {
  return <BlueSquare />;
};
```

### Continuous loop

<LoopExamples type="base" />
<br />

```tsx twoslash
// @include: example-BlueSquare
import { Loop } from "remotion";
// ---cut---
const MyVideo = () => {
  return (
    <Loop durationInFrames={50}>
      <BlueSquare />
    </Loop>
  );
};
```

### Fixed count loop

<LoopExamples type="times" />
<br />

```tsx twoslash
// @include: example-BlueSquare
import { Loop } from "remotion";
// ---cut---
const MyVideo = () => {
  return (
    <Loop durationInFrames={50} times={2}>
      <BlueSquare />
    </Loop>
  );
};
```

### Nested loop

<LoopExamples type="nested" />
<br />

```tsx twoslash
// @include: example-BlueSquare
import { Loop } from "remotion";
// ---cut---
const MyVideo = () => {
  return (
    <Loop durationInFrames={75}>
      <Loop durationInFrames={30}>
        <BlueSquare />
      </Loop>
    </Loop>
  );
};
```

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/loop/index.tsx)
- [`<Sequence>`](/docs/sequence)
