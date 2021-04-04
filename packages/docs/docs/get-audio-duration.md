---
title: getAudioDuration()
id: get-audio-duration
---

:::warning
This function is part of Remotion 2.0 which is not yet released. The information on this page might not yet accurately reflect the current state of Remotions API.
:::warning

_Part of the `@remotion/media-utils`_ package of helper functions.

Gets the duration in seconds of an audio source. Remotion will create an invisible `<audio>` tag, load the audio and return the duration.

## Arguments

### `src`

A string pointing to an audio asset

## Return value

`Promise<number>` - the duration of the audio file.

## Example

```tsx
import {getAudioDuration} from '@remotion/media-utils';
import music from './music.mp3';

await getAudioDuration(music); // 127.452
await getAudioDuration('https://example.com/remote-audio.aac'); // 50.24
```
