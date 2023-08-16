---
crumb: "@remotion/transitions"
sidebar_label: "<TransitionSeries>"
title: "<TransitionSeries>"
---

_available from v4.0.21_

The `<TransitionSeries>` component behaves the same as the [`<Series>`](/docs/series) component, but allows for `<TransitionSeries.Transition>` components to be rendered between `<TransitionSeries.Sequence>` components.

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
