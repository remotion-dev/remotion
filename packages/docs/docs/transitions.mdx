---
image: /generated/articles-docs-transitions.png
id: transitioning
title: Transitions
crumb: "Techniques"
---

# Transitions<AvailableFrom v="4.0.59"/>

import { TransitionsDuration } from "../components/TransitionsDuration";
import { Presentations } from "../components/TableOfContents/transitions/presentations";
import { Timings } from "../components/TableOfContents/transitions/timings";

The [`<TransitionSeries>`](/docs/transitions/transitionseries) component lets you animate between absolutely positioned scenes. Between any two sequences, you can place a [`<TransitionSeries.Transition>`](/docs/transitions/transitionseries#transitionseriestransition) or a [`<TransitionSeries.Overlay>`](/docs/transitions/transitionseries#transitionseriesoverlay).

## Transitions

A transition animates from one scene to the next. During the transition, both scenes render simultaneously and the total duration is [shortened](/docs/transitions/transitionseries#duration-of-a-transitionseries).

```tsx twoslash title="SlideTransition.tsx"
import { AbsoluteFill } from "remotion";

const Letter: React.FC<{
  children: React.ReactNode;
  color: string;
}> = ({ children, color }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity: 0.9,
        justifyContent: "center",
        alignItems: "center",
        fontSize: 200,
        color: "white",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
// ---cut---
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";

const BasicTransition = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={40}>
        <Letter color="#0b84f3">A</Letter>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide()}
        timing={linearTiming({ durationInFrames: 30 })}
      />
      <TransitionSeries.Sequence durationInFrames={60}>
        <Letter color="pink">B</Letter>
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

<Demo type="slide" />

### Enter and exit animations

You can also animate the entrance or exit of a scene by putting a transition first or last in the `<TransitionSeries>`.

[See example](/docs/transitions/transitionseries#enter-and-exit-animations)

### Duration

In the above example, `A` is visible for 40 frames, `B` for 60 frames and the duration of the transition is 30 frames.
During this time, both slides are rendered. This means the total duration of the animation is `60 + 40 - 30 = 70`.

<TransitionsDuration />

### Getting the duration of a transition

You can get the duration of a transition by calling `getDurationInFrames()` on the timing:

```tsx twoslash title="Assuming a framerate of 30fps"
import { springTiming } from "@remotion/transitions";

springTiming({ config: { damping: 200 } }).getDurationInFrames({ fps: 30 }); // 23
```

## Overlays<AvailableFrom v="4.0.415"/>

An [`<TransitionSeries.Overlay>`](/docs/transitions/transitionseries#transitionseriesoverlay) renders children on top of the junction between two sequences without shortening the timeline. The sequences remain at full length — the total duration stays the same.

This is useful for effects like [light leaks](/docs/light-leaks/light-leak), flashes, or other visual elements that should appear over a cut without affecting timing. The overlay is centered on the cut point by default.

```tsx twoslash title="OverlayExample.tsx"
import {AbsoluteFill} from 'remotion';
const Fill = ({color}: {color: string}) => <AbsoluteFill style={{backgroundColor: color}} />;

// ---cut---
import {LightLeak} from '@remotion/light-leaks';
import {TransitionSeries} from '@remotion/transitions';

const OverlayExample = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={60}>
        <Fill color="#0b84f3" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Overlay durationInFrames={20}>
        <LightLeak />
      </TransitionSeries.Overlay>
      <TransitionSeries.Sequence durationInFrames={60}>
        <Fill color="pink" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

<Demo type="transition-series-overlay" />

See [`<TransitionSeries.Overlay>`](/docs/transitions/transitionseries#transitionseriesoverlay) for full API details.

## Presentations

A presentation determines the visual of the animation.

<Presentations />

## Timings

A timing determines how long the animation takes and the animation curve.

<Timings />

## Audio transitions

See here how to include [audio effects](/docs/transitions/audio-transitions) in your transitions.

## Rules

<Step>1</Step> A transition must not be longer than the duration of the previous or next sequence.

<Step>2</Step> Two transitions cannot be adjacent.

<Step>3</Step> Two overlays cannot be adjacent.

<Step>4</Step> A transition and an overlay cannot be adjacent — they occupy the same slot between sequences.

<Step>5</Step> There must be at least one sequence before or after a transition or overlay.

## See also

- [`@remotion/transitions`](/docs/transitions)
- [`<TransitionSeries>`](/docs/transitions/transitionseries)
