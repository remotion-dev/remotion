---
name: studio-css-reset
description: Diagnose and fix Remotion Studio UI bugs caused by the global CSS reset. Use when nested text or SVG icons have incorrect color, typography, sizing, hover states, or truncation in packages/studio.
---

# Studio CSS Reset

Remotion Studio's reset targets both the reset container and every descendant. A child does not necessarily inherit the visual styles of its parent: the reset may give that child its own computed value instead.

## Diagnose the affected element

Inspect the element that actually paints the pixels, not only its parent:

- For text, inspect the `span`, `div`, or other text wrapper.
- For SVG icons, inspect the painted `path`, `circle`, or `rect` as well as the outer `svg`.
- Compare computed styles in every relevant state: idle, hovered, selected, focused, and disabled.
- Check whether the value comes from an inline style, SVG presentation attribute, inheritance, or the `.css-reset, .css-reset *` rule.

## Apply explicit local styles

Do not assume that styling the row, button, or outer SVG is enough.

For text wrappers, explicitly set the visual properties the component depends on, such as:

```tsx
const labelStyle: React.CSSProperties = {
	fontFamily: 'inherit',
	fontSize: 13,
	lineHeight: 'normal',
	color: 'inherit',
};
```

Use `color: 'inherit'` only when the styled element directly paints the text. It does not protect deeper descendants that receive their own reset value.

For SVG icons, remember that `fill="currentColor"` resolves against the computed `color` of the painted SVG element. If the reset sets `color: white` on the inner `<path>`, setting `color: 'inherit'` only on the outer `<svg>` will not fix it. Pass the concrete state color to the component that renders the painted element:

```tsx
<AssetFileIcon color={hovered || selected ? WHITE : LIGHT_TEXT} />
```

Prefer a concrete `fill`, `stroke`, or color prop when the icon has state-dependent colors. Use `currentColor` only after confirming that the painted descendants inherit the intended color.

## Preserve compact row layout

When adding icon-and-label markup:

- Give icons fixed dimensions and `flexShrink: 0`.
- Give labels `minWidth: 0`, `overflow: 'hidden'`, `textOverflow: 'ellipsis'`, and `whiteSpace: 'nowrap'` when truncation is required.
- Confirm that wrappers do not change row height, spacing, or the ellipsis behavior.

Prefer fixing a shared Studio component once when the same row or icon pattern is reused.

## Verify the result

Do not stop after checking that the code compiles. In a running Studio, inspect the computed style of the element that paints the pixels in both idle and interactive states. Confirm that labels and icons change together and that selection does not mask a broken hover state.

For Studio code changes, run at least:

```bash
bunx turbo run make --filter='@remotion/studio'
bunx turbo run lint test --filter='@remotion/studio'
```
