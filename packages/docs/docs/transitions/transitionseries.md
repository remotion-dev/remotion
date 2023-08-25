---
crumb: "@remotion/transitions"
sidebar_label: "<TransitionSeries>"
title: "<TransitionSeries>"
---

_available from v4.0.26_

The `<TransitionSeries>` component behaves the same as the [`<Series>`](/docs/series) component, but allows for `<TransitionSeries.Transition>` components to be rendered between `<TransitionSeries.Sequence>` components.

Each transition consists of two parts:

<Step>1</Step> <code>presentation</code>: The effect that is being used, for example <a href="/docs/transitions/presentations/fade"><code>fade()</code></a> or <a href="/docs/transitions/presentations/wipe"><code>wipe()</code></a>.<br/>

<Step>2</Step> <code>timing</code>: The duration and the progress curve, for example <a href="/docs/transitions/timings/springtiming"><code>springTiming()</code></a> or <a href="/docs/transitions/timings/lineartiming"><code>linearTiming()</code></a>

<br/>
<br/>

This package has some presentations and timings built-in, but custom ones can be created as well.

```tsx twoslash title="MyComp.tsx"
import { AbsoluteFill } from "remotion";
const Fill = ({ color }: { color: string }) => (
  <AbsoluteFill style={{ backgroundColor: color }} />
);

// ---cut---
import {
  linearTiming,
  springTiming,
  TransitionSeries,
} from "@remotion/transitions";

import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";

export const MyComp: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={60}>
        <Fill color="blue" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        timing={springTiming({ config: { damping: 200 } })}
        presentation={fade()}
      />
      <TransitionSeries.Sequence durationInFrames={60}>
        <Fill color="black" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        timing={linearTiming({ durationInFrames: 30 })}
        presentation={wipe()}
      />
      <TransitionSeries.Sequence durationInFrames={60}>
        <Fill color="white" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

## API

### `<TransitionSeries>`

Inherits the [`from`](/docs/sequence#from), [`name`](/docs/sequence#name), [`className`](/docs/sequence#classname), [`style`](/docs/sequence#style) and [`layout`](/docs/sequence#layout) props from [`<Sequence>`](/docs/sequence).

The `<TransitionSeries>` component can only contain `<TransitionSeries.Sequence>` and `<TransitionSeries.Transition>` components.

### `<TransitionSeries.Sequence>`

Inherits the [`durationInFrames`](/docs/sequence#durationinframes), [`name`](/docs/sequence#name), [`className`](/docs/sequence#classname), [`style`](/docs/sequence#style) and [`layout`](/docs/sequence#layout) props from [`<Sequence>`](/docs/sequence).

As children, put the contents of your scene.

### `<TransitionSeries.Transition>`

Takes two props:

- `timing`: A timing of type `TransitionTiming`. See [Timings](/docs/transitions/timings) for more information.
- `presentation?`: A presentation of type `TransitionPresentation`. If not specified, the default value is `slide()`. See [Presentations](/docs/transitions/presentations) for more information.

Must be a direct child of `<TransitionSeries>`.  
At least one `<TransitionSeries.Sequence>` component must come before or after the `<TransitionSeries.Transition>` component.  
It is not allowed for two `<TransitionSeries.Transition>` components to be next to each other.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/transitions/src/TransitionSeries.tsx)
- [Timings](/docs/transitions/timings)
- [Presentations](/docs/transitions/presentations)
- [`<Series>`](/docs/series)
