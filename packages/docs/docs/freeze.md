---
id: freeze
title: <Freeze>
crumb: "API"
---

import { FreezeExample } from "../components/FreezeExample/FreezeExample";

```twoslash include example
const BlueSquare: React.FC = () => <div></div>
// - BlueSquare
```

_Available from v2.2.0._

When using the `<Freeze/>` component, all of it's children will freeze to the frame that you specify as a prop.

If a component is a child of `<Freeze/>`, calling the `useCurrentFrame()` hook will always return the frame number you specify.

`<Video/>` elements will be paused and `<Audio/>` elements will render muted.

## API

The Freeze component is a high order component and accepts, besides it's children, the following props:

- `frame` _(required)_: At which frame it's children should freeze.

## Example usage

```tsx twoslash
// @include: example-BlueSquare
// ---cut---
import { Freeze } from "remotion";

const MyVideo = () => {
  return (
    <Freeze frame={30}>
      <BlueSquare />
    </Freeze>
  );
};
```

## Demo

<FreezeExample />

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/freeze.tsx)
- [`<Video/>` Playback speed](/docs/video#playbackrate)
- [`useCurrentFrame()`](/docs/use-current-frame)
