---
id: spring
title: spring()
---

Delightful and smooth animation primitive. Calculates a position based on physical parameters, start and end value, and time.

Example:

```tsx twoslash
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
// ---cut---
const frame = useCurrentFrame();
const videoConfig = useVideoConfig();

const value = spring({
  frame,
  from: 0,
  to: 1,
  fps: videoConfig.fps,
  config: {
    stiffness: 100,
  },
});
```

## Parameters

### frame

The current time value. Most of the time you want to pass in the return value of `useCurrentFrame`. The spring animation starts at frame 0, so if you would like to delay the animation, you can pass a different value like `frame - 20`.

### from

The initial value of the animation.

### to

The end value of the animation. Note that depending on the parameters, spring animations may overshoot the target a bit, before they bounce back to their final target.

### fps

For how many frames per second the spring animation should be calculated. This should always be the `fps` property of the return value of `useVideoConfig()`.

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

## YouTube video

Want to understand the different properties like `mass`, `stiffness`, `damping` etc.? We made a video trying to make sense of all the parameters!

Watch: **[The perfect spring animation](https://www.youtube.com/watch?v=GE8ZqrKqE5g)**

## Credit

This function was taken from [Reanimated 2](https://github.com/software-mansion/react-native-reanimated), which in itself was a huge inspiration for Remotion.

## See also

- [interpolate()](/docs/interpolate)
- [measureSpring()](/docs/measure-spring)
