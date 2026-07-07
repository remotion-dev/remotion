---
name: interactivity-best-practices
description: Best practices for writing Remotion animations that stay intuitive for agents and editable in Remotion Studio Visual Mode.
---

# Interactivity Best Practices

Use the canonical interactivity best-practices page instead:
[packages/docs/docs/studio/interactivity-best-practices.mdx](../../../packages/docs/docs/studio/interactivity-best-practices.mdx)

To make an element or custom component interactive, use:
[packages/docs/docs/studio/make-component-interactive.mdx](../../../packages/docs/docs/studio/make-component-interactive.mdx)

When applying this skill, do not stop after wrapping elements in `Interactive.*`.
Also enforce the practices that keep Studio values editable:

- Give editable elements and components a descriptive `name`.
- Keep editable and keyframed values inline at the JSX prop the Studio edits.
- Use hardcoded numeric `interpolate()` input ranges such as `[30, 50]`; do not use variables or expressions such as `[startFrame, startFrame + duration]`.
- Put easing in the same `interpolate()` call options instead of nesting `interpolate()` calls around an eased progress value.
- Use `style.translate`, `style.scale`, `style.rotate`, `style.transformOrigin` and `style.opacity` directly.
- Replace `transform` strings such as `` `scale(${value})` `` with individual style props.
- Use `translate` for animated movement and canvas dragging. Keep `top`, `left`, `right` and `bottom` for static anchoring.
