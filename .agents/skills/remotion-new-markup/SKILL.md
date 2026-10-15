---
name: remotion-new-markup
description: Write or refactor Remotion markup with Track, connected compositions, and Interactive.create using explicit absolute-fill or none layouts.
---

# New Remotion markup

Follow the complete [Track + connected compositions example](../../../packages/skills/skills/remotion-interactivity/timeline-structure.md).

- Put successive scenes in a named `<Track>`, with `from` and `durationInFrames` directly on each instance. Items in a `<Track>` MUST not overlap.
- Create scenes with `Interactive.create({layout: 'absolute-fill'})`; return a fragment inside and put instance styles on the exported component.
- Create bounded elements with `Interactive.create({layout: 'none'})`; forward `style` to a plain root.
- Register the same exported scene and reusable element components as connected compositions, with inline metadata and representative `defaultProps`.
- Keep each independently editable instance as its own JSX node. Use plain HTML for layout-only containers.

Use `TransitionSeries` when scenes overlap through transitions. Preserve its specialized sequence boundaries. Avoid extra `Sequence` and `AbsoluteFill` wrappers.
