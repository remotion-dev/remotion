---
image: /generated/articles-docs-4-0-migration.png
id: 4-0-migration
title: v4.0 Migration
crumb: "Version Upgrade"
---

When upgrading from Remotion 3 to Remotion 4, note the following changes and apply them to your project.

## How to upgrade

See the [changelog](https://remotion.dev/docs/changelog) to find the latest version.
Upgrade `remotion` and all packages starting with `@remotion` to the latest version, e.g. `4.0.0`:

```diff
- "remotion": "^3.3.43"
- "@remotion/bundler": "^3.3.43"
- "@remotion/eslint-config": "^3.3.43"
- "@remotion/eslint-plugin": "^3.3.43"
- "@remotion/cli": "^3.3.43"
- "@remotion/renderer": "^3.3.43"
+ "remotion": "4.0.0"
+ "@remotion/bundler": "4.0.0"
+ "@remotion/eslint-config": "4.0.0"
+ "@remotion/eslint-plugin": "4.0.0"
+ "@remotion/cli": "4.0.0"
+ "@remotion/renderer": "4.0.0"
```

Run `npm i `, `yarn` or `pnpm i` respectively afterwards.

## Config file changes

```diff
- import {Config} from 'remotion';
+ import {Config} from '@remotion/cli/config';
```

## Dropped support for Lambda `architecture`

When deploying a Lambda, you were previously able to choose between the `arm64` and `x86_64` architecture.  
From v4.0 on, only `arm64` is supported. It should be faster, cheaper and not have any different behavior than `x86_64`.

**How to upgrade**: Remove the `architecture` option from `estimatePrice()` and `deployFunction()`.

## Rich timeline removed

The option to use the "Rich timeline" has been removed due to performance problems.  
The timeline is now always in simple mode, but supports more timeline layers at once.

## ProRes videos now export uncompressed audio by default

Previously, the `aac` audio codec was the default for ProRes exports. The default is now `pcm_s16le` which stands for uncompressed 16-bit low-endian PCM audio.  
This change was made since users export ProRes mainly for getting high-quality footage to be further used in video editing programs.

## No more FFmpeg install, `ffmpegExecutable` option removed

## Moved `onSlowestFrames` API

In V3, `onSlowestFrames` has been a callback function that you could pass to `renderMedia()`.  
In V4, this API has been moved to the [return type](/docs/renderer/render-media#return-value).

## Removal of deprecated APIs

- `Config.setOutputFormat()` was deprecated in v1.4 and has now been removed. Use `setImageSequence()`, `setVideoImageFormat()` and `setCodec()` in combination instead.

- `downloadVideo()` alias has been removed, use [`downloadMedia()`](/docs/lambda/downloadmedia) with the same API instead.

- `<MotionBlur>` has been removed. Use [`<Trail>`](/docs/motion-blur/trail) instead.

- `getParts()` has been removed. Use [`getSubpaths()`](/docs/paths/get-subpaths) instead:

```tsx twoslash title="paths.ts"
import {
  getLength,
  getPointAtLength,
  getSubpaths,
  getTangentAtLength,
} from "@remotion/paths";

const path = "M 0 0 L 100 100";
const parts = getSubpaths(path[0]);
const length = getLength(parts[0]);
const start = getPointAtLength(parts[0], 0);
const end = getPointAtLength(parts[0], length);
const tangent = getTangentAtLength(parts[0], length / 2);
```

- `webpackBundle` has been removed - rename it to `serveUrl` instead
- `parallelism` has been removed - rename it to `concurrency` instead
