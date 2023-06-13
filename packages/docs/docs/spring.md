---
image: /generated/articles-docs-spring.png
id: spring
title: spring()
crumb: "API"
---

A physics-based animation primitive.

Example:

```tsx twoslash title="spring-example.ts"
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
// ---cut---
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const value = spring({
  frame,
  fps,
  config: {
    stiffness: 100,
  },
});
```

## Parameters

### `frame`

The current time value. Most of the time you want to pass in the return value of [`useCurrentFrame()`](/docs/use-current-frame). The spring animation starts at frame 0, so if you would like to delay the animation, you can pass a different value like `frame - 20`.

### `from`

_Default:_ `0`

The initial value of the animation.

### `to`

_Default:_ `1`

The end value of the animation. Note that depending on the parameters, spring animations may overshoot the target a bit, before they bounce back to their final target.

### `fps`

For how many frames per second the spring animation should be calculated. This should always be the `fps` property of the return value of [`useVideoConfig()`](/docs/use-video-config).

### `reverse`<AvailableFrom v="3.3.92" />

_Default:_ `false`

Render the animation in reverse. See: [Order or operations](#order-of-operations)

### `config`

An optional object that allows you to customize the physical properties of the animation.

#### mass

_Default:_ `1`

The weight of the spring. If you reduce the mass, the animation becomes faster!

#### damping

_Default_: `10`

How hard the animation decelerates.

#### stiffness

_Default_: `100`

Spring stiffness coefficient. Play with this one and it will affect how bouncy your animation is.

#### overshootClamping

_Default_: `false`

Determines whether the animation can shoot over the `to` value. If set to true, if the animation goes over `to`, it will just return the value of `to`.

### `durationInFrames`<AvailableFrom v="3.0.27" />

_optional_

Stretches the animation curve so it is exactly as long as you specify.

```tsx twoslash title="spring-example.ts"
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
// ---cut---
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const value = spring({
  frame,
  fps,
  config: {
    stiffness: 100,
  },
  durationInFrames: 40,
});
```

See also: [Order or operations](#order-of-operations)

### `durationRestThreshold`<AvailableFrom v="3.0.27" />

_optional_

How close the animation should be to the end in order to be considered finished for the calculation of the duration. Only has an effect if `durationInFrames` is also specified.

For example, if a `durationRestThreshold` of `0.001` is given, and the durationOfFrames is `30`, it means that after 30 frames, the spring has reached 99.9% (`1 - 0.001 = 0.999`) of it's distance to the end value.

### `delay`<AvailableFrom v="3.3.90" />

_optional_

How many frames to delay the animation for.

For example, if a `delay` of `25` is given frames 0-24 will return the initial value, and the animation will effectively start from frame 25. See also: [Order or operations](#order-of-operations)

## Order of operations

Here is the order of which the `durationInFrames`, `reverse` and `delay` operations are applied:

<Step>1</Step> First the spring animation is stretched to the duration that you pass using <a href="#durationinframes"><code>durationInFrames</code></a>, if you pass a duration.<br/>
<Step>2</Step> Then the animation is reversed if you pass <a href="#reverse-"><code>reverse: true</code></a>.<br/>
<Step>3</Step> Then the animation is delayed if you pass <a href="#delay-"><code>delay</code></a>.

## Credit

This function was taken from [Reanimated 2](https://github.com/software-mansion/react-native-reanimated), which in itself was a huge inspiration for Remotion.

## See also

- [Spring animation example](/docs/animating-properties#using-spring-animations)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/spring/index.ts)
- [interpolate()](/docs/interpolate)
- [measureSpring()](/docs/measure-spring)
