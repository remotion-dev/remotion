---
name: interactivity-best-practices
description: Best practices for writing Remotion animations that stay intuitive for agents and editable in Remotion Studio Visual Mode.
---

# Interactivity Best Practices

Use these guidelines when creating or reviewing Remotion animations, especially if the animation should be editable in Remotion Studio Visual Mode.

## Prefer `interpolate()` over standalone `spring()`

Prefer `interpolate()` for most animation values.

- It is easier for humans and agents to reason about.
- Bezier easings are familiar from CSS and can express snappy or jumpy motion.
- Studio Visual Mode can edit `interpolate()` keyframes.

When an animation should feel like a spring, keep the editable value in `interpolate()` and pass `Easing.spring()` as the easing function.

Prefer:

```tsx
style={{
  scale: interpolate(frame, [0, 30], [0, 1], {
    easing: Easing.spring({
      damping: 200,
    }),
  }),
}}
```

Avoid using `spring()` as a separate driver when the same motion can be expressed as `interpolate()` easing:

```tsx
const scale = spring({
  frame,
  fps,
  config: {
    damping: 200,
  },
});

style={{
  scale,
}}
```

`Easing.spring()` supports `damping`, `mass`, `stiffness`, and `overshootClamping`. It is normalized to the interpolation progress, so it does not take `frame`, `fps`, `from`, `to`, `delay`, `reverse`, `durationInFrames`, or `durationRestThreshold`.

Use standalone `spring()` only when the animation specifically needs a frame-driven physical spring simulation that cannot be represented as an easing on `interpolate()`.

## Prefer individual CSS transform properties

Use individual CSS transform properties such as `scale`, `rotate`, and `translate` instead of composing a `transform` string.

Prefer:

```tsx
style={{
  scale: interpolate(frame, [0, 100], [0, 2]),
}}
```

Avoid:

```tsx
style={{
  transform: `scale(${interpolate(frame, [0, 100], [0, 2])})`,
}}
```

Individual transform properties are editable in Studio Visual Mode. Values hidden inside a `transform` string are not.

## Keep editable values inline

Put the interpolation directly in the JSX style object when the value should be visually editable.

Prefer:

```tsx
style={{
  scale: interpolate(frame, [0, 100], [0, 2]),
}}
```

Avoid:

```tsx
const scale = interpolate(frame, [0, 100], [0, 2]);

style={{
  scale,
}}
```

Inline computations let Studio Visual Mode discover and edit the keyframes.

## Interpolate rotation and translation directly

Interpolate CSS unit strings directly for `rotate` and `translate`.

Prefer:

```tsx
style={{
  rotate: interpolate(frame, [0, 100], ["20deg", "90deg"]),
  translate: interpolate(frame, [0, 100], ["0px 0px", "100px 100px"]),
}}
```

Avoid manually building strings around separately interpolated numbers when the property can be interpolated directly.

Direct interpolation of these properties is supported and works better with visual editing in Studio.

## Use `Interactive.*` for tweakable elements

Use the `Interactive` namespace from `remotion` when an element is likely to be tweaked in Studio.

```tsx
import {Interactive} from "remotion";
```

For example:

```tsx
<Interactive.Div
  style={{
    color: "red",
    fontSize: 80,
  }}
>
  Hello
</Interactive.Div>
```

`<Interactive.Div>`, `<Interactive.Span>`, and the other `Interactive.*` components behave like their regular HTML equivalents, but enable interactivity in Studio.

Inline styles on these elements, such as text color and font size, can be standardized interactively.
