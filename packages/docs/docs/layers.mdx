---
image: /generated/articles-docs-layers.png
id: layers
title: Layers
crumb: 'Designing videos'
---

Unlike normal websites, a video has fixed dimensions. That means, it is okay to use `position: "absolute"`!

In Remotion, you often want to "layer" elements on top of each other.  
This is a common pattern in video editors, and in Photoshop.

An easy way to do it is using the [`<AbsoluteFill>`](/docs/absolute-fill) component:

```tsx twoslash title="MyComp.tsx"
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

export const MyComp: React.FC = () => {
  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Img src={staticFile('bg.png')} />
      </AbsoluteFill>
      <AbsoluteFill>
        <h1>This text appears on top of the video!</h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

This will render the text on top of the image.

If you want to only show an element for a certain duration, you can use a [`<Sequence>`](/docs/sequence) component, which by default is also absolutely positioned.

```tsx twoslash title="MyComp.tsx"
import React from 'react';
import {AbsoluteFill, Img, staticFile, Sequence} from 'remotion';

export const MyComp: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence>
        <Img src={staticFile('bg.png')} />
      </Sequence>
      <Sequence from={60} durationInFrames={40}>
        <h1>This text appears after 60 frames!</h1>
      </Sequence>
    </AbsoluteFill>
  );
};
```

The lower the absolutely positioned element is in the tree, the higher it will be in the layer stack.  
If you are aware of this behavior, you can use it to your advantage and avoid using `z-index` in most cases.

## See also

- [`<AbsoluteFill>`](/docs/absolute-fill)
- [`<Sequence>`](/docs/sequence)
- [Build a timeline-based video editor](/docs/building-a-timeline)
