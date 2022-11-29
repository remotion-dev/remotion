---
id: spring
title: spring()
crumb: "API"
---

A physics-based animation primitive.

Example:

```tsx twoslash
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

### frame

The current time value. Most of the time you want to pass in the return value of [`useCurrentFrame()`](/docs/use-current-frame). The spring animation starts at frame 0, so if you would like to delay the animation, you can pass a different value like `frame - 20`.

### from

_Default:_ `0`

The initial value of the animation.

### to

_Default:_ `1`

The end value of the animation. Note that depending on the parameters, spring animations may overshoot the target a bit, before they bounce back to their final target.

### fps

For how many frames per second the spring animation should be calculated. This should always be the `fps` property of the return value of [`useVideoConfig()`](/docs/use-video-config).

### config

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

### durationInFrames

_Available from v3.0.27 - optional_

Stretches the animation curve so it is exactly as long as you specify.

```tsx twoslash
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

## `durationRestThreshold`

_Available from v3.0.27 - optional_

How close the animation should be to the end in order to be considered finished for the calculation of the duration. Only has an effect if `durationInFrames` is also specified.

For example, if a `durationRestThreshold` of `0.001` is given, and the durationOfFrames is `30`, it means that after 30 frames, the spring has reached 99.9% (`1 - 0.001 = 0.999`) of it's distance to the end value.

## YouTube video

Want to understand the different properties like `mass`, `stiffness`, `damping` etc.? We made a video trying to make sense of all the parameters!

Watch: **[The perfect spring animation](https://www.youtube.com/watch?v=GE8ZqrKqE5g)**

## Credit

This function was taken from [Reanimated 2](https://github.com/software-mansion/react-native-reanimated), which in itself was a huge inspiration for Remotion.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/spring/index.ts)
- [interpolate()](/docs/interpolate)
- [measureSpring()](/docs/measure-spring)
