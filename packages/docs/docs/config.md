---
id: config
title: Configuration file
---

To configure Remotion, create a `remotion.config.ts` file in the root of your Remotion project.

You can control several behaviors of Remotion here.

```tsx
import {Config} from 'remotion';

Config.Rendering.Concurrency(8);
Config.Output.setPixelFormat('yuv444p');
Config.Output.setCodec('h265');
```

## Bundling

### overrideWebpackConfig()

Allows you to insert your custom Webpack config. [See the page about custom Webpack configs](/docs/webpack) for more information.

```tsx
Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
  // Return a new Webpack configuration
});
```

## Puppeteer

### setBrowserExecutable()

_Available from Version 1.5._

Set a custom Chrome or Chromium executable path. By default Remotion will try to find an existing version of Chrome on your system and if not found, it will download one. This flag is useful if you don't have Chrome installed in a standard location and you want to prevent downloading an additional browser or need [support for the H264 codec](/docs/video#codec-support).

```ts
Config.Puppeteer.setBrowserExecutable('/usr/bin/google-chrome-stable')
```

The [command line flag](/docs/cli) `--browser-executable` will take precedence over this option.

## Rendering

### setConcurrency()

Sets how many Puppeteer instances will work on rendering your video in parallel.
Default: `null`, meaning **half of the threads** available on your CPU.

```ts
Config.Rendering.setConcurrency(8)
```

The [command line flag](/docs/cli) `--concurrency` will take precedence over this option.

:::tip
Try to set your concurrency to `os.cpus().length` to all the threads available on your CPU for faster rendering. The drawback is that other parts of your system might slow down.
:::

### setImageFormat()

_Available from Version 1.4._

Determines which in which image format to render the frames. Either `jpeg` _(default since v1.1)_ or `png`. PNG is considerably slower, but supports transparency.

```tsx
Config.Rendering.setImageFormat('png')
```

The [command line flag](/docs/cli) `--image-format` will take precedence over this option.

### setFrameRange()

To render a still frame or a range of frames. Which can be helpful to generate humbnails and stills.

```tsx
Config.Rendering.setFrameRange(90); //to select only 90th frame
```

or

```tsx
Config.Rendering.setFrameRange('10-20'); //To select frames from 10 to 20
```

### setQuality()

The JPEG quality of each frame. Must be a number between 0 and 100. Will not work if you render PNG frames. [Default: 80](https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/headless/lib/browser/protocol/headless_handler.cc#L32).

```tsx
Config.Rendering.setQuality(90);
```

## Output

### setOverwriteOutput()

Set this to `true` to always overwrite Remotion outputs without asking.

```tsx
Config.Output.setOverwriteOutput(true)
```

The [command line flag](/docs/cli) `--overwrite` will take precedence over this option.

### setPixelFormat()

Controls the pixel format in FFMPEG. [Read more about it here.](https://trac.ffmpeg.org/wiki/Chroma%20Subsampling0) Acceptable values: `yuv420p`, `yuv422p`, `yuv444p`, `yuv420p10le`, `yuv422p10le`, `yuv444p10le`. Since v1.4, `yuva420p` is also supported for transparent WebM videos.
Default value: `yuv420p`

```tsx
Config.Output.setPixelFormat('yuv420p')
```

The [command line flag](/docs/cli) `--pixel-format` will take precedence over this option.

### setCodec()

_Available from Version 1.4._

Choose one of the supported codecs: `h264` _(default)_, `h265`, `vp8`, `vp9`.

- `h264` is the classic MP4 file as you know it.
- `h265` is the successor of H264, with smaller file sizes. Also known as HEVC. Poor browser compatibility.
- `vp8` is the codec for WebM.
- `vp9` is the next-generation codec for WebM. Lower file size, longer compression time.

```tsx
Config.Output.setCodec('h265');
```

**See also**: [Encoding guide](/docs/encoding)

### setImageSequence()

_Available from Version 1.4._

Set to true if you want to output an image sequence instead of a video.

```tsx
Config.Output.setImageSequence(true);
```

### ~~setOutputFormat()~~

_Deprecated_. Use `setCodec()` and `setImageSequence()` instead.

Either `'mp4'` or `'png-sequence'`.

```tsx
Config.Output.setOutputFormat('mp4');
```

The [command line flags](/docs/cli) `--sequence` and `--codec` will take precedence over this option.

The [command line flag](/docs/cli) `--quality` will take precedence over this option.

### setCrf()

_Available from Version 1.4._

The "Constant Rate Factor" (CRF) of the output. [Use this setting to tell FFMPEG how to trade off size and quality.](encoding#controlling-quality-using-the-crf-setting)

Ranges for CRF scale, by codec:

- `h264` crf range is 0-51 where crf 18 is _default_.
- `h265` crf range is 0-51 where crf 23 is _default_.
- `vp8` crf range is 4-63 where crf 9 is _default_.
- `vp9` crf range is 0-63 where crf 28 is _default_.

The lowest value is lossless, and the highest value is the worst quality possible. Higher values decrease the filesize at the cost of quality.

The range is exponential, so increasing the CRF value +6 results in roughly half the bitrate / file size, while -6 leads to roughly twice the bitrate.

Choose the highest CRF value that still provides an acceptable quality. If the output looks good, then try a higher value. If it looks bad, choose a lower value.

```tsx
Config.Output.setCrf(16);
```

The [command line flag](/docs/cli) `--crf` will take precedence over this option.

## See also

- [Encoding guide](/docs/encoding)
