---
image: /generated/articles-docs-transforms.png
id: transforms
title: Transforms
crumb: "The fundamentals"
---

import {Transforms} from '../components/DocsDark'
import {MuxVideo} from '../src/components/MuxVideo';
import {TransformsTutorial} from '../src/components/tutorials';

<TransformsTutorial />
Animation occurs when the visual properties of an element transform over time.  
Let's look at five common ways to transform an element.

Already familiar with how to apply CSS transforms in React? [Skip this page](/docs/animating-properties).

## The 5 basic transformations

<Transforms />

<p align="center" style={{
  fontStyle: "italic",
  fontSize: "0.9em",
  marginTop: 10
}}>From left to right: Opacity, Scale, Skew, Translate, Rotate</p>

### Opacity

The opacity determines how visible the element is. `0` means fully invisible, `1` means fully visible. Values inbetween will make the element semi-transparent, and elements underneath will be visible.

You can set the opacity of an element using the `opacity` property.

```tsx twoslash {6} title="MyComponent.tsx"
<div
  style={{
    height: 100,
    width: 100,
    backgroundColor: "red",
    opacity: 0.5,
  }}
/>
```

<Demo type="opacity" />

Values below `0` and above `1` are accepted, but have no further effect.

### Scale

The scale determines how big an element is. `1` is the natural size, `2` will make the element twice as tall and wide.  
Values below `1` will make the element smaller. `0` makes the element invisible. Values below `0` are accepted and will make the element bigger again, but mirrored.

You can set the scale of an element using the `transform` property.

```tsx twoslash {6} title="MyComponent.tsx"
<div
  style={{
    height: 100,
    width: 100,
    backgroundColor: "red",
    transform: `scale(0.5)`,
  }}
/>
```

<Demo type="scale" />

The difference to changing the size of the element using `height` and `width` is that using `scale()` will not change the layout of the other elements.

### Skew

Skewing an element will lead to a distorted appearance as if the the element has been stretched on two corners of the element. Skew takes an angle that can be specified using `rad` (radians) and `deg` (degrees).

You can set the skew of an element using the `transform` property.

See the explorer below to see how skewing affects an element.

```tsx twoslash {6} title="MyComponent.tsx"
<div
  style={{
    height: 100,
    width: 100,
    backgroundColor: "red",
    transform: `skew(20deg)`,
  }}
/>
```

<Demo type="skew" />

### Translate

Translating an element means moving it. A translation can be done on the X, Y or even Z axis. The transformation can be specified in `px`.

You can set the translation of an element using the `transform` property.

```tsx twoslash {6} title="MyComponent.tsx"
<div
  style={{
    height: 100,
    width: 100,
    backgroundColor: "red",
    transform: `translateX(100px)`,
  }}
/>
```

<Demo type="translate" />

As opposed to changing the position of an element using `margin-top` and `margin-left`, using `translate()` will not change the position of the other elements.

### Rotate

By rotating an element, you can make it appear as if it has been turned around its center. The rotation can be specified in `rad` (radians) or `deg` (degrees) and you can rotate an element around the Z axis (the default) but also around the X and Y axis.

You can set the translation of an element using the `transform` property.

```tsx twoslash {6} title="MyComponent.tsx"
<div
  style={{
    height: 100,
    width: 100,
    backgroundColor: "red",
    transform: `rotate(45deg)`, // the same as rotateZ(45deg)
  }}
/>
```

<Demo type="rotate" />

If you want to rotate an element around the X or Y axis, you should apply the [`perspective`](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective) property to the parent element.

If you don't want to rotate around the center, you can use the [`transform-origin`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin) property to change the origin of the rotation.

Note that when rotating SVG elements, the transform origin is the top left corner by default. You can get the same behavior as for the other elements by adding `style={{transformBox: 'fill-box', transformOrigin: 'center center'}}`.

## Multiple transformations

Oftentimes, you want to combine multiple transformations. If they use different CSS properties like `transform` and `opacity`, simply specify both properties in the `style` object.

If both transformations use the `transform` property, specify multiple transformations separated by a space.

```tsx twoslash {6} title="MyComponent.tsx"
<div
  style={{
    height: 100,
    width: 100,
    backgroundColor: "red",
    transform: `translateX(100px) scale(2)`,
  }}
/>
```

Note that the order matters. The transformations are applied in the order they are specified.

## Using the `makeTransform()` helper

Install [@remotion/animation-utils](/docs/animation-utils/) to [get a type-safe helper function](/docs/animation-utils/make-transform) to generate `transform` strings.

```tsx twoslash
import { makeTransform, rotate, translate } from "@remotion/animation-utils";

const transform = translate(50, 50);
// => "translate(50px, 50px)"

const multiTransform = makeTransform([rotate(45), translate(50, 50)]);
// => "rotate(45deg) translate(50px, 50px)"
```

## More ways to transform objects

These are just some of the basic transformations. Here are some more transformations that are possible:

- The height and width of a `<div>`
- The rounded edges of an element using `border-radius`
- The shadow of an element using `box-shadow`
- The color of something using `color` and [`interpolateColors()`](/docs/interpolate-colors)
- The evolution of a SVG path using [`evolvePath()`](/docs/paths/evolve-path)
- The weight and slant of a [dynamic font](https://twitter.com/JNYBGR/status/1598983409367683072)
- The stops of a `linear-gradient`
- The values of a CSS `filter()`
