---
title: Timing & Sequencing
impact: HIGH
impactDescription: controls when elements appear and enables complex choreography
tags: sequence, series, timing, delay, choreography
---

## Set timing and names directly on supported components

`<AbsoluteFill>` already supports `name`, `from`, `durationInFrames`, `trimBefore`, `freeze`, `hidden` and `showInTimeline`.
The same applies to `<Interactive.Div>`, `<Img>`, `<CanvasImage>`, `<AnimatedImage>`, `<Gif>` and `<Audio>` / `<Video>` from `@remotion/media`.
Pass supported timing and naming props directly to these components instead of adding an outer `<Sequence>` for a single child.
The legacy `<Html5Audio>`, `<Html5Video>` and `<OffthreadVideo>` still need a `<Sequence>` for timing.

```tsx title="Standalone background layer"
<AbsoluteFill
  name="Background"
  from={30}
  durationInFrames={90}
  style={{background: 'linear-gradient(135deg, #0f172a, #312e81)'}}
/>
```

Keep an outer `<Sequence>` when it groups multiple children or supplies layout or props that the child does not support. For example, `<AbsoluteFill>` needs a wrapper for premounting, postmounting or `width` / `height` overrides, while `<Audio>` and `<Video>` from `@remotion/media` support `premountFor` and `postmountFor` directly.
Timing props on `<AbsoluteFill>` apply to its descendants, including their `useCurrentFrame()` calls.

## Sequence for Delayed Elements

Use Sequence to delay when an element appears in the timeline.

**Incorrect (manual frame checks):**

```tsx
{
  frame >= 30 && <Title />;
}
{
  frame >= 60 && <Subtitle />;
}
```

**Correct (Sequence component):**

```tsx
import { Sequence } from "remotion";

<Sequence from={30} durationInFrames={90}>
  <Title />
</Sequence>
<Sequence from={60} durationInFrames={60}>
  <Subtitle />
</Sequence>
```

## Series for Sequential Playback

Use Series when elements should play one after another without overlap.

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

## Series with Offset for Overlap

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

## Staggered Element Entrances

For staggered animations of multiple items, calculate delays:

**Incorrect (hardcoded delays):**

```tsx
const items = data.map((item, i) => {
  const delay = i === 0 ? 0 : i === 1 ? 10 : i === 2 ? 20 : 30;
  // ...
});
```

**Correct (calculated stagger):**

```tsx
const STAGGER_DELAY = 8;
const BASE_DELAY = 15;

const items = data.map((item, i) => {
  const delay = BASE_DELAY + i * STAGGER_DELAY;
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 120 },
  });
  return (
    <Item
      key={i}
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * 20}px)`,
      }}
    />
  );
});
```

## Nested Sequences

Sequences can be nested for complex timing:

```tsx
<Sequence from={0} durationInFrames={120}>
  <Background />
  <Sequence from={15} durationInFrames={90}>
    <Title />
  </Sequence>
  <Sequence from={45} durationInFrames={60}>
    <Subtitle />
  </Sequence>
</Sequence>
```

## Frame References Inside Sequences

Inside a Sequence, useCurrentFrame() returns the local frame (starting from 0):

```tsx
<Sequence from={60} durationInFrames={30}>
  <MyComponent />
  {/* Inside MyComponent, useCurrentFrame() returns 0-29, not 60-89 */}
</Sequence>
```
