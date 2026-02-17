---
title: Scene Transitions
impact: HIGH
impactDescription: enables smooth scene changes and professional video flow
tags: transitions, fade, slide, wipe, scenes
---

## TransitionSeries for Scene Changes

Use TransitionSeries to animate between multiple scenes or clips.

**Incorrect (abrupt scene cuts):**

```tsx
<Sequence from={0} durationInFrames={60}>
  <SceneA />
</Sequence>
<Sequence from={60} durationInFrames={60}>
  <SceneB />
</Sequence>
```

**Correct (smooth transitions):**

```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 15 })}
  />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

## Available Transition Types

Import transitions from their respective modules:

```tsx
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";
```

## Slide Transition with Direction

Specify slide direction for enter/exit animations.

```tsx
import { slide } from "@remotion/transitions/slide";

<TransitionSeries.Transition
  presentation={slide({ direction: "from-left" })}
  timing={linearTiming({ durationInFrames: 20 })}
/>
```

Directions: `"from-left"`, `"from-right"`, `"from-top"`, `"from-bottom"`

## Custom Crossfade Without TransitionSeries

For simple opacity crossfades within a single component:

```tsx
const TRANSITION_START = 60;
const TRANSITION_DURATION = 15;

const scene1Opacity = interpolate(
  frame,
  [TRANSITION_START, TRANSITION_START + TRANSITION_DURATION],
  [1, 0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

const scene2Opacity = interpolate(
  frame,
  [TRANSITION_START, TRANSITION_START + TRANSITION_DURATION],
  [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

<AbsoluteFill style={{ opacity: scene1Opacity }}><SceneA /></AbsoluteFill>
<AbsoluteFill style={{ opacity: scene2Opacity }}><SceneB /></AbsoluteFill>
```

## Timing Options

```tsx
import { linearTiming, springTiming } from "@remotion/transitions";

// Linear timing - constant speed
linearTiming({ durationInFrames: 20 })

// Spring timing - organic motion
springTiming({ config: { damping: 200 }, durationInFrames: 25 })
```
