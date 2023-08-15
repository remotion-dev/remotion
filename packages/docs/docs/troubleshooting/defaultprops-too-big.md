---
image: /generated/articles-docs-troubleshooting-defaultprops-too-big.png
id: defaultprops-too-big
sidebar_label: defaultProps too big
title: defaultProps too big - could not serialize
crumb: "Troubleshooting"
---

If you experience an error during rendering:

```
defaultProps too big - could not serialize - the defaultProps of composition with ID "[composition-id]" - the object that was passed to defaultProps was too big. Learn how to mitigate this error by visiting https://remotion.dev/docs/troubleshooting/serialize-defaultprops
```

It means the object that was passed to [`defaultProps`](/docs/composition#defaultprops) for the specified composition is too big that Chrome cannot serialize it into a string.

If you see this variant of the error:

```
defaultProps too big - Could not serialize - an object that was passed to defaultProps was too big. Learn how to mitigate this error by visiting https://remotion.dev/docs/troubleshooting/serialize-defaultprops
```

The [`defaultProps`](/docs/composition#defaultprops) is not too big, but the list of compositions as a whole is too big to serialize.

## Why this error occurs

Remotion is trying to gather a list of compositions using [`getCompositions()`](/docs/renderer/get-compositions), and is copying them from the headless browser into Node.JS. During this operation, the JavaScript object needs to be converted into a string. The upper limit for this is 256MB, however dependending on the machine Remotion runs on, the error may also occur on smaller payloads.

## How to fix the error

Avoid passing huge data payloads to `defaultProps`. Instead, derive the big data payload inside the component based on slim `defaultProps`. For example:

- Instead of passing a data URL or Buffer that represents an asset, pass a URL to the asset and fetch the asset from inside the composition
- Don't fetch an audio visualization using [`getAudioData()`](/docs/get-audio-data) and pass it as default props - instead, pass the URL of the audio asset and fetch the audio visualization inside the component.

Example:

```tsx twoslash title="❌ Avoid - big data chunk as defaultProps"
import { AudioData, getAudioData } from "@remotion/media-utils";
import { useEffect, useState } from "react";
import {
  cancelRender,
  Composition,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";

// MyComp.tsx
const MyComp: React.FC<{
  audioData: AudioData | null;
}> = ({ audioData }) => {
  return null;
};

// src/Root.tsx
const RemotionRoot = () => {
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    getAudioData(staticFile("audio.mp3"))
      .then((data) => {
        setAudioData(data);
        continueRender(handle);
      })
      .catch((e) => {
        cancelRender(e);
      });
  }, [handle]);

  return (
    <Composition
      id="my-comp"
      durationInFrames={90}
      width={1080}
      height={1080}
      fps={1080}
      component={MyComp}
      defaultProps={{
        audioData,
      }}
    />
  );
};
```

This can lead to problems because the `audioData` variable can become very big since it contains raw data about the waveform, and Remotion needs to serialize this data into a string, which is slow and can lead to this error. Instead, pass the audio URL and do the audio data fetching inside the component:

```tsx twoslash title="✅ Do - Fetch data inside composition"
import { getAudioData } from "@remotion/media-utils";
import { useEffect, useState } from "react";
import {
  cancelRender,
  Composition,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";

// MyComp.tsx
const MyComp: React.FC<{ src: string }> = ({ src }) => {
  const [audioData, setAudioData] = useState<any>(undefined);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    getAudioData(src)
      .then((data) => {
        setAudioData(data);
        continueRender(handle);
      })
      .catch((e) => {
        cancelRender(e);
      });
  }, [handle]);

  return null;
};

// src/Root.tsx
const RemotionRoot = () => {
  return (
    <Composition
      id="my-comp"
      durationInFrames={90}
      width={1080}
      height={1080}
      fps={1080}
      component={MyComp}
      defaultProps={{
        src: staticFile("audio.mp3"),
      }}
    />
  );
};
```

## See also

- [Parameterized rendering](/docs/parameterized-rendering)
- [`<Composition>`](/docs/composition)
