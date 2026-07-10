---
name: remotion-interactivity
description: Best practices for writing Remotion animations that stay intuitive for agents and editable in Remotion Studio Visual Mode.
metadata:
  tags: remotion, interactivity, studio, visual mode
---

# Remotion Interactivity

Use this guidance when writing Remotion code that should stay editable in
Remotion Studio Visual Mode. Studio can only rewrite values it can understand
statically. When a value appears as computed in Studio, it is often hidden
behind a variable, helper function, conditional expression, or `transform`
string.

## Quick Checklist

Apply these rules together when making a component interactive:

- Use `Interactive.*` for editable HTML or SVG elements.
- Use `Interactive.withSchema()` for custom components that should expose
  editable props.
- Add a short, descriptive `name` prop to every editable element or custom
  interactive component.
- Keep every editable or keyframed value inline at the JSX prop that Studio
  edits.
- Write animations as inline `interpolate()` calls.
- Keep `interpolate()` input and output ranges as hardcoded arrays, such as
  `[0, 30]`, not variables or expressions.
- Use Studio-editable style props such as `translate`, `scale`, `rotate`,
  `transformOrigin`, and `opacity`.
- Use `translate` for animated movement and canvas dragging. Reserve `top`,
  `left`, `right`, and `bottom` for static anchoring.
- Keep `<Composition>` metadata and `defaultProps` inline unless the value is
  truly dynamic.
- Keep effect parameters inline and keep effect arrays unconditional.

## Interactive Elements

Use the `Interactive` namespace when an HTML or SVG element should be selected,
moved, or edited in Studio.

```tsx
import {Interactive} from 'remotion';

// Good: selectable and editable in Studio.
<Interactive.Div name="Greeting card" style={{fontSize: 80, padding: 24}}>
  Hello
</Interactive.Div>;

// Avoid: a regular element is not Studio-editable.
<div style={{fontSize: 80, padding: 24}}>Hello</div>;
```

Names are shown in the Studio timeline and help agents identify the right
element when making visual edits.

```tsx
// Good: easy to find in the timeline and by agents.
<Interactive.Div name="Hero title" style={{fontSize: 80}}>
  Launch day
</Interactive.Div>;

// Avoid: omitted names are hard to identify.
<Interactive.Div style={{fontSize: 80}}>Launch day</Interactive.Div>;
```

## Keep Editable Values Visible

Put values that should be edited in Studio directly into JSX. This applies to
static style values, keyframes, easing, effect parameters, and transform props.

Do not calculate the value in a local variable and pass the variable into
`style`. Do not animate with frame math such as `frame * 2`, modulo
expressions, helper functions, or transform strings. Keep input and output
ranges directly in the same `interpolate()` call. Pass easing into that same
`interpolate()` call instead of creating an eased progress variable.

```tsx
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

export const ProductCard = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Product card"
      style={{
        color: 'white',
        fontSize: 80,
        scale: interpolate(frame, [0, 30], [0, 1], {
          easing: Easing.spring({damping: 200}),
        }),
        rotate: interpolate(frame, [0, 30], ['0deg', '20deg']),
        translate: interpolate(frame, [0, 30], ['0px 0px', '0px 120px']),
      }}
    />
  );
};
```

Avoid hiding editable values:

```tsx
const container: React.CSSProperties = {
  color: 'white',
  fontSize: 80,
};
const translateY = interpolate(frame, [0, 30], [0, 120]);
const rotation = interpolate(frame, [0, 30], [0, 20]);

<Interactive.Div
  name="Product card"
  style={{
    ...container,
    transform: `translateY(${translateY}px) rotate(${rotation}deg)`,
  }}
/>;
```

For animated position, keep motion in `translate` and leave static anchoring in
`top`, `right`, `bottom`, or `left`.

```tsx
<Interactive.Div
  name="Prompt bubble"
  style={{
    position: 'absolute',
    right: 56,
    top: 96,
    opacity: interpolate(frame, [30, 50], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    translate: interpolate(frame, [30, 50], ['0px 32px', '0px 0px'], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    scale: interpolate(frame, [30, 50], [0.92, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    transformOrigin: '100% 100%',
  }}
/>;
```

Use standalone `spring()` only when the animation needs a frame-driven physical
spring simulation.

## Composition Metadata

When scaffolding a composition, keep the component and its `<Composition>`
registration in the same file. Keep static `width`, `height`, `fps`,
`durationInFrames`, and `defaultProps` inline.

Studio can save visual edits back to code when `defaultProps` is an inline
object literal on `<Composition>` or `<Still>`. If Studio reports that
`defaultProps` must be hardcoded in the `<Composition/>` tag, move the values
into JSX.

```tsx
// Good: static metadata and defaults are inline and nearby.
<Composition
  id="my-video"
  component={MyComponent}
  durationInFrames={150}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{title: 'Hello', color: '#0b84ff'}}
/>;

// Avoid hiding static metadata behind helpers or variables.
const defaultProps = {title: 'Hello', color: '#0b84ff'};
const calculateMetadata = () => {
  return {durationInFrames: 150, fps: 30, width: 1920, height: 1080};
};

<Composition
  id="my-video"
  component={MyComponent}
  calculateMetadata={calculateMetadata}
  defaultProps={defaultProps}
/>;
```

Use `calculateMetadata()` when metadata depends on dynamic input props, fetched
data, or asset metadata.

## Effects

Keep editable effect parameters inline in the effect call and keep the effect
array shape unconditional. If an effect parameter is animated, write it as an
inline `interpolate()` call in the effect call.

```tsx
<CanvasImage
  src={src}
  width={1280}
  height={720}
  effects={[
    radialProgressiveBlur({
      center: [0.5, 0.5],
      width: 1.2,
      height: 0.8,
      start: 0.2,
      rotation: interpolate(frame, [0, 120], [0, 180]),
    }),
  ]}
/>;
```

Avoid hidden parameters and conditional effect arrays:

```tsx
const center = [0.5, 0.5] as const;
const rotation = frame * 1.5;

<CanvasImage
  src={src}
  width={1280}
  height={720}
  effects={enabled
    ? [
        radialProgressiveBlur({
          center,
          rotation,
        }),
      ]
    : []}
/>;
```

Render separate elements if one version should have effects and another should
not.

## Custom Interactive Components

Use `Interactive.withSchema()` when a custom component should be selectable in
the Studio timeline and expose editable props. It is available from Remotion
`4.0.479`.

### Create A Schema

An `InteractivitySchema` describes which props Studio may edit.

Use `Interactive.baseSchema` for props inherited from `<Sequence>`, such as
`from`, `trimBefore`, `durationInFrames`, `freeze`, `hidden`, `name`, and
`showInTimeline`.

Use `Interactive.transformSchema` if your component accepts a `style` prop and
applies it to the rendered element.

Use `Interactive.premountSchema` if your component forwards `premountFor`,
`postmountFor`, `styleWhilePremounted`, and `styleWhilePostmounted` to a
`<Sequence>` with `layout="absolute-fill"`.

```tsx
import type React from 'react';
import {
  Interactive,
  type InteractiveBaseProps,
  type InteractiveTransformProps,
  type InteractivitySchema,
} from 'remotion';

type BadgeProps = InteractiveBaseProps &
  InteractiveTransformProps & {
    readonly children?: React.ReactNode;
    readonly color?: string;
    readonly padding?: number;
  };

const badgeSchema = {
  ...Interactive.baseSchema,
  color: {
    type: 'color',
    default: '#0b84ff',
    description: 'Color',
  },
  padding: {
    type: 'number',
    min: 0,
    step: 1,
    default: 16,
    description: 'Padding',
    hiddenFromList: false,
  },
  ...Interactive.transformSchema,
} as const satisfies InteractivitySchema;
```

### Forward Controls

The inner component receives a `controls` prop from `Interactive.withSchema()`.
Forward it to the `<Sequence>` that represents your component in the timeline.
The exported component should not expose `controls` as a public prop.

Pass `outlineRef` when using `<Sequence layout="none">` so Studio can draw an
outline around the rendered element.

```tsx
import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {
  Interactive,
  Sequence,
  type InteractiveBaseProps,
  type InteractiveTransformProps,
  type InteractivitySchema,
  type SequenceControls,
} from 'remotion';

type BadgeProps = InteractiveBaseProps &
  InteractiveTransformProps & {
    readonly children?: React.ReactNode;
    readonly color?: string;
    readonly padding?: number;
  };

const badgeSchema = {
  ...Interactive.baseSchema,
  color: {
    type: 'color',
    default: '#0b84ff',
    description: 'Color',
  },
  padding: {
    type: 'number',
    min: 0,
    step: 1,
    default: 16,
    description: 'Padding',
    hiddenFromList: false,
  },
  ...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const BadgeInner = forwardRef<
  HTMLDivElement,
  BadgeProps & {
    readonly controls: SequenceControls | undefined;
  }
>(
  (
    {
      children,
      color = '#0b84ff',
      padding = 16,
      style,
      name,
      controls,
      ...sequenceProps
    },
    ref,
  ) => {
    const outlineRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

    return (
      <Sequence
        layout="none"
        {...sequenceProps}
        name={name ?? '<Badge>'}
        controls={controls}
        outlineRef={outlineRef}
      >
        <div
          ref={outlineRef}
          style={{
            ...style,
            display: 'inline-flex',
            borderRadius: 999,
            backgroundColor: color,
            color: 'white',
            fontWeight: 700,
            padding,
          }}
        >
          {children}
        </div>
      </Sequence>
    );
  },
);

export const Badge = Interactive.withSchema({
  Component: BadgeInner,
  componentName: '<Badge>',
  componentIdentity: 'com.example.Badge',
  schema: badgeSchema,
  supportsEffects: false,
});
```

Use a stable `componentIdentity` so saved Studio edits can be associated with
the component across reloads and code changes.

### Use The Component

```tsx
import {AbsoluteFill} from 'remotion';
import {Badge} from './Badge';

export const MyComp = () => {
  return (
    <AbsoluteFill>
      <Badge
        from={30}
        durationInFrames={90}
        color="#ff5c7a"
        style={{translate: '120px 80px'}}
      >
        Sale
      </Badge>
    </AbsoluteFill>
  );
};
```

The component now has a timeline row, inherits common `<Sequence>` props, and
exposes `color`, `padding`, and transform controls in Studio.
