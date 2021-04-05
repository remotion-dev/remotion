---
title: useAudioData()
id: use-audio-data
---

:::warning
This function is part of Remotion 2.0 which is not yet released. The information on this page might not yet accurately reflect the current state of Remotions API.
:::warning

_Part of the `@remotion/media-utils`_ package of helper functions.

This convienience function wraps the [`getAudioData()`](get-audio-data) function into a hook and does 3 things:

- Keeps the audio data in a state
- Wraps the function in a [`delayRender()` / `continueRender()`](data-fetching) pattern.
- Handles the case where the component gets unmounted while the fetching is in progress and a React error is thrown.

Using this function, you can elegantly render a component based on audio properties, for example together with the [`visualizeAudio()`](visalize-audio) function.

## Arguments

### `src`

A string pointing to an audio asset.

## Return value

`AudioData | null` - An object containing audio data (see documentation of [`getAudioData()`](get-audio-data)) or `null` if the data has not been loaded.

## Example

```tsx
import {useAudioData} from '@remotion/media-utils';
import music from './music.mp3'


export const MyComponent: React.FC = () => {
  const audioData = useAudioData(music);

  if (!audioData) {
    return null;
  }

  return (
    <div>This file has a {audioData.sampleRate} sampleRate.</div>
  );
}
```

## See also

- [`getAudioData()`](get-audio-data)
- [`visualizeAudio()`](visualize-audio)
- [Audio visualization](audio-visualization)
