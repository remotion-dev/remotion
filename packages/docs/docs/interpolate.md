---
title: interpolate()
id: interpolate
---

Allows you to map a value to another using a concise syntax.

## Example

```tsx
import {useCurrentFrame, interpolate} from 'remotion'

const frame = useCurrentFrame() // 10
const opacity = interpolate(input, [0, 20], [0, 1]) // 0.5
```

## Params

1. The input value.
2. The range of values that you expect the input to assume.
3. The range of output values that you want the input to map to.
4. Options object.

## Options

### extrapolateLeft

_Default_: `extend`

What should happen if the input value is outside left the input range:

- `extend`: Interpolate nonetheless, even if outside output range.
- `clamp`: Return the closest value inside the range instead
- `identity`: Return the input value instead.

### extrapolateRight

_Default_: `extend`

Same as [extrapolateLeft](#extrapolateleft), except for values outside right the input range.

Example:

```tsx
interpolate(1.5, [0, 1], [0, 2], {extrapolateRight: 'extend'}) // 3
interpolate(1.5, [0, 1], [0, 2], {extrapolateRight: 'clamp'}) // 2
interpolate(1.5, [0, 1], [0, 2], {extrapolateRight: 'identity'}) // 1.5
```

### easing

_Default_: `(x) => x`

Function which allows you to customize the input, for example to apply a certain easing function.
By default, the input is left unmodified, resulting in a pure linear interpolation. [Read the documentation for the built-in easing functions](/docs/easing).

```tsx
import {interpolate, Easing} from 'remotion';

interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.bezier(0.8, 0.22, 0.96, 0.65),
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
})
```

## See also

- [Easing](/docs/easing)
- [spring()](/docs/spring)
