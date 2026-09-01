---
name: studio-perf
description: Optimize Remotion Studio render performance by minimizing frame-reactive component surfaces, preferring imperative timeline state reads, and memoizing stable render boundaries. Use when code reads the current frame with `useTimelinePosition()` or components unnecessarily render on every frame.
---

# Studio Performance

## Minimize frame subscriptions

Keep dependencies on the current frame as low in the component tree as possible.
Prefer imperative timeline state reads such as `getCurrentFrame()` over
`Internals.Timeline.useTimelinePosition()` for event handlers and other
on-demand logic.

Use `useTimelinePosition()` only in the smallest leaf component whose rendered
output must change with the frame. If a parent reads the frame only to pass it
to a child, extract a frame-subscribing child so the parent and its other
descendants stay stable.

## Memoize stable boundaries

Wrap components in `React.memo()` when they can safely skip parent-driven
renders. Confirm that their props remain referentially stable across frame
updates: newly created objects, callbacks, styles, or React nodes defeat shallow
memoization. Stabilize those props only where it is natural; avoid custom
comparators that ignore behaviorally relevant changes.

Context subscribers continue to update through memoized ancestors. Prefer a
memoized stable parent with a small frame-subscribing leaf over making the whole
subtree reactive to the current frame.
