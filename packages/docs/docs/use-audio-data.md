---
title: useAudioData()
id: use-audio-data
---

_Part of the `@remotion/media-utils`_ package of helper functions.

This convienience function wraps the [`getAudioData()`](/docs/get-audio-data) function into a hook and does 3 things:

- Keeps the audio data in a state
- Wraps the function in a [`delayRender()` / `continueRender()`](/docs/data-fetching) pattern.
- Handles the case where the component gets unmounted while the fetching is in progress and a React error is thrown.

Using this function, you can elegantly render a component based on audio properties, for example together with the [`visualizeAudio()`](/docs/visualize-audio) function.

## Arguments

### `src`

A string pointing to an audio asset.

## Return value

`AudioData | null` - An object containing audio data (see documentation of [`getAudioData()`](/docs/get-audio-data)) or `null` if the data has not been loaded.

## Example

```tsx twoslash
import { Audio } from "remotion";
// ---cut---
import { useAudioData } from "@remotion/media-utils";
import music from "./music.mp3";

export const MyComponent: React.FC = () => {
  const audioData = useAudioData(music);

  if (!audioData) {
    return null;
  }

  return <div>This file has a {audioData.sampleRate} sampleRate.</div>;
};
```

## See also

- [`getAudioData()`](/docs/get-audio-data)
- [`visualizeAudio()`](/docs/visualize-audio)
- [Audio visualization](/docs/audio-visualization)
