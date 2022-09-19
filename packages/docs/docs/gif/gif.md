---
slug: gif/gif
sidebar_label: "<Gif>"
title: "<Gif>"
---

_Part of the [`@remotion/gif`](/docs/gif) package_

Displays a GIF that synchronizes with Remotions [`useCurrentFrame()`](/docs/use-current-frame).

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
import { staticFile } from "remotion";
// ---cut---
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import music from "./music.mp3";

const MyComp: React.FC = () => {
  const getDuration = useCallback(async () => {
    const imported = await getAudioDurationInSeconds(music); // 127.452
    const publicFile = await getAudioDurationInSeconds(
      staticFile("voiceover.wav")
    ); // 33.221
    const remote = await getAudioDurationInSeconds(
      "https://example.com/remote-audio.aac"
    ); // 50.24
  }, []);

  useEffect(() => {
    getDuration();
  }, []);

  return null;
};
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/gif/src/get-gif-duration-in-seconds.ts)
