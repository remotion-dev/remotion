---
id: config
title: Configuration file
---

To configure Remotion, create a `remotion.config.ts` file in the root of your Remotion project.

These options will apply to CLI commands such as `npm start` and `npm run build`.

:::warning
The configuration file has no effect when using [SSR](/docs/renderer) APIs.
:::warn

You can control several behaviors of Remotion here.

```ts twoslash
import { Config } from "remotion";

Config.Rendering.setConcurrency(8);
Config.Output.setPixelFormat("yuv444p");
Config.Output.setCodec("h265");
```

## Bundling

### overrideWebpackConfig()

_Available from Version 1.1._

Allows you to insert your custom Webpack config. [See the page about custom Webpack configs](/docs/webpack) for more information.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
  // Return a new Webpack configuration
  return {
    ...currentConfiguration,
    // new configuration
  };
});
```

### setCachingEnabled()

_Available from Version 2.0._

Enable or disable webpack caching. Default is `true` which will make the Webpack step in the first run a bit slower but will massively speed up subsequent runs. We recommend to keep this option enabled in all cases and encourage to report issues on GitHub if you encounter some.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Bundling.setCachingEnabled(false);
```

The [command line flag](/docs/cli/render#--bundle-cache) `--bundle-cache` will take precedence over this option.

### setPort()

Define on which port Remotion should start it's HTTP servers during preview and rendering.
By default, Remotion will try to find a free port.
If you specify a port, but it's not available, Remotion will throw an error.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Bundling.setPort(3003);
```

The [command line flag](/docs/cli/render#--port) `--port` will take precedence over this option.

## Log

### setLevel()

_Available from Version 2.0.1_

Increase or decrease the amount of log messages in the CLI.
Acceptable values:

- `error`: Silent except error messages.
- `warn`: Only showing errors and warnings.
- `info` (_default_): Default output - besides errors and warnings, prints progress and output location.
- `verbose`: All of the above, plus browser logs and other debug info.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Log.setLevel("verbose");
```

The [command line flag](/docs/cli/render#--log) `--log` will take precedence over this option.

## Preview

### setMaxTimelineTracks()

_Available from Version 2.1.10._

Set how many tracks are being displayed in the timeline at most. This does not affect your video, just the amount of tracks shown when previewing. Default `15`.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Preview.setMaxTimelineTracks(20);
```

### setKeyboardShortcutsEnabled()

Whether the Preview should react to keyboard shortcuts. Default `true`.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Preview.setKeyboardShortcutsEnabled(false);
```

The [command line flag](/docs/cli/preview#--disable-keyboard-shortcuts) `--disable-keyboard-shortcuts` will take precedence over this option.

## Puppeteer

### setBrowserExecutable()

_Available from Version 1.5._

Set a custom Chrome or Chromium executable path. By default Remotion will try to find an existing version of Chrome on your system and if not found, it will download one. This flag is useful if you don't have Chrome installed in a standard location and you want to prevent downloading an additional browser or need [support for the H264 codec](/docs/video#codec-support).

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Puppeteer.setBrowserExecutable("/usr/bin/google-chrome-stable");
```

The [command line flag](/docs/cli/render#--browser-executable) `--browser-executable` will take precedence over this option.

### setTimeoutInMilliseconds()

_Available from Version 2.6.3._

Define how long a single frame may take to resolve all [`delayRender()`](/docs/delay-render) calls before it times out. Default: `30000`

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Puppeteer.setTimeoutInMilliseconds(60000);
```

The [command line flag](/docs/cli/render#--timeout) `--timeout` will take precedence over this option.

### setChromiumDisableWebSecurity()

_Available from Version 2.6.5._

This will most notably disable CORS among other security features.

```tsx twoslash
import { Config } from "remotion";

// ---cut---

Config.Puppeteer.setChromiumDisableWebSecurity(true);
```

The [command line flag](/docs/cli/render#--disable-web-security) `--disable-web-security` will take precedence over this option.

### setChromiumIgnoreCertificateErrors()

_Available from Version 2.6.5._

Results in invalid SSL certificates, such as self-signed ones, being ignored.

```tsx twoslash
import { Config } from "remotion";

// ---cut---

Config.Puppeteer.setChromiumIgnoreCertificateErrors(true);
```

The [command line flag](/docs/cli/render#--ignore-certificate-errors) `--ignore-certificate-errors` will take precedence over this option.

### setChromiumHeadlessMode()

_Available from Version 2.6.5._

By default `true`. Disabling it will open an actual Chrome window where you can see the render happen.

```tsx twoslash
import { Config } from "remotion";

// ---cut---

Config.Puppeteer.setChromiumHeadlessMode(false);
```

The [command line flag](/docs/cli/render#--disable-headless) `--disable-headless` will take precedence over this option.

## Rendering

### setConcurrency()

Sets how many Puppeteer instances will work on rendering your video in parallel.
Default: `null`, meaning **half of the threads** available on your CPU.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Rendering.setConcurrency(8);
```

The [command line flag](/docs/cli/render#--concurrency) `--concurrency` will take precedence over this option.

:::tip
Try to set your concurrency to `os.cpus().length` to all the threads available on your CPU for faster rendering. The drawback is that other parts of your system might slow down.
:::

### setImageFormat()

_Available from Version 1.4._

Determines which in which image format to render the frames. Either:

- `jpeg` - the fastest option (default from v1.1)
- `png` - slower, but supports transparency
- `none` - don't render images, just calculate audio information (available from v2.0)

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Rendering.setImageFormat("png");
```

The [command line flag](/docs/cli/render#--image-format) `--image-format` will take precedence over this option.

### setScale()

_Available from Version 2.6.7._

[Scales the output frames by the factor you pass in.](/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details. Default: `1`.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Rendering.setScale(2);
```

The [command line flag](/docs/cli/render#--scale) `--scale` will take precedence over this option.

### setMuted()

_Available from Version 3.2.1._

Disables audio output. Default `false`.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Rendering.setMuted(true);
```

The [command line flag](/docs/cli/render#--muted) `--muted` will take precedence over this option.

### setEnforceAudioTrack()

_Available from Version 3.2.1._

Render a silent audio track if there would be none otherwise. Default `false`.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Rendering.setEnforceAudioTrack(true);
```

The [command line flag](/docs/cli/render#--enforce-audio-track) `--enforce-audio-track` will take precedence over this option.

### setFrameRange()

_Available from Version 2.0._

Pass a number to render a still frame or a tuple to render a subset of a video. The frame sequence is zero-indexed.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Rendering.setFrameRange(90); // To render only the 91st frame
```

or

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Rendering.setFrameRange([0, 20]); // Render a video only containing the first 21 frames
```

The [command line flag](/docs/cli/render#--frames) `--frames` will take precedence over this option.

### setQuality()

The JPEG quality of each frame. Must be a number between 0 and 100. Will not work if you render PNG frames. [Default: 80](https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/headless/lib/browser/protocol/headless_handler.cc#L32).

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Rendering.setQuality(90);
```

The [command line flag](/docs/cli/render#--quality) `--quality` will take precedence over this option.

### setDotEnvLocation()

Set a custom location for a [`.env`](https://www.npmjs.com/package/dotenv) file. You can specify an absolute path or a relative path in which case it gets resolved based on the current working directory.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Rendering.setDotEnvLocation(".my-env");
```

The [command line flag](/docs/cli/render#--env-file) `--env-file` will take precedence over this option.

### setFfmpegExecutable()

Allows you to use a custom FFMPEG binary. Must be an absolute path. By default, this is null and the FFMPEG in `PATH` will be used.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Rendering.setFfmpegExecutable("/path/to/custom/ffmpeg");
```

The [command line flag](/docs/cli/render#--ffmpeg-executable) `--ffmpeg-executable` will take precedence over this option.

### setFfprobeExecutable()

Allows you to use a custom `ffprobe` binary. Must be an absolute path. By default, this is null and the `ffprobe` in `PATH` will be used.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Rendering.setFfprobeExecutable("/path/to/custom/ffprobe");
```

The [command line flag](/docs/cli/render#--ffprobe-executable) `--ffprobe-executable` will take precedence over this option.

### setEveryNthFrame()

This option may only be set when rendering GIFs. [It determines how many frames are rendered, while the other ones gets skipped in order to lower the FPS of the GIF.](/docs/render-as-gif)

For example, if the `fps` is 30, and `everyNthFrame` is 2, the FPS of the GIF is `15`.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Rendering.setEveryNthFrame(2);
```

The [command line flag](/docs/cli/render#--every-nth-frame) `--every-nth-frame` will take precedence over this option.

### setNumberOfGifLoops()

This option may only be set when rendering GIFs. [If it is set, it will limit the amount of times a GIF will loop. If set to `0`, the GIF will play once, if set to `1`, it will play twice. If set to `null` or not set at all, it will play forever](/docs/render-as-gif).

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Rendering.setNumberOfGifLoops(2);
```

The [command line flag](/docs/cli/render#--number-of-gif-loops) `--number-of-gif-loops` will take precedence over this option.

## Output

### setOutputLocation()

_Available from v3.1.6_

Set the output location of the video or still, relative to the current working directory. The default is `out/{composition}.{container}`. For example, `out/HelloWorld.mp4`.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Output.setOutputLocation("out/video.mp4");
```

If you pass another argument to the render command, it will take precedence: `npx remotion render src/index.tsx HelloWorld out/video.mp4`.

### setOverwriteOutput()

Set this to `false` to prevent overwriting Remotion outputs when they already exists.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Output.setOverwriteOutput(false);
```

:::info
In version 1.x, the default behavior was inverse - Remotion would not override by default.
:::

### setPixelFormat()

Controls the pixel format in FFMPEG. [Read more about it here.](https://trac.ffmpeg.org/wiki/Chroma%20Subsampling) Acceptable values: `yuv420p`, `yuv422p`, `yuv444p`, `yuv420p10le`, `yuv422p10le`, `yuv444p10le`. Since v1.4, `yuva420p` is also supported for transparent WebM videos. Since v2.1.7, `yuva444p10le` is also supported for transparent ProRes videos
Default value: `yuv420p`

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Output.setPixelFormat("yuv420p");
```

The [command line flag](/docs/cli/render#--pixel-format) `--pixel-format` will take precedence over this option.

### setCodec()

_Available from Version 1.4._

Choose one of the supported codecs: `h264` _(default)_, `h265`, `vp8`, `vp9`.

- `h264` is the classic MP4 file as you know it.
- `h265` is the successor of H264, with smaller file sizes. Also known as HEVC. Poor browser compatibility.
- `vp8` is the codec for WebM.
- `vp9` is the next-generation codec for WebM. Lower file size, longer compression time.
- `prores` is a common codec if you want to import the output into another video editing program _(available from v2.1.6)_
- `mp3` will export audio only as an MP3 file _(available from v2.0)_
- `wav` will export audio only as an WAV file _(available from v2.0)_
- `aac` will export audio only as an AAC file _(available from v2.0)_
- `mkv` will export using H264 codec, MKV container format and WAV audio codec. _(available from v2.1.12)_

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Output.setCodec("h265");
```

The [command line flag](/docs/cli/render#--codec) `--codec` will take precedence over this option.

**See also**: [Encoding guide](/docs/encoding)

### setProResProfile()

_Available from Version 2.1.6._

Set the ProRes profile. This option is only valid if the codec has been set to `prores`.
Possible values: `4444-xq`, `4444`, `hq`, `standard`, `light`, `proxy`.
See [here](https://video.stackexchange.com/a/14715) for explanation of possible values.
Default: `hq`

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Output.setProResProfile("4444");
```

The [command line flag](/docs/cli/render#--prores-profile) `--prores-profile` will take precedence over this option.

**See also**: [Encoding guide](/docs/encoding), [Transparent videos](/docs/transparent-videos)

### setImageSequence()

_Available from Version 1.4._

Set to true if you want to output an image sequence instead of a video.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Output.setImageSequence(true);
```

The [command line flag](/docs/cli/render#--sequence) `--sequence` will take precedence over this option.

### ~~setOutputFormat()~~

_Deprecated_. Use `setCodec()` and `setImageSequence()` instead.

Either `'mp4'` or `'png-sequence'`.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Output.setOutputFormat("mp4");
```

The [command line flags](/docs/cli) `--sequence` and `--codec` will take precedence over this option.

The [command line flag](/docs/cli) `--quality` will take precedence over this option.

### setCrf()

_Available from Version 1.4._

The "Constant Rate Factor" (CRF) of the output. [Use this setting to tell FFMPEG how to trade off size and quality.](/docs/encoding#controlling-quality-using-the-crf-setting)

Ranges for CRF scale, by codec:

- `h264` crf range is 1-51 where crf 18 is _default_.
- `h265` crf range is 0-51 where crf 23 is _default_.
- `vp8` crf range is 4-63 where crf 9 is _default_.
- `vp9` crf range is 0-63 where crf 28 is _default_.

The lowest value is lossless, and the highest value is the worst quality possible. Higher values decrease the filesize at the cost of quality.

The range is exponential, so increasing the CRF value +6 results in roughly half the bitrate / file size, while -6 leads to roughly twice the bitrate.

Choose the highest CRF value that still provides an acceptable quality. If the output looks good, then try a higher value. If it looks bad, choose a lower value.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Output.setCrf(16);
```

The [command line flag](/docs/cli/render#--crf) `--crf` will take precedence over this option.

## See also

- [Encoding guide](/docs/encoding)
