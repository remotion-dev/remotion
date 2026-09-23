---
name: studio-css-reset
description: Style Remotion Studio UI inside `.css-reset` containers without relying on inherited reset properties.
---

# Studio CSS reset

Studio uses `.css-reset` containers to limit the effect of user styles on its UI. The bundler injects this rule in `packages/bundler/src/setup-environment.ts`:

```css
.css-reset, .css-reset * {
  font-size: 16px;
  line-height: 1.5;
  color: white;
  font-family: Arial, Helvetica, sans-serif;
  background: transparent;
  box-sizing: border-box;
}
```

The rule applies to each reset container and every descendant, but only to the properties shown. It does not cover elements outside those containers or prevent a stronger user CSS rule from winning.

## Must-follow rule

Do not rely on inheritance for a property in this reset. Each descendant receives its own reset value, so styling a parent alone will not style nested text or SVG shapes. Set the needed value on the element that renders it, or use a CSS selector that explicitly styles that descendant.
