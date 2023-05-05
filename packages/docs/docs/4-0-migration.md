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

The CLI configuration file has been moved out from the core Remotion package to `@remotion/cli/config`. Update your imports like this:

```diff
- import {Config} from 'remotion';
+ import {Config} from '@remotion/cli/config';
```

TODO: Old config syntax has been removed

## Dropped support for Lambda `architecture`

When deploying a Lambda, you were previously able to choose between the `arm64` and `x86_64` architecture.  
From v4.0 on, only `arm64` is supported. It should be faster, cheaper and not have any different behavior than `x86_64`.

**How to upgrade**:

- Remove the `architecture` option from `estimatePrice()` and `deployFunction()`.

## Rich timeline removed

The option to use the "Rich timeline" has been removed due to performance problems.  
The timeline is now always in simple mode, but supports more timeline layers at once.

## ProRes videos now export uncompressed audio by default

Previously, the `aac` audio codec was the default for ProRes exports. The default is now `pcm_s16le` which stands for uncompressed 16-bit low-endian PCM audio.  
This change was made since users export ProRes mainly for getting high-quality footage to be further used in video editing programs.

## Renamed `quality` option to `jpegQuality`

To clarify the meaning of this option, it is now universally called "JPEG Quality". Adjust the following options:

- [`npx remotion render`](/docs/cli/render): Use `--jpeg-quality` insted of `--quality`
- [`npx remotion still`](/docs/cli/still): Use `--jpeg-quality` insted of `--quality`
- [`npx remotion benchmark`](/docs/cli/benchmark): Use `--jpeg-quality` insted of `--quality`
- [`npx remotion lambda render`](/docs/lambda/cli/render): Use `--jpeg-quality` insted of `--quality`
- [`npx remotion lambda still`](/docs/lambda/cli/still): Use `--jpeg-quality` insted of `--quality`
- [`renderFrames()`](/docs/renderer/render-frames): Use `jpegQuality` instead of `quality`
- [`renderMedia()`](/docs/renderer/render-media): Use `jpegQuality` instead of `quality`
- [`renderStill()`](/docs/renderer/render-still): Use `jpegQuality` instead of `quality`
- [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda): Use `jpegQuality` instead of `quality`
- [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda): Use `jpegQuality` instead of `quality`

## No more FFmpeg install, `ffmpegExecutable` option removed

FFmpeg is now baked into the `@remotion/renderer` package. Therefore, the `ffmpegExecutable` and `ffprobeExecutable` options have been removed.

Furthermore, the `npx remotion install ffmpeg` and `npx remotion install ffprobe` commands no longer exist.

**How to upgrade:**

- Remove the `ffmpegExecutable` option from [`renderMedia()`](/docs/renderer/render-media), [`renderStill()`](/docs/renderer/render-still), [`getCompositions()`](/docs/renderer/get-compositions), [`renderFrames()`](/docs/renderer/render-frames) and [`stitchFramesToVideo()`](/docs/renderer/stitch-frames-to-video) calls.
- Remove the `ffprobeExecutable` option from [`renderMedia()`](/docs/renderer/render-media), [`renderStill()`](/docs/renderer/render-still), [`getCompositions()`](/docs/renderer/get-compositions), [`renderFrames()`](/docs/renderer/render-frames) and [`stitchFramesToVideo()`](/docs/renderer/stitch-frames-to-video) calls.
- Remove all calls to [`ensureFfmpeg()`](/docs/renderer/ensure-ffmpeg).
- Remove all calls to [`ensureFfprobe()`](/docs/renderer/ensure-ffprobe).
- Remove the `--ffmpeg-executable` flag from [`npx remotion render`](/docs/cli/render), [`npx remotion still`](/docs/cli/still) and [`npx remotion benchmark`](/docs/cli/benchmark)
- Remove the `--ffprobe-executable` flag from [`npx remotion render`](/docs/cli/render), [`npx remotion still`](/docs/cli/still) and [`npx remotion benchmark`](/docs/cli/benchmark)
- Don't use the [`npx remotion install`](/docs/cli/install) command anymore

## Added `npx remotion ffmpeg` and `npx remotion ffprobe`

Since FFmpeg and FFprobe no longer have to be installed, the `ffmpeg` and `ffprobe` commands might also not be in your environment anymore. In order to still be able to use some of FFmpeg's handy commands, we introduced [`npx remotion ffmpeg`](/docs/cli/ffmpeg) and [`npx remotion ffprobe`](/docs/cli/ffprobe).
Note that in order to keep the binary size small, those FFmpeg binaries only understand the codecs that Remotion itself supports: H.264, H.265, VP8, VP9 and ProRes.

A binary from the 6.0 release line of FFmpeg is used.

## Moved `onSlowestFrames` API

In V3, `onSlowestFrames` has been a callback function that you could pass to `renderMedia()`.  
In V4, this data has been moved to the [return value](/docs/renderer/render-media#return-value).

## Separating `ImageFormat`

Previously, the `imageFormat` option would be used for both stills and videos. While for stills, PNG is often preferrable, for videos it is overall faster to use JPEG as a default. In Remotion 4.0, the image formats are being separated so you can set defaults for videos and stills separately.

- `Config.setImageFormat` got replaced by [`Config.setVideoImageFormat()`](/docs/cli#setvideoimageformat) and [`Config.setStillImageFormat()`](/docs/cli#setstillimageformat).
- The CLI option is still `--image-format` for all commands.
- The Node.JS API name is still `imageFormat`.
- The TypeScript type `ImageFormat` has been separated into `StillImageFormat` and `VideoImageFormat`.
- `StillImageFormat` now also supports `webp` and `pdf`!

## ImageFormat removed

The [@remotion/renderer](/docs/renderer) `ImageFormat` Type got replaced by the more specific Types `VideoImageFormat` and `StillImageFormat`.

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

- `webpackBundle` has been removed from `renderFrames()` and `renderMedia()` - rename it to `serveUrl` instead
- `parallelism` has been removed from `renderFrames()` and `renderMedia()` - rename it to `concurrency` instead.
- `config` has been removed from `renderFrames()` - rename it to `composition` instead.

## `onBucketEnsured` option has been removed

The `onBucketEnsured()` option of [`getOrCreateBucket()`](/docs/lambda/getorcreatebucket) has been removed because creating the bucket is the only operation of `getOrCreateBucket()`. Therefore, you can just await the function itself.

## `imageFormat` removed from `<OffthreadVideo>`

Until now, you could optionally pass the `imageFormat` prop into `<OffthreadVideo>`. This option was introduced in order to make transparent videos possible.

Now, you can instead use the optional `transparent` prop.

Due to this this change, the `OffthreadVideoImageFormat` type is no longer neccessary and has therefore been removed.

## `OffthreadVideoImageFormat` removed

## `<Img>` will cancel the render if the image cannot be loaded

Before, [`<Img>`](/docs/img) would only log to the console if an image cannot be loaded and inevitably lead to a timeout if the error is not handled.

If this happens now and the error is not handled, the render will be aborted and the error reported.

## `crf` is not allowed for GIFs anymore

Previously you were able to set a value for `crf` when rendering a GIF. This was a mistake and GIF does not support them.

## `staticFile()` URI-unsafe characters handling

Previously, [`staticFile()`](/docs/staticfile) did not handle URI-unsafe characters contained in the provided path:

```tsx title="Before v4"
staticFile("my-image#portrait.png"); //output: "my-image#portrait.png"
```

This could lead to problems, when unsafe characters such as `#`, `?` and `&` were part of the filename.

Now, [`staticFile()`](/docs/staticfile) encodes the filename using `encodeURIComponent`:

```tsx title="Since v4.0.0"
staticFile("my-image#portrait.png"); // "my-image%23portrait.png"
```

**How to upgrade:**

If you encoded the path by yourself until now, don't do so anymore to avoid double encoding.
