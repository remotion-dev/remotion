---
title: "<MotionBlur>"
---

import { MotionBlurExample } from "../../components/MotionBlurExample/MotionBlurExample";

```twoslash include example
const BlueSquare: React.FC = () => <div></div>
// - BlueSquare
```

Credits to [@UmungoBungo](https://github.com/UmungoBungo) for inventing this technique.

The motion blur is achieved by rendering the previous frame at a lower opacity multiple times to create a blur effect.

For this technique to work, the element must be wrapped in an [`<AbsoluteFill>`](https://remotion.dev/docs/absolute-fill) so the previous frames can be layered under the original.

Motion blur can be added to any element by wrapping it in `<MotionBlur>`:

## API

### `frameDelay`
The `frameDelay` parameter determines how many frames each layer is lagging behind.

### `opacity`
The `opacity` defines the highest opacity of a layer. The lowest opacity is 0.

### `iterations`
The `iterations` parameter defines how many layers are added together.


## Example usage

```tsx twoslash
// @include: example-BlueSquare
// ---cut---
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MotionBlur} from '@remotion/motion-blur';

export const MyComposition = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <MotionBlur opacity={1} frameDelay={0.1} iterations={50}>
        <BlueSquare />
      </MotionBlur>
    </AbsoluteFill>
  );
};
```
## Demo

<MotionBlurExample />

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/motion-blur/src/MotionBlur.tsx)