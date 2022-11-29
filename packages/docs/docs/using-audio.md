---
image: /generated/articles-docs-using-audio.png
title: Using audio
id: using-audio
crumb: "Techniques"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Import audio

[Put an audio file into the `public/` folder](/docs/assets) and use [`staticFile()`](/docs/staticfile) to reference it.  
Add an [`<Audio/>`](/docs/audio) tag to your [composition](/docs/terminology#composition) to add sound to it.

```tsx twoslash
import { AbsoluteFill, Audio, staticFile } from "remotion";

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio.mp3")} />
    </AbsoluteFill>
  );
};
```

The audio will play from the start, at full volume and full length, unless the composition is shorter.

You can also import remote audio by passing a URL: (`src="https://example.com/audio.mp3"`).

```tsx twoslash
import { AbsoluteFill, Audio } from "remotion";

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Audio src="https://example.com/audio.mp3" />
    </AbsoluteFill>
  );
};
```

You can mix multiple tracks together by adding more audio tags.

## Cutting or trimming the audio

You can use [`<Sequence />`](/docs/sequence) to cut and trim audio.

As a convenience, the `<Audio />` tag supports the `startFrom` and `endAt` props. In the following example, we assume that the [`fps`](/docs/composition#fps) of the composition is `30`.

By passing `startFrom={60}`, the playback starts immediately, but with the first 2 seconds of the audio trimmed away.  
By passing `endAt={120}`, any audio after the 4 second mark in the file will be trimmed away.

The audio will play the range from `00:02:00` to `00:04:00`, meaning the audio will play for 2 seconds.

```tsx twoslash {6}
import { AbsoluteFill, Audio, staticFile } from "remotion";

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio.mp3")} startFrom={60} endAt={120} />
    </AbsoluteFill>
  );
};
```

## Delaying audio

Use a `<Sequence>` with a positive `from` attribute to delay the audio from playing.
In the following example, the audio will start playing (from the beginning) after 100 frames.

```tsx twoslash {6-8}
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Sequence from={100}>
        <Audio src={staticFile("audio.mp3")} />
      </Sequence>
    </AbsoluteFill>
  );
};
```

## Controlling volume

You can use the [`volume`](/docs/audio#volume) prop to control the volume.

The simplest way is to pass a number between 0 and 1. `1` is the maximum volume and `0` mutes the audio.

```tsx twoslash {8}
import { Audio } from "remotion";
import audio from "./audio.mp3";

export const MyComposition = () => {
  return (
    <div>
      <div>Hello World!</div>
      <Audio src={audio} volume={0.5} />
    </div>
  );
};
```

You can also change volume over time by passing in a function that takes a frame number and returns the volume.

In this example we are using the [interpolate()](/docs/interpolate) function to fade the audio in over 30 frames. Note that because values below 0 are not allowed, we need to set the `extrapolateLeft: 'clamp'` option to ensure no negative values.

Inside the callback function, the first frame on which audio is being played is frame `0`, regardless of the value of `useCurrentFrame()`.

```tsx twoslash {8-10}
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Audio
        src={staticFile("audio.mp3")}
        volume={(f) =>
          interpolate(f, [0, 30], [0, 1], { extrapolateLeft: "clamp" })
        }
      />
    </AbsoluteFill>
  );
};
```

:::note
When using the [`<Player>`](/docs/player), note that Mobile Safari [does not support the `volume` property](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html#//apple_ref/doc/uid/TP40009523-CH5-SW11). The audio mix may not play as intended.
:::

## `muted` property

You may pass in the `muted` and it may change over time. When `muted` is true, audio will be omitted at that time. In the following example, we are muting the track between frame 40 and 60.

```tsx twoslash {8}
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";

export const MyComposition = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio.mp3")} muted={frame >= 40 && frame <= 60} />
    </AbsoluteFill>
  );
};
```

## Use audio from `<Video />` tags

Audio from [`<Video />`](/docs/video) tags are also included in the output. You may also use the `volume` and `muted` props in the same way.

## Controlling playback speed

_Available from v2.2_

You can use the `playbackRate` prop to control the speed of the audio. `1` is the default and means regular speed, `0.5` slows down the audio so it's twice as long and `2` speeds up the audio so it's twice as fast.

While Remotion doesn't limit the range of possible playback speeds, in development mode the [`HTMLMediaElement.playbackRate`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate) API is used which throws errors on extreme values. At the time of writing, Google Chrome throws an exception if the playback rate is below `0.0625` or above `16`.

## Audio visualization

You can obtain audio data and create visualizations based on it. See the page [Audio visualization](/docs/audio-visualization) for more info.

## Rendering audio only

Exporting as `mp3`, `aac` and `wav` is supported:

<Tabs
defaultValue="cli"
values={[
{ label: 'CLI', value: 'cli', },
{ label: 'renderMedia()', value: 'node', },
{ label: 'Lambda', value: 'lambda', },
]
}>
<TabItem value="cli">

To render only the audio via CLI, specify an extension when exporting via CLI:

```
npx remotion render src/index.ts my-comp out/audio.mp3
```

or use the `--codec` flag to automatically choose a good output file name:

```
npx remotion render src/index.ts my-comp --codec=mp3
```

  </TabItem>

  <TabItem value="node">

To render only the audio via Node.JS, use [`renderMedia()`](/docs/renderer/render-media) and set the [`codec`](/docs/renderer/render-media#codec) to an audio codec.

```tsx twoslash
// @module: ESNext
// @target: ESNext
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer"; // The composition you want to render
import path from "path";
const compositionId = "HelloWorld";

// You only have to do this once, you can reuse the bundle.
const entry = "./src/index";
console.log("Creating a Webpack bundle of the video");
const bundleLocation = await bundle(path.resolve(entry), () => undefined, {
  // If you have a Webpack override, make sure to add it here
  webpackOverride: (config) => config,
});

// Parametrize the video by passing arbitrary props to your component.
const inputProps = {
  foo: "bar",
};

// Extract all the compositions you have defined in your project
// from the webpack bundle.
const comps = await getCompositions(bundleLocation, {
  // You can pass custom input props that you can retrieve using getInputProps()
  // in the composition list. Use this if you want to dynamically set the duration or
  // dimensions of the video.
  inputProps,
});

// Select the composition you want to render.
const composition = comps.find((c) => c.id === compositionId);

// Ensure the composition exists
if (!composition) {
  throw new Error(`No composition with the ID ${compositionId} found.
  Review "${entry}" for the correct ID.`);
}
const outputLocation = `out/${compositionId}.mp4`;

// ---cut---
await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "mp3",
  outputLocation,
  inputProps,
});
```

  </TabItem>
    <TabItem value="lambda">

To render only the audio via Lambda, use [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) and set the [`codec`](/docs/lambda/rendermediaonlambda#codec) to an audio codec and [`imageFormat`](/docs/lambda/rendermediaonlambda#imageformat) to `none`.

```tsx twoslash
// @module: esnext
// @target: es2017
import { renderMediaOnLambda } from "@remotion/lambda";
// ---cut---

const { bucketName, renderId } = await renderMediaOnLambda({
  region: "us-east-1",
  functionName: "remotion-render-bds9aab",
  composition: "MyVideo",
  framesPerLambda: 20,
  serveUrl:
    "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw",
  inputProps: {},
  codec: "h264",
  imageFormat: "none",
  maxRetries: 1,
  privacy: "public",
});
```

To render via the Lambda CLI, use the [`npx remotion lambda render`](/docs/lambda/cli/render) command and pass the [`--codec`](/docs/lambda/cli/render#--codec) flag:

```
npx remotion lambda render --codec=mp3 https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw my-comp
```

  </TabItem>
</Tabs>

## See also

- [Importing assets](/docs/assets)
- [Audio visualization](/docs/audio-visualization)
- [`<Audio />`](/docs/audio) tag
