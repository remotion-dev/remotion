---
title: "<MotionBlur>"
slug: motion-blur
---

import { MotionBlurExample } from "../../components/MotionBlurExample/MotionBlurExample";

import {TableOfContents} from '../../components/TableOfContents/motion-blur';

```twoslash include example
const BlueSquare: React.FC = () => <div></div>
// - BlueSquare
```

The `<MotionBlur>` component duplicates it's children and adds a time offset to each layer in order to create a motion blur effect.

For this technique to work, the children must be absolutely positioned so many layers can be created without influencing the layout.  
You can use the [`<AbsoluteFill>`](/docs/absolute-fill) component to absolutely position content.

## API

Wrap your content in `<MotionBlur>` and add the following props in addition.

### `layers`

How many layers are added below the content. Must be an integer

### `lagInFrames`

How many frames each layer is lagging behind the last one. Can also a floating point number.

### `blurOpacity`

The highest opacity of a layer. The lowest opacity is 0 and layers intbetween get interpolated.

## Example usage

```tsx twoslash
// @include: example-BlueSquare
// ---cut---
import { MotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill } from "remotion";

export const MyComposition = () => {
  return (
    <MotionBlur layers={50} lagInFrames={0.1} blurOpacity={1}>
      <AbsoluteFill
        style={{
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <BlueSquare />
      </AbsoluteFill>
    </MotionBlur>
  );
};
```

## Demo

<MotionBlurExample />

## Functions

<TableOfContents />

## Credits

This technique was invented and first implemented by [@UmungoBungo](https://github.com/UmungoBungo).

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/motion-blur/src/MotionBlur.tsx)
