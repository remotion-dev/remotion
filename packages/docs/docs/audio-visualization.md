---
title: Audio visualization
id: audio-visualization
crumb: "Techniques"
---

Using the audio visualization APIs in Remotion 2.0, you can create animations based on the frequency of the audio. This is often used to make graphics react to the volume or sound spectrum of the music.

## Import audio

You can import an audio file using an `import` statement:

```ts twoslash
import { Audio } from "remotion";
// ---cut---
import audio from "./audio.mp3";
```

`audio` will resolve to a string pointing to an audio file. You may also skip importing and use an `https://` URL to load audio from a remote location, if the audio is allowed to be loaded by the domains CORS policy.

## Render audio visualization

The `@remotion/media-utils` package provides helper functions for reading and processing audio. Using the [`getAudioData()`](/docs/get-audio-data) API you can read audio, and using the [`useAudioData()`](/docs/use-audio-data) helper hook you can load this audio data directly into your component.

Using the [`visualizeAudio()`](/docs/visualize-audio) API, you can get an audio spectrum for the current frame, with the `numberOfSamples` parameter being an option to control the amount of detail you need.

Refer to the documentation of the above mentioned functions to learn more.

```tsx twoslash
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { Audio, useCurrentFrame, useVideoConfig } from "remotion";
import music from "./music.mp3";

export const MyComponent: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const audioData = useAudioData(music);

  if (!audioData) {
    return null;
  }

  const visualization = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: 16,
  }); // [0.22, 0.1, 0.01, 0.01, 0.01, 0.02, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  // Render a bar chart for each frequency, the higher the amplitude,
  // the longer the bar
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

- [Using audio](/docs/using-audio)
- [`useAudioData()`](/docs/use-audio-data)
- [`visualizeAudio()`](/docs/visualize-audio)
