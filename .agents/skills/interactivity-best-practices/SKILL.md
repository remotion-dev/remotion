---
name: interactivity-best-practices
description: Best practices for writing Remotion animations that stay intuitive for agents and editable in Remotion Studio Visual Mode.
---

# Interactivity Best Practices

Use the canonical interactivity best-practices page instead:
[packages/docs/docs/studio/interactivity-best-practices.mdx](../../../packages/docs/docs/studio/interactivity-best-practices.mdx)

To make an element or custom component interactive, use:
[packages/docs/docs/studio/make-component-interactive.mdx](../../../packages/docs/docs/studio/make-component-interactive.mdx)

When using `Interactive.withSchema()`, prefer `wrapInSequence: true`. This adds `Interactive.baseSchema` automatically and exposes standard timeline controls such as trimming and visibility.

Only include `Interactive.baseSchema` manually when the component needs to render its own `<Sequence>` for advanced behavior such as premounting, effects or custom timeline behavior.
