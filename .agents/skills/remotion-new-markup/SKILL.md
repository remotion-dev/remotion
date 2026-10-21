---
name: remotion-new-markup
description: Write or refactor editable Remotion markup with appropriate tracks, shared timing boundaries, and connected compositions.
---

# New Remotion markup

Read [editable timeline structure](../../../packages/skills/skills/remotion-interactivity/timeline-structure.md)
before choosing components and wrappers. Start with what should be edited
together, then choose independent tracks or consecutive sequences. The guide
includes the complete interactive element, scene, parent, and registration.

For footage with synchronized captions or overlays, also read
[editable video timelines](../../../packages/skills/skills/remotion-markup/video-editing.md).
For extracting a group into its own timeline, use
[connected compositions](../../../packages/skills/skills/remotion-markup/connected-compositions.md).

## Keep frame subscriptions local

Call `useCurrentFrame()` in the smallest component that needs the frame to
render. Keep composition and scene components that arrange clips and tracks
free of frame subscriptions when only a soundtrack volume, animated title, or
overlay needs to change. Extract that item into a component defined at module
scope, and read the frame there instead of passing it down from the parent.
This prevents that animation from re-rendering unrelated clips and scenes on
every frame.

Keep editable `interpolate()` calls inline on the animated item's props. For
example, a `Soundtrack` component can read `useCurrentFrame()` and return an
`Audio` with `volume={interpolate(frame, ...)}`, while the composition only
renders `<Soundtrack />` alongside its scenes. Prefer a static value when the
output does not actually vary with the frame.

Preserve the existing timing boundary when extracting: placing the hook inside
a `Sequence` or a timed component changes its frame coordinates. Keep trims,
offsets, volume envelopes, and animation keyframes on the same clock, or adjust
the keyframes deliberately to preserve the edit. A plain React component is
enough for this render boundary; add timeline wrappers only for editing needs.

Verify a structural change in the full composition and any standalone views.
Preserve the existing edit, and distinguish useful markup grouping from Studio's
row expansion and layout behavior.
