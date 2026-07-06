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

❌ Avoid using `spring()` as a separate driver when the same motion can be expressed as `interpolate()` easing:

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

❌ Avoid:

```tsx
style={{
  transform: `scale(${interpolate(frame, [0, 100], [0, 2])})`,
}}
```

Individual transform properties are editable in Studio Visual Mode. Values hidden inside a `transform` string are not.

Also avoid combining multiple transforms into one string:

```tsx
const translateY = interpolate(frame, [0, 100], [0, 120]);
const rotation = interpolate(frame, [0, 100], [0, 20]);

style={{
  transform: `translateY(${translateY}px) rotate(${rotation}deg)`,
}}
```

Prefer CSS transform shorthands:

```tsx
style={{
  translate: interpolate(frame, [0, 100], ["0px 0px", "0px 120px"]),
  rotate: interpolate(frame, [0, 100], ["0deg", "20deg"]),
}}
```

## Keep editable values inline

Put the interpolation directly in the JSX style object when the value should be visually editable.

Prefer:

```tsx
style={{
  scale: interpolate(frame, [0, 100], [0, 2]),
}}
```

❌ Avoid:

```tsx
const scale = interpolate(frame, [0, 100], [0, 2]);

style={{
  scale,
}}
```

Inline computations and literal values let Studio Visual Mode discover and edit the keyframes and props.

## Keep `defaultProps` inline

When a composition should be editable in Studio, keep `defaultProps` as an inline object literal on the `<Composition>` or `<Still>` tag.

Prefer:

```tsx
<Composition
  id="my-video"
  component={MyComponent}
  durationInFrames={150}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{
    title: "Hello",
    color: "#0b84ff",
  }}
/>
```

❌ Avoid storing `defaultProps` in a variable, importing it, spreading it, or creating it with a helper:

```tsx
const defaultProps = {
  title: "Hello",
  color: "#0b84ff",
};

<Composition
  id="my-video"
  component={MyComponent}
  durationInFrames={150}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={defaultProps}
/>
```

Use `defaultProps` for composition-wide values that should be visible and editable before the video renders.
Studio's save codemod requires this shape. Otherwise it can show: `` `defaultProps` prop must be a hardcoded value in the <Composition/> tag ``.

## Keep scaffold metadata near the component

When scaffolding a composition for Studio editing, keep the component and its `<Composition>` registration in the same file so dimensions, duration, FPS, and defaults are visible next to the rendered code.

Prefer inline static metadata:

```tsx
type MyComponentProps = {
  readonly title: string;
};

export const MyComponent: React.FC<MyComponentProps> = ({title}) => {
  return <h1>{title}</h1>;
};

export const MyComposition: React.FC = () => {
  return (
    <Composition
      id="my-video"
      component={MyComponent}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        title: "Hello",
      }}
    />
  );
};
```

Use `calculateMetadata()` only when metadata depends on dynamic input props, fetched data, or asset metadata.
For static dimensions, duration, FPS, and initial props, inline the values on `<Composition>`.

❌ Avoid using `calculateMetadata()` for static values:

```tsx
const calculateMetadata = () => {
  return {
    durationInFrames: 150,
    fps: 30,
    width: 1920,
    height: 1080,
  };
};

<Composition
  id="my-video"
  component={MyComponent}
  calculateMetadata={calculateMetadata}
  defaultProps={{
    title: "Hello",
  }}
/>
```

This also applies to effect parameters. Keep editable effect values inline in the effect call.

Prefer:

```tsx
effects={[
  radialProgressiveBlur({
    center: [0.5, 0.5],
    point1: [0.86, 0.36],
    point2: [0.68, 0.84],
  }),
]}
```

❌ Avoid hiding editable values behind constants:

```tsx
const center = [0.5, 0.5] as const;

effects={[
  radialProgressiveBlur({
    center,
  }),
]}
```

## Keep effects unconditional

When using the `effects` prop, keep the effect array shape unconditional. Studio Visual Mode cannot reliably edit an effect that only exists behind a conditional expression.

Prefer rendering separate elements when one version should have effects and another should not:

```tsx
<CanvasImage src={src} width={1280} height={720} />
<CanvasImage
  src={src}
  width={1280}
  height={720}
  effects={[
    blur({
      radius: interpolate(frame, [0, 100], [0, 40]),
    }),
  ]}
/>
```

❌ Avoid conditionally including an effect:

```tsx
<CanvasImage
  src={src}
  width={1280}
  height={720}
  effects={enabled ? [blur({radius: 40})] : []}
/>
```

Keep editable effect parameters inline inside the unconditional effect call. Do not pass variables for editable values such as coordinates, colors, numeric controls, or interpolations.

## Interpolate rotation and translation directly

Interpolate CSS unit strings directly for `rotate` and `translate`.

Prefer:

```tsx
style={{
  rotate: interpolate(frame, [0, 100], ["20deg", "90deg"]),
  translate: interpolate(frame, [0, 100], ["0px 0px", "100px 100px"]),
}}
```

❌ Avoid manually building strings around separately interpolated numbers when the property can be interpolated directly.

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
