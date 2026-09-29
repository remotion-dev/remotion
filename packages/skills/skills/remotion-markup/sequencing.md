---
name: sequencing
description: Sequencing patterns for Remotion - delay, trim, limit duration of items
metadata:
  tags: sequence, series, timing, delay, trim
---

Prefer timing props directly on built-in interactive components and custom
components made with `Interactive.withSchema({wrapInSequence: true})`. Avoid
wrapping a single timing-capable component in a redundant `<Sequence>`.

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

## Series

Use `<Series>` when elements should play one after another without overlap.

```tsx
import { Series } from "remotion";

<Series>
  <Series.Sequence durationInFrames={45}>
    <Intro />
  </Series.Sequence>
  <Series.Sequence durationInFrames={60}>
    <MainContent />
  </Series.Sequence>
  <Series.Sequence durationInFrames={30}>
    <Outro />
  </Series.Sequence>
</Series>;
```

Same as with `<Sequence>`, the items will be wrapped in an absolute fill element by default when using `<Series.Sequence>`, unless the `layout` prop is set to `none`.

### Series with overlaps

Use negative offset for overlapping sequences:

```tsx
<Series>
  <Series.Sequence durationInFrames={60}>
    <SceneA />
  </Series.Sequence>
  <Series.Sequence offset={-15} durationInFrames={60}>
    {/* Starts 15 frames before SceneA ends */}
    <SceneB />
  </Series.Sequence>
</Series>
```

## Frame References Inside Sequences

Inside a Sequence, `useCurrentFrame()` returns the local frame (starting from 0):

```tsx
<Sequence from={60} durationInFrames={30}>
  <MyComponent />
  {/* Inside MyComponent, useCurrentFrame() returns 0-29, not 60-89 */}
</Sequence>
```

## Nested Sequences

Sequences can be nested for complex timing:

```tsx
<Sequence from={0} durationInFrames={120}>
  <Background />
  <Title from={15} durationInFrames={90} />
  <Subtitle from={45} durationInFrames={60} />
</Sequence>
```

## Nesting compositions within another

To add a composition within another composition, you can use the `<Sequence>` component with a `width`, `height`, `durationInFrames` prop to specify the size of the composition.  
This will override the values of `useVideoConfig()` when calling inside that component.

```tsx
<AbsoluteFill>
  <Sequence width={500} height={500} durationInFrames={100} from={30}>
    <CompositionComponent />
  </Sequence>
</AbsoluteFill>
```
