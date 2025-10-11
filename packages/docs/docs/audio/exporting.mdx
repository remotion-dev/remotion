---
image: /generated/articles-docs-audio-exporting.png
title: Exporting Audio
sidebar_label: Exporting Audio
id: exporting
crumb: 'Audio'
---

If you export your video from Remotion, the audio is automatically included.  
Additionally, this page shows you can export the audio only, or omit the audio, and how the export process works.

## Audio Only

Exporting as `mp3`, `aac` and `wav` is supported:

### Command Line

To render only the audio via CLI, specify an extension when exporting via CLI:

```sh
npx remotion render src/index.ts my-comp out/audio.mp3
```

or use the `--codec` flag to automatically choose a good output file name:

```sh
npx remotion render src/index.ts my-comp --codec=mp3
```

### `renderMedia()`

To render only the audio via the server-side rendering APIs, use [`renderMedia()`](/docs/renderer/render-media) and set the [`codec`](/docs/renderer/render-media#codec) to an audio codec.

```tsx twoslash title="render.js"
import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia} from '@remotion/renderer'; // The composition you want to render
import path from 'path';
const compositionId = 'HelloWorld';

// You only have to do this once, you can reuse the bundle.
const entry = './src/index';
console.log('Creating a Webpack bundle of the video');
const bundleLocation = await bundle(path.resolve(entry), () => undefined, {
  // If you have a Webpack override, make sure to add it here
  webpackOverride: (config) => config,
});

// Parametrize the video by passing arbitrary props to your component.
const inputProps = {
  foo: 'bar',
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
  codec: 'mp3',
  outputLocation,
  inputProps,
});
```

### `renderMediaOnLambda()`

To render only the audio via Lambda, use [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) and set the [`codec`](/docs/lambda/rendermediaonlambda#codec) to an audio codec and [`imageFormat`](/docs/lambda/rendermediaonlambda#imageformat) to `none`.

```tsx twoslash
import {renderMediaOnLambda} from '@remotion/lambda';
// ---cut---

const {bucketName, renderId} = await renderMediaOnLambda({
  region: 'us-east-1',
  functionName: 'remotion-render-bds9aab',
  composition: 'MyVideo',
  serveUrl: 'https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw',
  inputProps: {},
  codec: 'mp3',
  imageFormat: 'none',
});
```

### Lambda CLI

To render via the Lambda CLI, use the [`npx remotion lambda render`](/docs/lambda/cli/render) command and pass the [`--codec`](/docs/lambda/cli/render#--codec) flag:

```sh
npx remotion lambda render --codec=mp3 https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw my-comp
```

## Excluding audio

### Command Line

Pass `--muted` to not export audio.

```sh
npx remotion render --muted
```

### `renderMedia()`

Pass [`muted: true`](/docs/renderer/render-media#muted) to [`renderMedia()`](/docs/renderer/render-media) to mute a render.

```tsx twoslash title="render.js"
import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia} from '@remotion/renderer'; // The composition you want to render
import path from 'path';
const compositionId = 'HelloWorld';

// You only have to do this once, you can reuse the bundle.
const entry = './src/index';
console.log('Creating a Webpack bundle of the video');
const bundleLocation = await bundle(path.resolve(entry), () => undefined, {
  // If you have a Webpack override, make sure to add it here
  webpackOverride: (config) => config,
});

// Parametrize the video by passing arbitrary props to your component.
const inputProps = {
  foo: 'bar',
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
  codec: 'h264',
  muted: true,
  outputLocation,
  inputProps,
});
```

### `renderMediaOnLambda()`

Pass [`muted: true`](/docs/lambda/rendermediaonlambda#muted) to [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) to mute the render.

```tsx twoslash
import {renderMediaOnLambda} from '@remotion/lambda';
// ---cut---

const {bucketName, renderId} = await renderMediaOnLambda({
  region: 'us-east-1',
  functionName: 'remotion-render-bds9aab',
  composition: 'MyVideo',
  serveUrl: 'https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw',
  inputProps: {},
  codec: 'h264',
  muted: true,
});
```

### Lambda CLI

Pass [`--muted`](/docs/lambda/cli/render#--muted) to [`npx remotion lambda render`](/docs/lambda/cli/render) to mute a render when using the Lambda Command Line.

```sh
npx remotion lambda render --muted https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw my-comp
```
