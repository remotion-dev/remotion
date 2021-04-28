---
title: measureSpring()
id: measure-spring
---

Based on a spring configuration and the FPS, return how long in frame it takes for the spring to settle.


:::caution

Warning! The longer the animation, the more important the calculation.
Having a long animation and using `measureSpring()` may cause slowdowns

:::

```tsx
import {measureSpring, useCurrentFrame} from 'remotion';

const videoConfig = useVideoConfig();
  
const config = {
  damping: 10,
  mass: 0.7,
  stiffness: 40,
  overshootClamping: false,
}

measureSpring({
  config,
	fps: videoConfig.fps,
	from: 0,
	to: 1,
}); // 73
```

## Parameters

### from

The initial value of the animation.

### to

The end value of the animation. Note that depending on the parameters, spring animations may overshoot the target a bit, before they bounce back to their final target.

### fps

For how many frames per second the spring animation should be calculated. Better using the `fps` property of the return value of `useVideoConfig()` or the same value.

### config

An optional object that allows you to customize the physical properties of the animation.

#### mass

_Default:_ `1`

The weight of the spring. If you reduce the mass, the animation becomes faster!

#### Damping

_Default_: `10`

How hard the animation decelerates.

#### Stiffness

_Default_: `100`

Spring stiffness coefficient. Play with this one and it will affect how bouncy your animation is.

#### overshootClamping

_Default_: `false`

Determines whether the animation can shoot over the `to` value. If set to true, if the animation goes over `to`, it will just return the value of `to`.

## See also

- [useVideoConfig()](/docs/use-video-config)
