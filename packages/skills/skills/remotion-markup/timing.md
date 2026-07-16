---
name: timing
description: Interpolation and timing in Remotion—prefer interpolate with Bézier easing; springs as a specialized option
metadata:
  tags: easing, bezier, interpolation, spring, timing
---

Drive motion with `interpolate()` over an explicit frame range. Prefer `interpolate()` over `spring()` unless the user explicitly asks for physics-based motion. To customize timing, use **`Easing.bezier`**. The four parameters are the same as CSS `cubic-bezier(x1, y1, x2, y2)`.

A simple linear interpolation is done using the `interpolate` function.

```ts title="Going from 0 to 1 over 100 frames"
import { interpolate } from "remotion";

const opacity = interpolate(frame, [0, 100], [0, 1]);
```

By default, the values are not clamped, so the value can go outside the range [0, 1].  
Here is how they can be clamped:

```ts title="Going from 0 to 1 over 100 frames with extrapolation"
const opacity = interpolate(frame, [0, 100], [0, 1], {
  extrapolateRight: "clamp",
  extrapolateLeft: "clamp",
});
```

## Studio-editable animation patterns

When an animation should be editable in Remotion Studio, keep the `interpolate()` call directly in the `style` prop and prefer individual CSS transform properties:

```tsx
// 👍 Inline editable keyframes and transform shorthands
style={{
  scale: interpolate(frame, [0, 100], [0, 1]),
  translate: interpolate(frame, [0, 100], ["0px 0px", "100px 100px"]),
  rotate: interpolate(frame, [0, 100], ["20deg", "90deg"]),
}}

// 👎 Hidden values and transform strings become computed in Studio
const translateY = interpolate(frame, [0, 100], [0, 120]);
const rotation = interpolate(frame, [0, 100], [0, 20]);

style={{
  transform: `translateY(${translateY}px) rotate(${rotation}deg)`,
}}
```

Use `transform` strings only when individual CSS transform properties do not cover the effect, such as `skew()`, `perspective()`, or order-sensitive multi-transform chains.

## Bézier easing

Use `Easing.bezier(x1, y1, x2, y2)` inside the `interpolate` options object. The curve is identical in spirit to CSS animations and transitions, which helps when you are stealing timing from the web or from a designer’s spec.

```ts
import { interpolate, Easing } from "remotion";

const opacity = interpolate(frame, [0, 60], [0, 1], {
  easing: Easing.bezier(0.16, 1, 0.3, 1),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

### Examples (copy-paste curves)

**1. Crisp UI entrance (strong ease-out, no overshoot)** — slows nicely into the rest value; similar to many system “deceleration” curves.

```tsx
const enter = interpolate(frame, [0, 45], [0, 1], {
  easing: Easing.bezier(0.16, 1, 0.3, 1),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

**2. Editorial / slow fade (balanced ease-in-out)** — symmetric acceleration and deceleration over a hold-friendly move.

```tsx
const progress = interpolate(frame, [0, 90], [0, 1], {
  easing: Easing.bezier(0.45, 0, 0.55, 1),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

**3. Playful overshoot (control point y > 1)** — a little past the target then settles; use sparingly for emphasis.

```tsx
const pop = interpolate(frame, [0, 30], [0, 1], {
  easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

## Preset easings (`Easing.in` / `Easing.out` / named curves)

Easing can be added to the `interpolate` function without a custom cubic:

```ts
import { interpolate, Easing } from "remotion";

const value1 = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.inOut(Easing.cubic),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

The default easing is `Easing.linear`.  
Convexities:

- `Easing.in` — starting slow and accelerating
- `Easing.out` — starting fast and slowing down
- `Easing.inOut`

Named curves (from most linear to most curved):

- `Easing.quad`
- `Easing.cubic` (good default when you do not need a custom cubic)
- `Easing.sin`
- `Easing.exp`
- `Easing.circle`

### Easing direction for enter/exit animations

Use `Easing.out` for enter animations (starts fast, decelerates into place) and `Easing.in` for exit animations (starts slow, accelerates away). This feels natural because elements arrive with momentum and leave with gravity. When you need a specific curve from design, prefer a single `Easing.bezier(...)` instead of stacking presets.

## Composing interpolations

When multiple properties share the same timing and do not need Studio keyframe editing (e.g. a slide-in panel and a video shift), avoid duplicating the full interpolation for each property. Instead, create a single normalized progress value (0 to 1) and derive each property from it:

```tsx
const slideIn = interpolate(
  frame,
  [slideInStart, slideInStart + slideInDuration],
  [0, 1],
  {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  },
);
const slideOut = interpolate(
  frame,
  [slideOutStart, slideOutStart + slideOutDuration],
  [0, 1],
  { easing: Easing.in(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);
const progress = slideIn - slideOut;

// Derive multiple properties from the same progress
const overlayX = interpolate(progress, [0, 1], [100, 0]);
const videoX = interpolate(progress, [0, 1], [0, -20]);
const opacity = interpolate(progress, [0, 1], [0, 1]);
```

The key idea: separate **timing** (when and how fast) from **mapping** (what values to animate between).

If the values should be visually keyframed in Studio, prefer inline `interpolate()` calls in the relevant style props, even if it duplicates the timing.
