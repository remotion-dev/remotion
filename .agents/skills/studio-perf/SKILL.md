---
name: studio-perf
description: Optimize Remotion Studio render performance by preferring imperative timeline state reads. Use when code reads the current frame with `useTimelinePosition()` or components unnecessarily render on every frame.
---

# Studio Performance

Prefer imperative timeline state reads such as `getCurrentFrame()` over
`Internals.Timeline.useTimelinePosition()`. Use the hook only when the component
must render whenever the frame changes.
