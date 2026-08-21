---
name: no-pointer
description: Apply Remotion Studio's pointerless interaction styling to clickable controls. Use when adding or revising Studio buttons or links that should use the default cursor, brighten on hover, and show focus decoration only for keyboard navigation.
---

# No Pointer

Use the established Studio interaction convention for clickable controls:

- Set `cursor: 'default'`; do not use `cursor: 'pointer'`.
- Drive purely visual hover styling through `HOVERABLE_CLASS_NAME` and
  `hoverableStyle()` from `packages/studio/src/helpers/hoverable.ts`. Do not add
  React hover state for color or background changes.
- Keep the background unchanged unless the surrounding component already uses
  a shared background-hover convention. For a text-only action, use
  `TRANSPARENT` for both `idleBackground` and `hoverBackground`.
- Use `LIGHT_TEXT` (`#A6A7A9`) as the idle color and `WHITE` (`white`) as the
  hover color. Icons and nested text must follow the same state; inspect the
  element that paints the pixels if the Studio CSS reset blocks inheritance.

## Focus styling

Remove the default outline and pointer-focus shadow, but preserve a visible
keyboard focus indicator. Add `FOCUS_VISIBLE_ONLY_CLASS_NAME` from
`packages/studio/src/helpers/hoverable.ts` to the control alongside
`HOVERABLE_CLASS_NAME`. The shared class implements this pattern:

```css
.__remotion-focus-visible-only:focus {
  outline: none;
  box-shadow: none;
}

.__remotion-focus-visible-only:focus-visible {
  box-shadow: ${FOCUS_BOX_SHADOW};
}
```

Never remove the `:focus-visible` indicator. Keep hidden actions out of the tab
order until they are discoverable.

## Verify

In a running Studio, check the control's computed styles in all relevant states:

- idle and hovered cursor: `default`;
- idle color: `rgb(166, 167, 169)`;
- hovered color: `rgb(255, 255, 255)`;
- pointer focus: no outline or box shadow;
- keyboard `Tab` focus: the standard `FOCUS_BOX_SHADOW` is visible.

For Studio code changes, run:

```bash
bunx turbo run make --filter='@remotion/studio'
bunx turbo run lint test --filter='@remotion/studio'
```
