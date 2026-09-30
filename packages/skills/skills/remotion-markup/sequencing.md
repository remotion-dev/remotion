---
name: sequencing
description: Sequencing patterns for Remotion - delay, trim, limit duration of items
metadata:
  tags: sequence, series, timing, delay, trim
---

Prefer timing props directly on built-in interactive components and custom
components made with `Interactive.withSchema({wrapInSequence: true})`.  
Avoid wrapping a single timing-capable component in a redundant `<Sequence>`.
Put `name`, `from`, `durationInFrames`, `loop`, `volume`, and `premountFor`
directly on `<Audio>` whenever their combination gives the intended timing.

See [Remotion Interactivity](../remotion-interactivity/SKILL.md) for creating
schema-wrapped components and [connected compositions](connected-compositions.md)
for registering them with their own Studio timelines.

```tsx
// Title and Subtitle are exported with Interactive.withSchema({wrapInSequence: true}).
<>
  <Title name="Title" from={30} durationInFrames={60} premountFor={fps} />
  <Subtitle name="Subtitle" from={60} durationInFrames={60} premountFor={fps} />
</>
```

Use an explicit `<Sequence>` when multiple siblings need one shared clock,
when overriding dimensions for descendants, or when the child does not accept
timing props. Its default layout adds an absolutely positioned fill element;
use `layout="none"` when no layout wrapper is needed.

## Premounting

Set `premountFor={fps}` on every timed component that supports the prop, using
`fps` from `useVideoConfig()`. This mounts it one second before its start in
Studio, allowing media and other content to prepare. Put the prop directly on
the timed component, including `<Audio>`, `<Video>`, interactive components,
`<Sequence>`, `<Series.Sequence>`, `<TransitionSeries.Sequence>`, and
`<TransitionSeries.Overlay>`:

```tsx
<Title from={60} durationInFrames={90} premountFor={fps} />
```

Premount parent timeline items as well when a nested item must mount before the
parent starts. The composition cannot premount before frame 0.

`<Sequence layout="none">` cannot use `premountFor`. If it only wraps one
timing-capable component, remove the wrapper and put its timing and
`premountFor={fps}` directly on that component. Otherwise, use the default
sequence layout so the parent can premount.

For example, time a music bed directly on `<Audio>`:

```tsx
<Audio
  name="Music bed"
  src={staticFile("music.mp3")}
  from={392}
  loop
  premountFor={fps}
  volume={interpolate(frame, [392, 420, 6150, 6158], [0, 0.14, 0.14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })}
/>
```

Here the volume reaches zero at frame 6158 and stays there. Omit
`durationInFrames`: with `loop`, it sets the range to repeat rather than the
total clip length. The silent audio remains in the timeline until the parent
ends. Use an outer timed item only when the looping clip itself must end at an
exact frame.

## TransitionSeries

Use `<TransitionSeries>` for consecutive scenes that may need transitions. Without a transition, the scenes play without overlap. Use `<Series>` from `remotion` when transitions are not needed.

```tsx
import { TransitionSeries } from "@remotion/transitions";

<TransitionSeries showInTimeline={false}>
  <TransitionSeries.Sequence durationInFrames={45} premountFor={fps}>
    <Intro />
  </TransitionSeries.Sequence>
  <TransitionSeries.Sequence durationInFrames={60} premountFor={fps}>
    <MainContent />
  </TransitionSeries.Sequence>
  <TransitionSeries.Sequence durationInFrames={30} premountFor={fps}>
    <Outro />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

The items will be wrapped in an absolute fill element by default when using `<TransitionSeries.Sequence>`, unless the `layout` prop is set to `none`.
