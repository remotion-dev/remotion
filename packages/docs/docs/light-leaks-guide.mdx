---
image: /generated/articles-docs-light-leaks-guide.png
id: light-leaks
title: Light Leaks
crumb: 'Techniques'
---

# Light Leaks<AvailableFrom v="4.0.415"/>

The [`<LightLeak>`](/docs/light-leaks/light-leak) component from [`@remotion/light-leaks`](/docs/light-leaks/api) renders a WebGL-based light leak effect. The effect reveals during the first half of its duration and retracts during the second half.

<Demo type="light-leak" />

```tsx twoslash title="MyComp.tsx"
import {LightLeak} from '@remotion/light-leaks';
import {AbsoluteFill} from 'remotion';

const MyComp = () => {
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <LightLeak durationInFrames={60} seed={3} hueShift={30} />
    </AbsoluteFill>
  );
};
```

## Changing the seed

The [`seed`](/docs/light-leaks/light-leak#seed) prop controls the shape of the light leak pattern. Different values produce different patterns.

```tsx twoslash title="DifferentSeed.tsx"
import {LightLeak} from '@remotion/light-leaks';
import {AbsoluteFill} from 'remotion';

// ---cut---
const MyComp = () => {
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <LightLeak seed={5} durationInFrames={30} />
    </AbsoluteFill>
  );
};
```

## Changing the color

Use [`hueShift`](/docs/light-leaks/light-leak#hueshift) to rotate the color of the light leak in degrees (`0`–`360`):

- `0` (default) — yellow-to-orange
- `120` — shifts toward green
- `240` — shifts toward blue

```tsx twoslash title="BlueHue.tsx"
import {LightLeak} from '@remotion/light-leaks';
import {AbsoluteFill} from 'remotion';

// ---cut---
const MyComp = () => {
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <LightLeak hueShift={240} durationInFrames={30} />
    </AbsoluteFill>
  );
};
```

## Using as a transition

Combined with [`<TransitionSeries.Overlay>`](/docs/transitions/transitionseries#transitionseriesoverlay), you can place a light leak at the cut point between two sequences without shortening the timeline.

<Demo type="transition-series-overlay" />

```tsx twoslash title="LightLeakTransition.tsx"
import {AbsoluteFill} from 'remotion';
const Fill = ({color}: {color: string}) => <AbsoluteFill style={{backgroundColor: color}} />;

// ---cut---
import {LightLeak} from '@remotion/light-leaks';
import {TransitionSeries} from '@remotion/transitions';

const LightLeakTransition = () => {
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

At the midpoint, the light leak covers most of the canvas, hiding the cut between scenes.

## See also

- [`<LightLeak>` API reference](/docs/light-leaks/light-leak)
- [`@remotion/light-leaks`](/docs/light-leaks/api)
- [`<TransitionSeries.Overlay>`](/docs/transitions/transitionseries#transitionseriesoverlay)
- [Transitions](/docs/transitioning)
