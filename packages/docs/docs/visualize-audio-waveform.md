---
title: visualizeAudioWaveform()
id: visualize-audio-waveform
---

_Part of the `@remotion/media-utils`_ package of helper functions.

This function takes in `AudioData` (preferrably fetched by the [`useAudioData()`](/docs/use-audio-data) hook) and processes it in a way that makes visualizing the audio waveform that is playing at the current frame easy.

## Arguments

### `options`

The only argument for this function is an object containing the following values:

- `audioData`: `AudioData` - an object containing audio data. You can fetch this object using [`useAudioData()`](/docs/use-audio-data) or [`getAudioData()`](/docs/get-audio-data).

- `frame`: `number` - the time of the track that you want to get the audio information for. The `frame` always refers to the position in the audio track - if you have shifted or trimmed the audio in your timeline, the frame returned by `useCurrentFrame` must also be tweaked before you pass it into this function.

- `fps`: `number` - the frame rate of the composition. This helps the function understand the meaning of the `frame` input.

- `numberOfSamples`: `number` - must be a power of two, such as `32`, `64`, `128`, etc. This parameter controls the length of the output array. A lower number will simplify the spectrum and is useful if you want to animate elements roughly based on the level of lows, mids and highs. A higher number will give the spectrum in more detail, which is useful for displaying a bar chart or waveform-style visualization of the audio.

- `waveformDuration`: `number` - time in seconds (can be float) which represents the duration for which you want to see the audio waveform data with respect to frame. for example let's say if your video `fps` is 30, and you pass 15 as the `frame` on `visualizeAudioWaveform` and passed 0.25 as `waveformDuration` then output will have audio waveform data from (15/30) - .125 = 0.375 sec to (15/30) +0.125 = 0.625 sec.

## Return value

`number[]` - An array of values describing the amplitude of each frequency range. Each value is between 0 and 1. The array is of length defined by the `numberOfSamples` parameter.

## Example

In this example, we render a bar chart visualizing the audio spectrum of an audio file we imported using [`useAudioData()`](/docs/use-audio-data) and `visualizeAudio()`.

```tsx twoslash
import { Audio, useCurrentFrame, useVideoConfig } from "remotion";
import { useAudioData, visualizeAudioWaveform } from "@remotion/media-utils";
import music from "./music.mp3";

export const MyComponent: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const audioData = useAudioData(music);

  if (!audioData) {
    return null;
  }

  const visualization = visualizeAudioWaveform({
    fps,
    frame,
    audioData,
    numberOfSamples: 32,
    waveformDuration: 1/fps,
  });

  return (
    <div>
      <Audio src={music} />
      {visualization.map((v) => {
        return (
          <div
            style={{ width: 1000 * v, height: 15, backgroundColor: "blue" }}
          />
        );
      })}
    </div>
  );
};
```

## See also

- [Audio visualization](/docs/audio-visualization)
- [`useAudioData()`](/docs/use-audio-data)
- [`getAudioData()`](/docs/get-audio-data)
- [`<Audio/>`](/docs/audio)
- [Using audio](/docs/using-audio)

