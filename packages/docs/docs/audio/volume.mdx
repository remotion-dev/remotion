---
image: /generated/articles-docs-audio-volume.png
title: Controlling Volume
sidebar_label: Controlling Volume
id: volume
crumb: 'Audio'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

You can use the [`volume`](/docs/html5-audio#volume) prop to control the volume.

The simplest way is to pass a number between `0` and `1`.

```tsx twoslash {7} title="MyComp.tsx"
import {Html5Audio, staticFile, AbsoluteFill} from 'remotion';

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <div>Hello World!</div>
      <Html5Audio src={staticFile('audio.mp3')} volume={0.5} />
    </AbsoluteFill>
  );
};
```

## Changing volume over time

You can also change volume over time by passing in a function that takes a frame number and returns the volume.

```tsx twoslash {8}
import {AbsoluteFill, Html5Audio, interpolate, staticFile, useVideoConfig} from 'remotion';

export const MyComposition = () => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      <Html5Audio src={staticFile('audio.mp3')} volume={(f) => interpolate(f, [0, 1 * fps], [0, 1], {extrapolateLeft: 'clamp'})} />
    </AbsoluteFill>
  );
};
```

In this example we are using the [`interpolate()`](/docs/interpolate) function to fade the audio in over 1 second.

Note that because values below 0 are not allowed, we need to set the [`extrapolateLeft: 'clamp'`](/docs/interpolate#extrapolateleft) option to ensure no negative values.

Inside the callback function, the value of `f` starts always `0` when the audio begins to play.  
It is not the same as the value of [`useCurrentFrame()`](/docs/use-current-frame).

Prefer using a callback function if the volume is changing. This will enable Remotion to draw a volume curve in the [Studio](/docs/studio) and is more performant.

## Limitations<AvailableFrom v="4.0.306" />

By default, you'll face 2 limitations by default regarding volume:

<div>
<div><Step>1</Step> It is not possible to set the volume to a value higher than 1.</div>
<div><Step>2</Step> On iOS Safari, the volume will be set to 1.</div>
</div><br/>
You can work around these limitations by enabling the Web Audio API for your [`<Html5Audio>`](/docs/html5-audio#usewebaudioapi), [`<Html5Video>`](/docs/html5-video#usewebaudioapi) and [`<OffthreadVideo>`](/docs/offthreadvideo#usewebaudioapi) tags.

```tsx twoslash
import {Html5Audio, staticFile, AbsoluteFill} from 'remotion';
// ---cut---

<Html5Audio src="https://remotion.media/audio.wav" volume={2} useWebAudioApi crossOrigin="anonymous" />;
```

However, this comes with two caveats:

<div>
  <div>
    <Step error>1</Step> You must set the `crossOrigin` prop to `anonymous` and the audio must support CORS.
  </div>
  <div>
    <Step error>2</Step> On Safari, you cannot combine it with [`playbackRate`](/docs/html5-audio#playbackrate). If you do, the volume will be ignored.
  </div>
</div>
<br />
