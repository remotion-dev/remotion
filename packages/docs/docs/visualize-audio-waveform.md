---
title: visualizeAudioWaveform()
id: visualize-audio-waveform
---

import { AudioWaveFormExample } from "../components/AudioWaveformExamples.tsx";

_Part of the `@remotion/media-utils`_ package of helper functions.

This function takes in `AudioData` (preferrably fetched by the [`useAudioData()`](/docs/use-audio-data) hook) and processes it in a way that makes visualizing the audio waveform that is playing at the current frame easy.

```tsx twoslash
import {
  createSmoothSvgPath,
  useAudioData,
  visualizeAudioWaveform,
  AudioData,
} from "@remotion/media-utils";
import React from "react";
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig } from "remotion";
import voice from "./voice-short.mp3";

const frame = useCurrentFrame();
const audioData = useAudioData(voice) as AudioData;
const { fps } = useVideoConfig();

// ---cut---
const waveform = visualizeAudioWaveform({
  fps,
  frame,
  audioData,
  numberOfSamples: 16,
  windowInSeconds: 1 / fps,
});
```

See [Examples](#examples) below.

:::info
This function is suitable for visualizing voice. For visualizing music, use [`visualizeAudio()`](/docs/visualize-audio)
:::

## Arguments

The only argument for this function is an object containing the following values:

### `audioData`

`AudioData`

An object containing audio data. You can fetch this object using [`useAudioData()`](/docs/use-audio-data) or [`getAudioData()`](/docs/get-audio-data).

### `frame`

`number`

The time of the track that you want to get the audio information for. The `frame` always refers to the position in the audio track - if you have shifted or trimmed the audio in your timeline, the frame returned by `useCurrentFrame` must also be tweaked before you pass it into this function.

### `fps`

`number`

The frame rate of the composition. This helps the function understand the meaning of the `frame` input.

### `numberOfSamples`

`number`

Must be a power of two, such as `32`, `64`, `128`, etc. This parameter controls the length of the output array. A lower number will simplify the spectrum and is useful if you want to animate elements roughly based on the level of lows, mids and highs. A higher number will give the spectrum in more detail, which is useful for displaying a bar chart or waveform-style visualization of the audio.

### `windowInSeconds`

`number`

Time in seconds (can be float) which represents the duration for which you want to see the audio waveform. Example: Your video has an `fps` of 30, and you pass 15 as the `frame` on `visualizeAudioWaveform` and 0.25 as `windowInSeconds` then output will have audio waveform data from (15/30) - .125 = 0.375 sec to (15/30) +0.125 = 0.625 sec.

## Return value

`number[]`

An array of values describing the amplitude of each frequency range. Each value is between 0 and 1. The array is of length defined by the `numberOfSamples` parameter.

## Examples

### Basic example

```tsx twoslash
import {
  createSmoothSvgPath,
  useAudioData,
  visualizeAudioWaveform,
} from "@remotion/media-utils";
import React from "react";
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig } from "remotion";
import voice from "./voice-short.mp3";

const BaseExample: React.FC = () => {
  const frame = useCurrentFrame();
  const audioDataVoice = useAudioData(voice);
  const { width, height, fps } = useVideoConfig();

  if (!audioDataVoice) {
    return null;
  }

  const waveform = visualizeAudioWaveform({
    fps,
    frame,
    audioData: audioDataVoice,
    numberOfSamples: 32,
    windowInSeconds: 1 / fps,
  });

  const p = createSmoothSvgPath(
    waveform.map((x, i) => {
      return [
        (i / (waveform.length - 1)) * width,
        (x - 0.5) * 300 + height / 2,
      ];
    })
  );

  return (
    <div style={{ flex: 1 }}>
      <Audio src={voice} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <svg
          style={{ backgroundColor: " #0B84F3" }}
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
        >
          <path stroke="white" fill="none" strokeWidth={10} d={p as string} />
        </svg>
      </AbsoluteFill>
    </div>
  );
};
```

<AudioWaveFormExample type="base" />
<br/>

### Sliding effect

By increasing the `windowInSeconds` by tenfold, the audiogram starts moving to the right:

```tsx twoslash {6}
import {
  createSmoothSvgPath,
  useAudioData,
  visualizeAudioWaveform,
  AudioData,
} from "@remotion/media-utils";
import React from "react";
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig } from "remotion";
import voice from "./voice-short.mp3";

const frame = useCurrentFrame();
const audioDataVoice = useAudioData(voice) as AudioData;
const { fps } = useVideoConfig();

// ---cut---
const waveform = visualizeAudioWaveform({
  fps,
  frame,
  audioData: audioDataVoice,
  numberOfSamples: 32,
  windowInSeconds: 10 / fps,
});
```

<AudioWaveFormExample type="moving" />
<br/>

### Posterizing

By only calculating the waveform every third frame, we make the waveform calmer and generate a cool effect:

```tsx twoslash {3}
import {
  createSmoothSvgPath,
  useAudioData,
  visualizeAudioWaveform,
  AudioData,
} from "@remotion/media-utils";
import React from "react";
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig } from "remotion";
import voice from "./voice-short.mp3";

const frame = useCurrentFrame();
const audioDataVoice = useAudioData(voice) as AudioData;
const { fps } = useVideoConfig();

// ---cut---
const waveform = visualizeAudioWaveform({
  fps,
  frame: Math.round(frame / 3) * 3,
  audioData: audioDataVoice,
  numberOfSamples: 32,
  windowInSeconds: 10 / fps,
});
```

<AudioWaveFormExample type="posterized" />

## See also

- [Audio visualization](/docs/audio-visualization)
- [`useAudioData()`](/docs/use-audio-data)
- [`getAudioData()`](/docs/get-audio-data)
- [`<Audio/>`](/docs/audio)
- [Using audio](/docs/using-audio)
