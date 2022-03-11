---
title: getAudioDuration()
id: get-audio-duration
---

_Part of the `@remotion/media-utils` package of helper functions._

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
import { useCallback, useEffect } from "react";
import { Audio, staticFile } from "remotion";
// ---cut---
import { getAudioDuration } from "@remotion/media-utils";
import music from "./music.mp3";

const MyComp: React.FC = () => {
  const getDuration = useCallback(async () => {
    const imported = await getAudioDuration(music); // 127.452
    const publicFile = await getAudioDuration(staticFile("voiceover.wav")); // 33.221
    const remote = await getAudioDuration(
      "https://example.com/remote-audio.aac"
    ); // 50.24
  }, []);

  useEffect(() => {
    getDuration();
  }, []);

  return null;
};
```
