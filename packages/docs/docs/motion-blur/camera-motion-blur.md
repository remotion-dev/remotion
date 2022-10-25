---
title: "<CameraMotionBlur>"
slug: camera-motion-blur
---

import { CameraMotionBlurExample } from "../../components/CameraMotionBlurExample/CameraMotionBlurExample";

import {TableOfContents} from '../../components/TableOfContents/motion-blur';

```twoslash include example
const BlueSquare: React.FC = () => <div></div>
// - BlueSquare
```

TODO

For this technique to work, the children must be absolutely positioned so many layers can be created without influencing the layout.  
You can use the [`<AbsoluteFill>`](/docs/absolute-fill) component to absolutely position content.

## API

Wrap your content in `<CameraMotionBlur>` and optionally add the following props in addition.

### `iterations (optional)`

TODO

### `shutterAngle (optional)`

TODO

## Example usage

```tsx twoslash
// @include: example-BlueSquare
// ---cut---
import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill } from "remotion";

export const MyComposition = () => {
  return (
    <CameraMotionBlur>
      <AbsoluteFill
        style={{
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <BlueSquare />
      </AbsoluteFill>
    </CameraMotionBlur>
  );
};
```

## Demo

<CameraMotionBlurExample />

## Functions

<TableOfContents />

## Credits

TODO

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/motion-blur/src/CameraMotionBlur.tsx)
