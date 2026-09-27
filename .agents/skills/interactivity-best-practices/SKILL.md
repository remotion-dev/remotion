---
name: interactivity-best-practices
description: Best practices for writing Remotion animations that stay intuitive for agents and editable in Remotion Studio Visual Mode.
---

# Interactivity Best Practices

Use the canonical interactivity best-practices page instead:
[packages/docs/docs/studio/interactivity-best-practices.mdx](../../../packages/docs/docs/studio/interactivity-best-practices.mdx)

To make an element or custom component interactive, use:
[packages/docs/docs/studio/make-component-interactive.mdx](../../../packages/docs/docs/studio/make-component-interactive.mdx)

When using `Interactive.withSchema()`, prefer `wrapInSequence: true`. This adds `Interactive.baseSchema` and `Interactive.premountSchema` automatically and exposes standard timeline and mounting controls. The component must accept a `style?: React.CSSProperties` prop and apply it to its visual root.

Both `wrapInSequence: true` and `wrapInSequence: {cropping: true}` expose `InteractivePremountProps`. In v4, `premountFor` defaults to `0`. In v5, it defaults to one second (`fps` frames); pass `premountFor={0}` to opt out. `postmountFor` defaults to `0`.

Only include `Interactive.baseSchema` manually when the component needs to render its own `<Sequence>` for effects, multiple visual roots or custom timeline behavior.
