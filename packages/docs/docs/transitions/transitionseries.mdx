---
image: /generated/articles-docs-transitions-transitionseries.png
crumb: '@remotion/transitions'
sidebar_label: '<TransitionSeries>'
title: '<TransitionSeries>'
---

import {TransitionsDuration} from '../../components/TransitionsDuration';

# &lt;TransitionSeries&gt;<AvailableFrom v="4.0.59" />

The `<TransitionSeries>` component behaves the same as the [`<Series>`](/docs/series) component, but allows for [`<TransitionSeries.Transition>`](#transitionseriestransition) and [`<TransitionSeries.Overlay>`](#transitionseriesoverlay) components to be rendered between [`<TransitionSeries.Sequence>`](#transitionseriessequence) components.

Between any two sequences, you can place either a transition or an overlay:

- A [`<TransitionSeries.Transition>`](#transitionseriestransition) crossfades, slides, or otherwise animates between two scenes.  
  It [shortens](#duration-of-a-transitionseries) the total duration because both scenes overlap during the transition.
- A [`<TransitionSeries.Overlay>`](#transitionseriesoverlay) renders children on top of the cut point without affecting timing.  
  The sequences remain at full length — useful for effects like [light leaks](/docs/light-leaks/light-leak) or flashes.

### Transition example

```tsx twoslash title="TransitionExample.tsx"
import {AbsoluteFill} from 'remotion';
const Fill = ({color}: {color: string}) => <AbsoluteFill style={{backgroundColor: color}} />;

// ---cut---
import {linearTiming, springTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';

export const TransitionExample: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={60}>
        <Fill color="#0b84f3" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition timing={springTiming({config: {damping: 200}})} presentation={fade()} />
      <TransitionSeries.Sequence durationInFrames={60}>
        <Fill color="pink" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition timing={linearTiming({durationInFrames: 30})} presentation={wipe()} />
      <TransitionSeries.Sequence durationInFrames={60}>
        <Fill color="#2ecc71" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

<Demo type="transition-series-transition" />

### Overlay example<AvailableFrom v="4.0.415" />

```tsx twoslash title="OverlayExample.tsx"
import {AbsoluteFill} from 'remotion';
const Fill = ({color}: {color: string}) => <AbsoluteFill style={{backgroundColor: color}} />;

// ---cut---
import {LightLeak} from '@remotion/light-leaks';
import {TransitionSeries} from '@remotion/transitions';

export const OverlayExample: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={60}>
        <Fill color="blue" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Overlay durationInFrames={20}>
        <LightLeak />
      </TransitionSeries.Overlay>
      <TransitionSeries.Sequence durationInFrames={60}>
        <Fill color="black" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

<Demo type="transition-series-overlay" />

## API

### `<TransitionSeries>`

Inherits the [`from`](/docs/sequence#from), [`name`](/docs/sequence#name), [`className`](/docs/sequence#classname), and [`style`](/docs/sequence#style) props from [`<Sequence>`](/docs/sequence).

The `<TransitionSeries>` component can only contain `<TransitionSeries.Sequence>`, `<TransitionSeries.Transition>`, and `<TransitionSeries.Overlay>` components.

### `<TransitionSeries.Sequence>`

Inherits the [`durationInFrames`](/docs/sequence#durationinframes), [`name`](/docs/sequence#name), [`className`](/docs/sequence#classname), [`style`](/docs/sequence#style), [`premountFor`](/docs/sequence#premountfor), [`postmountFor`](/docs/sequence#postmountfor) and [`layout`](/docs/sequence#layout) props from [`<Sequence>`](/docs/sequence).

As children, put the contents of your scene.

### `<TransitionSeries.Transition>`

Placed between two sequences to animate from one scene to the next.  
During the transition, both scenes are rendered simultaneously and the total duration is [shortened](#duration-of-a-transitionseries) by the transition length.

Takes two props:

- `timing`: A timing of type `TransitionTiming`. See [Timings](/docs/transitions/timings) for more information.
- `presentation?`: A presentation of type `TransitionPresentation`. If not specified, the default value is [`slide()`](/docs/transitions/presentations/slide). See [Presentations](/docs/transitions/presentations) for more information.

Must be a direct child of `<TransitionSeries>`.
At least one `<TransitionSeries.Sequence>` component must come before or after the `<TransitionSeries.Transition>` component.

### `<TransitionSeries.Overlay>`<AvailableFrom v="4.0.415" />

Placed between two sequences to render children on top of the cut point.  
The overlay does [not shorten](#duration-of-a-transitionseries) the timeline — adjacent sequences remain at full length.

The overlay is centered on the cut point by default: half the duration before the cut, half after.  
Children animate independently — no progress context is provided.

Takes two props:

- `durationInFrames`: How long the overlay is visible. Must be a positive integer.
- `offset?`: Shifts the overlay relative to the center of the cut point. Positive values shift right (later), negative values shift left (earlier). Default: `0`. Must be a finite integer.

The overlay must not extend before frame 0 or beyond the duration of the adjacent sequences.

## Enter and exit animations

You don't necessarily have to use `<TransitionSeries>` for transitions between scenes. You can also use it to animate the entrace or exit of a scene by putting a transition first or last in the `<TransitionSeries>`.

```tsx twoslash title="SlideTransition.tsx"
import {AbsoluteFill} from 'remotion';

const Letter: React.FC<{
  children: React.ReactNode;
  color: string;
}> = ({children, color}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity: 0.9,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 200,
        color: 'white',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
// ---cut---
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';

const BasicTransition = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={40}>
        <Letter color="#0b84f3">A</Letter>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide()} timing={linearTiming({durationInFrames: 30})} />
    </TransitionSeries>
  );
};
```

<Demo type="transition-series-enter-exit" />

## Duration of a `<TransitionSeries>`

[Transitions](#transitionseriestransition) shorten the total duration because both scenes overlap.  
[Overlays](#transitionseriesoverlay) do not — the total duration stays the same as if no overlay was present.

Consider this example:

```tsx twoslash title="SlideTransition.tsx"
import {AbsoluteFill} from 'remotion';

const Letter: React.FC<{
  children: React.ReactNode;
  color: string;
}> = ({children, color}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity: 0.9,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 200,
        color: 'white',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
// ---cut---
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';

const BasicTransition = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={40}>
        <Letter color="#0b84f3">A</Letter>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide()} timing={linearTiming({durationInFrames: 30})} />
      <TransitionSeries.Sequence durationInFrames={60}>
        <Letter color="pink">B</Letter>
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

`A` is visible for 40 frames, `B` for 60 frames and the duration of the transition is 30 frames.
During this time, both slides are rendered. This means the total duration of the animation is `60 + 40 - 30 = 70`.

<TransitionsDuration />

<details>
<summary>Example with 3 slides</summary>

```tsx twoslash title="SlideTransition.tsx"
import {AbsoluteFill} from 'remotion';

const Letter: React.FC<{
  children: React.ReactNode;
  color: string;
}> = ({children, color}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity: 0.9,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 200,
        color: 'white',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
// ---cut---
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';

const BasicTransition = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={40}>
        <Letter color="#0b84f3">A</Letter>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide()} timing={linearTiming({durationInFrames: 30})} />
      <TransitionSeries.Sequence durationInFrames={60}>
        <Letter color="pink">B</Letter>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide()} timing={linearTiming({durationInFrames: 45})} />
      <TransitionSeries.Sequence durationInFrames={90}>
        <Letter color="green">C</Letter>
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

- The first slide is shown for 40 frames
- The second slide is shown for 60 frames
- The third slide is shown for 90 frames
- There are two transitions, one 30 frames long and one 45 frames long

1. Sum up the durations: `40 + 60 + 90 = 190`
2. Subtract the duration of the transitions: `190 - 30 - 45 = 115`

</details>

## Getting the duration of a transition

You can get the duration of a transition by calling `getDurationInFrames()` on the timing:

```tsx twoslash title="Assuming a framerate of 30fps"
import {springTiming} from '@remotion/transitions';

springTiming({config: {damping: 200}}).getDurationInFrames({fps: 30}); // 23
```

## Rules

<Step>1</Step> A transition must not be longer than the duration of the previous or next sequence.

<Step>2</Step> Two transitions cannot be adjacent.

<Step>3</Step> Two overlays cannot be adjacent.

<Step>4</Step> A transition and an overlay cannot be adjacent — they occupy the same slot between sequences.

<Step>5</Step> There must be at least one sequence before or after a transition or overlay.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/transitions/src/TransitionSeries.tsx)
- [Transitions](/docs/transitioning)
- [Timings](/docs/transitions/timings)
- [Presentations](/docs/transitions/presentations)
- [`<Series>`](/docs/series)
