---
name: sequencing
description: Sequencing patterns for Remotion - delay, trim, limit duration of items
metadata:
  tags: sequence, series, timing, delay, trim
---

Use `<Sequence>` to delay when an element appears in the timeline.

```tsx
const Main = () => {
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill>
        <Sequence name="Title" from={30} durationInFrames={60} layout="none">
          <Title />
        </Sequence>
        <Sequence
          name="Subtitle"
          from={60}
          durationInFrames={60}
          layout="none"
        >
          <Subtitle />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export const Title = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Label"
      style={{
        opacity: interpolate(frame, [0, 60], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        fontSize: 88
      }}
    >
      Title
    </Interactive.Div>
  );
};

export const Subtitle = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Subtitle"
      style={{
        opacity: interpolate(frame, [0, 60], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        fontSize: 32
      }}
    >
      Subtitle
    </Interactive.Div>
  );
};
```

This will by default wrap the component in an absolute fill element.  
If the items should not be wrapped, use the `layout` prop:

```tsx
<Sequence layout="none">
  <Title />
</Sequence>
```

## Premounting

This loads the component in the timeline before it is actually played.  
Always premount any `<Sequence>`!

```tsx
<Sequence premountFor={1 * fps}>
  <Title />
</Sequence>
```

## TransitionSeries

Use `<TransitionSeries>` when elements should play one after another without overlap.

```tsx
import { TransitionSeries } from "@remotion/transitions";

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

Same as with `<Sequence>`, the items will be wrapped in an absolute fill element by default when using `<TransitionSeries.Sequence>`, unless the `layout` prop is set to `none`.

### TransitionSeries with overlaps

Use negative offset for overlapping sequences:

```tsx
<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Sequence offset={-15} durationInFrames={60}>
    {/* Starts 15 frames before SceneA ends */}
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>
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
  <Sequence from={15} durationInFrames={90} layout="none">
    <Title />
  </Sequence>
  <Sequence from={45} durationInFrames={60} layout="none">
    <Subtitle />
  </Sequence>
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
