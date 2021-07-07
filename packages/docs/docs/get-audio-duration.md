---
title: getAudioDuration()
id: get-audio-duration
---

_Part of the `@remotion/media-utils`_ package of helper functions.

Gets the duration in seconds of an audio source. Remotion will create an invisible `<audio>` tag, load the audio and return the duration.

## Arguments

### `src`

A string pointing to an audio asset

## Return value

`Promise<number>` - the duration of the audio file.

## Example

```tsx twoslash
// @module: ESNext
// @target: ESNext
import {Audio} from 'remotion'
// ---cut---
import {getAudioDuration} from '@remotion/media-utils'
import music from './music.mp3'

await getAudioDuration(music) // 127.452
await getAudioDuration('https://example.com/remote-audio.aac') // 50.24
```
