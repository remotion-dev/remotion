---
name: sequencing
description: Sequencing patterns for Remotion - delay, trim, limit duration of items
metadata:
  tags: sequence, series, timing, delay, trim
---

Prefer timing props directly on built-in interactive components and custom
components made with `Interactive.withSchema({wrapInSequence: true})`.  
Avoid wrapping a single timing-capable component in a redundant `<Sequence>`.

See [Remotion Interactivity](../remotion-interactivity/SKILL.md) for creating
schema-wrapped components and [connected compositions](connected-compositions.md)
for registering them with their own Studio timelines.

```tsx
// Title and Subtitle are exported with Interactive.withSchema({wrapInSequence: true}).
<AbsoluteFill>
  <Title name="Title" from={30} durationInFrames={60} />
  <Subtitle name="Subtitle" from={60} durationInFrames={60} />
</AbsoluteFill>
```

Use an explicit `<Sequence>` when multiple siblings need one shared clock,
when overriding dimensions for descendants, or when the child does not accept
timing props. Its default layout adds an absolutely positioned fill element;
use `layout="none"` when no layout wrapper is needed.

## Premounting

Use `premountFor` when media or expensive content needs preparation before it
becomes visible. Pass it directly to a timing-capable component:

```tsx
<Title from={60} durationInFrames={90} premountFor={30} />
```

Note that parent sequences may also need premounting, otherwise there is no effect.

## Series

Use `<TransitionSeries>` when elements should play one after another without overlap.

```tsx
import { TransitionSeries } from "remotion";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={45}>
    <Intro />
  </TransitionSeries.Sequence>
  <TransitionSeries.Sequence durationInFrames={60}>
    <MainContent />
  </TransitionSeries.Sequence>
  <TransitionSeries.Sequence durationInFrames={30}>
    <Outro />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

The items will be wrapped in an absolute fill element by default when using `<TransitionSeries.Sequence>`, unless the `layout` prop is set to `none`.
