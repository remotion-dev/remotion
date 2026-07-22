---
name: remotion-interactivity
description: Best practices for writing Remotion animations that stay intuitive for agents and editable in Remotion Studio Visual Mode.
metadata:
  tags: remotion, interactivity, studio, visual mode
---

# Remotion Interactivity

Use the canonical interactivity best-practices page instead:
[Interactivity best practices](https://www.remotion.dev/docs/studio/interactivity-best-practices.md)

To make an element or custom component interactive, use:
[Make a component interactive](https://www.remotion.dev/docs/studio/make-component-interactive.md)

## Computed values

The Studio leaves computed values untouched and preserves their runtime result.
Properties inherited from an object spread are computed unless the property is
declared explicitly after the spread. Inline a property after the spread only
when it should be editable or keyframable in the Studio.

## Video editing

If a Remotion component mainly consists of video and audio clips, see [Video editing](../remotion-markup/video-editing.md) for best practices on how to structure Remotion markup so the clips are interactively editable in the timeline.
