---
image: /generated/articles-docs-player-scaling.png
id: scaling
title: 'Sizing'
crumb: '@remotion/player'
---

The following algorithm is used for calculating the size of the Player:

<Step>1</Step> By default, the Player is as big as the composition height,
defined by the <code>compositionHeight</code> and <code>compositionWidth</code> props. <br />
<Step>2</Step> If <code>height</code> and <code>width</code> is defined using
the <code>style</code> property, the player will assume the dimensions you have
passed. <br />
<Step>3</Step> If a <code>height</code> is passed using the <code>style</code> property,
the player will assume that height, and calculate the width based on the aspect
ratio of the video. <br />
<Step>4</Step> If <code>width</code> is passed using the <code>style</code> property,
the player will assume that width and calculate the height based on the aspect
ration of the video. <br />
<br />

:::note
Before v3.3.43, if case <InlineStep>3</InlineStep> or <InlineStep>4</InlineStep> happened, a layout shift would occur during mounting because the element was measured. Using a newer version of Remotion will fix this, because it uses the `aspect-ratio` CSS property.
:::

## Full width

By setting the following style:

```tsx
style={{ width: "100%" }}
```

The video will scale to the full width of the parent container, while the height will be calculated based on the aspect ratio of the video.

## Fitting to a container

This is how you can make the Player fill out a container but keep the aspect ratio of the video:

<video playsInline src="/img/fullscreen.mp4" autoPlay loop muted />
<br />

```tsx twoslash title="Canvas.tsx"
import {Player} from '@remotion/player';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const MyComp: React.FC = () => {
  return <AbsoluteFill style={{backgroundColor: 'black'}} />;
};

export const FullscreenPlayer = () => {
  const compositionWidth = 300;
  const compositionHeight = 200;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'gray',
        // Any container with "position: relative" will work
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          margin: 'auto',
          aspectRatio: `${compositionWidth} / ${compositionHeight}`,
          maxHeight: '100%',
          maxWidth: '100%',
        }}
      >
        <Player
          controls
          component={MyComp}
          compositionWidth={compositionWidth}
          compositionHeight={compositionHeight}
          durationInFrames={200}
          fps={30}
          style={{
            width: '100%',
          }}
        />
      </div>
    </div>
  );
};
```
