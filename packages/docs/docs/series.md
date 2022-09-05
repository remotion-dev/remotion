---
id: series
title: <Series>
---

_Available from v.2.3.1_

import { SeriesExample } from "../components/SeriesExamples/SeriesExample";

Using this component, you can easily stitch together scenes that should play sequentially after another.

## Example

### Code

```twoslash include example
const Square: React.FC<{color: string}> = () => <div></div>
// - Square
```

```tsx twoslash
// @include: example-Square
// ---cut---
import { Series } from "remotion";

const Example: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={40}>
        <Square color={"#3498db"} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={20}>
        <Square color={"#5ff332"} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={70}>
        <Square color={"#fdc321"} />
      </Series.Sequence>
    </Series>
  );
};
```

### Result

<SeriesExample type="base" />

## API

The `<Series />` component takes no props may only contain a list of `<Series.Sequence />` instances.

### `<Series.Sequence />`

This component is a high order component, and accepts, besides it's children, the following props:

- `durationInFrames` _(required)_: For how many frames the sequence should be displayed. Children are unmounted if they are not within the time range of display. By default it will be `Infinity` to avoid limit the duration of the sequence.

- `offset`: _(optional)_: Pass a positive number to delay the beginning of the sequence. Pass a negative number to start the sequence earlier, and to overlay the sequence with the one that comes before.

  The offset does not apply to sequences that come before, but the sequences that come after it will also be shifted.

  **Example 1**: Pass `10` to delay the sequence by 10 frames and create a blank space of 10 frames before it.
  **Example 2**: Pass `-10` to start the sequence earlier and overlay the sequence on top of the previous one for 10 frames.

- `layout`: _(optional)_: Either `"absolute-fill"` _(default)_ or `"none"` By default, your sequences will be absolutely positioned, so they will overlay each other. If you would like to opt out of it and handle layouting yourself, pass `layout="none"`.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/series/index.tsx)
- [`<Sequence />`](/docs/sequence)
