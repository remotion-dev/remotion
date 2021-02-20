---
id: config
title: Configuration file
---

To configure Remotion, create a `remotion.config.ts` file in the root of your Remotion project.

You can control several behaviors of Remotion here.

```tsx
import {Config} from 'remotion';

Config.Output.setPixelFormat('yuv444p');
```

## Bundling

### overrideWebpackConfig()

Allows you to insert your custom Webpack config. [See the page about custom Webpack configs](webpack) for more information.

```tsx
Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
  // Return a new Webpack configuration
});
```

## Rendering

### setConcurrency()

Sets how many Puppeteer instances will work on rendering your video in parallel.
Default: `null`, meaning **half of the threads** available on your CPU.

```ts
Config.Rendering.setConcurrency(8)
```

The [command line flag](cli) `--concurrency` will take precedence over this option.

:::tip
Try to set your concurrency to `os.cpus().length` to all the threads available on your CPU for faster rendering. The drawback is that other parts of your system might slow down.
:::

## Output

### setOverwriteOutput()

Set this to `true` to always overwrite Remotion outputs without asking.

```tsx
Config.Output.setOverwriteOutput(true)
```

The [command line flag](cli) `--overwrite` will take precedence over this option.

### setPixelFormat()

Controls the pixel format in FFMPEG. [Read more about it here.](https://trac.ffmpeg.org/wiki/Chroma%20Subsampling0) Acceptable values: `yuv420p`, `yuv422p`, `yuv444p`, `yuv420p10le`, `yuv422p10le`, `yuv444p10le`.
Default value: `yuv420p`

```tsx
Config.Output.setPixelFormat('yuv420p')
```

The [command line flag](cli) `--pixel-format` will take precedene over this option.

### setCodec()

Choose one of the supported codecs: `h264` _(default)_, `h265`, `vp8`, `vp9`.

- `h264` is the classic MP4 file as you know it.
- `h265` is the successor of H264, with smaller file sizes. Also known as HEVC. Poor browser compatibility.
- `vp8` is the codec for WebM.
- `vp9` is the next-generation codec for WebM. Lower file size, longer compression time.

```tsx
Config.Output.setCodec('h265');
```

### setOutputFormat()

_Deprecated_. Use `setCodec()` instead.

Either `'mp4'` or `'png-sequence'`.

```tsx
Config.Output.setOutputFormat('h265');
```

The [command line flags](cli) `--png` and `--codec` will take precedence over this option.

### setQuality()

The JPEG quality of each frame. Must be a number between 0 and 100. [Default: 80](https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/headless/lib/browser/protocol/headless_handler.cc#L32).

```tsx
Config.output.setQuality(90);
```

The [command line flag](cli) `--quality` will take precedence over this option.
