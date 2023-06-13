---
image: /generated/articles-docs-config.png
id: config
title: Configuration file
crumb: "remotion.config.ts"
---

To configure Remotion, create a `remotion.config.ts` file in the root of your Remotion project.

These options will apply to CLI commands such as `npm start` and `npm run build`.

:::warning
The configuration file has no effect when using [SSR](/docs/renderer) APIs.
:::warn

You can control several behaviors of Remotion here.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

Config.setConcurrency(8);
Config.setPixelFormat("yuv444p");
Config.setCodec("h265");
```

## Old config file format

In v3.3.39, a new config file format was introduced which flattens the options so they can more easily be discovered using TypeScript autocompletion.

Previously, each config option was two levels deep:

```ts title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.Bundling.setCachingEnabled(false);
```

From v3.3.39 on, all options can be accessed directly from the `Config` object.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setCachingEnabled(false);
```

The old way is deprecated, but will work for the foreseeable future.

## overrideWebpackConfig()<AvailableFrom v="1.1.0" />

Allows you to insert your custom Webpack config. [See the page about custom Webpack configs](/docs/webpack) for more information.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.overrideWebpackConfig((currentConfiguration) => {
  // Return a new Webpack configuration
  return {
    ...currentConfiguration,
    // new configuration
  };
});
```

## setCachingEnabled()<AvailableFrom v="2.0.0" />

Enable or disable Webpack caching. Default is `true` which will make the Webpack step in the first run a bit slower but will massively speed up subsequent runs.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setCachingEnabled(false);
```

The [command line flag](/docs/cli/render#--bundle-cache) `--bundle-cache` will take precedence over this option.

## setPort()

Define on which port Remotion should start it's HTTP servers.  
HTTP servers
By default, Remotion will try to find a free port.  
If you specify a port, but it's not available, Remotion will throw an error.

:::note
When starting the [Remotion Studio](/docs/terminology#remotion-studio), a server will be started to host it.  
During rendering, a HTTP server is also started in the background to serve the Webpack [bundle](/docs/terminology#bundle).
:::

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setPort(3003);
```

The [command line flag](/docs/cli/render#--port) `--port` will take precedence over this option.

## setPublicDir()<AvailableFrom v="3.2.13" />

Define the location of the `public/` directory.  
By default it is a folder named "public" inside the current working directory.  
You can either set an absolute path, or a relative path that will be resolved from the closest package.json location.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setPublicDir("./publico");
```

The [command line flag](/docs/cli/render#--public-dir) `--public-dir` will take precedence over this option.

## setEntryPoint()<AvailableFrom v="3.2.40" />

Sets the Remotion [entry point](/docs/terminology#entry-point), you don't have to specify it for CLI commands.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setEntryPoint("./src/index.ts");
```

If you pass an entry point as a CLI argument, it will take precedence.

## setLevel()<AvailableFrom v="2.0.1" />

Increase or decrease the amount of log messages in the CLI.
Acceptable values:

- `error`: Silent except error messages.
- `warn`: Only showing errors and warnings.
- `info` (_default_): Default output - besides errors and warnings, prints progress and output location.
- `verbose`: All of the above, plus browser logs and other debug info.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setLevel("verbose");
```

The [command line flag](/docs/cli/render#--log) `--log` will take precedence over this option.

## setMaxTimelineTracks()<AvailableFrom v="2.1.10" />

Set how many tracks are being displayed in the timeline in the Studio at most. This does not affect your video, just the amount of tracks shown when previewing. Default `15`.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setMaxTimelineTracks(20);
```

## setKeyboardShortcutsEnabled()<AvailableFrom v="3.2.11" />

Whether the Studio should react to keyboard shortcuts. Default `true`.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setKeyboardShortcutsEnabled(false);
```

The [command line flag](/docs/cli/studio#--disable-keyboard-shortcuts) `--disable-keyboard-shortcuts` will take precedence over this option.

## setWebpackPollingInMilliseconds()<AvailableFrom v="3.3.11" />

Enables Webpack polling instead of the file system event listeners for hot reloading.
This is useful if you are inside a virtual machine or have a remote file system.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setWebpackPollingInMilliseconds(1000);
```

The [command line flag](/docs/cli/studio#--webpack-poll) `--webpack-poll` will take precedence over this option.

## setNumberOfSharedAudioTags()<AvailableFrom v="3.3.2" />

How many shared audio tags should be mounted in the Studio. Shared audio tags can help prevent playback issues due to audio autoplay policies of the browser. See [this article](/docs/player/autoplay#use-the-numberofsharedaudiotags-property) which covers the same option but for the Player. Default `0`, meaning no autoplay policies are circumvented.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

// ---cut---
Config.setNumberOfSharedAudioTags(5);
```

## setShouldOpenBrowser()<AvailableFrom v="3.3.19" />

Whether Remotion should open a browser when starting the Studio. Default `true`.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

// ---cut---
Config.setShouldOpenBrowser(false);
```

## setBrowserExecutable()<AvailableFrom v="1.5.0" />

Set a custom Chrome or Chromium executable path. By default Remotion will try to find an existing version of Chrome on your system and if not found, it will download one. This flag is useful if you don't have Chrome installed in a standard location and you want to prevent downloading an additional browser or need [support for the H264 codec](/docs/video#codec-support).

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setBrowserExecutable("/usr/bin/google-chrome-stable");
```

The [command line flag](/docs/cli/render#--browser-executable) `--browser-executable` will take precedence over this option.

## setDelayRenderTimeoutInMilliseconds()<AvailableFrom v="2.6.3" />

_previously named "setTimeoutInMilliseconds"_

Define how long a single frame may take to resolve all [`delayRender()`](/docs/delay-render) calls [before it times out](/docs/timeout). Default: `30000`

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setDelayRenderTimeoutInMilliseconds(60000);
```

The [command line flag](/docs/cli/render#--timeout) `--timeout` will take precedence over this option.

## setChromiumDisableWebSecurity()<AvailableFrom v="2.6.5" />

This will most notably disable CORS among other security features during rendering.

```tsx twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

// ---cut---

Config.setChromiumDisableWebSecurity(true);
```

The [command line flag](/docs/cli/render#--disable-web-security) `--disable-web-security` will take precedence over this option.

## setChromiumIgnoreCertificateErrors()<AvailableFrom v="2.6.5" />

Results in invalid SSL certificates, such as self-signed ones, being ignored during rendering.

```tsx twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

// ---cut---

Config.setChromiumIgnoreCertificateErrors(true);
```

The [command line flag](/docs/cli/render#--ignore-certificate-errors) `--ignore-certificate-errors` will take precedence over this option.

## setChromiumHeadlessMode()<AvailableFrom v="2.6.5" />

By default `true`. Disabling it will open an actual Chrome window where you can see the render happen.

```tsx twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

// ---cut---

Config.setChromiumHeadlessMode(false);
```

The [command line flag](/docs/cli/render#--disable-headless) `--disable-headless` will take precedence over this option.

## setConcurrency()

Sets how many Puppeteer instances will work on rendering your video in parallel.
Default: `null`, meaning **half of the threads** available on your CPU.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setConcurrency(8);
```

The [command line flag](/docs/cli/render#--concurrency) `--concurrency` will take precedence over this option.

:::tip
Try to set your concurrency to `os.cpus().length` to all the threads available on your CPU for faster rendering. The drawback is that other parts of your system might slow down.
:::

## setVideoImageFormat()<AvailableFrom v="4.0.0" />

Determines which in which image format to render the frames. Either:

- `jpeg` - the fastest option (default)
- `png` - slower, but supports transparency
- `none` - don't render images, just calculate audio information

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setVideoImageFormat("png");
```

## setStillImageFormat()<AvailableFrom v="4.0.0" />

Determines which in which image format to render the frames. Either:

- `png` (default)
- `jpeg`
- `pdf`
- `webp`

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setStillImageFormat("pdf");
```

## ~~setImageFormat()~~<AvailableFrom v="1.4.0" />

_Removed in v4.0_

Replaced in v4.0 with `setVideoImageFormat()` and `setStillImageFormat()`

Determines which in which image format to render the frames. Either:

- `jpeg` - the fastest option (default from v1.1)
- `png` - slower, but supports transparency
- `none` - don't render images, just calculate audio information (available from v2.0)

```ts title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setImageFormat("png");
```

The [command line flag](/docs/cli/render#--image-format) `--image-format` will take precedence over this option.

## setScale()<AvailableFrom v="2.6.7" />

[Scales the output frames by the factor you pass in.](/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details. Default: `1`.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setScale(2);
```

The [command line flag](/docs/cli/render#--scale) `--scale` will take precedence over this option.

## setMuted()<AvailableFrom v="3.2.1" />

Disables audio output. Default `false`.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setMuted(true);
```

The [command line flag](/docs/cli/render#--muted) `--muted` will take precedence over this option.

## setEnforceAudioTrack()<AvailableFrom v="3.2.1" />

Render a silent audio track if there would be none otherwise. Default `false`.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setEnforceAudioTrack(true);
```

The [command line flag](/docs/cli/render#--enforce-audio-track) `--enforce-audio-track` will take precedence over this option.

## setFrameRange()<AvailableFrom v="2.0.0" />

Pass a number to render a still frame or a tuple to render a subset of a video. The frame sequence is zero-indexed.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setFrameRange(90); // To render only the 91st frame
```

or

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setFrameRange([0, 20]); // Render a video only containing the first 21 frames
```

The [command line flag](/docs/cli/render#--frames) `--frames` will take precedence over this option.

## setJpegQuality()

The JPEG quality of each frame. Must be a number between 0 and 100. Will not work if you render PNG frames. [Default: 80](https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/headless/lib/browser/protocol/headless_handler.cc#L32).

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setJpegQuality(90);
```

The [command line flag](/docs/cli/render#--jpeg-quality) `--jpeg-quality` will take precedence over this option.

## ~~setQuality()~~

Renamed to `setJpegQuality` in `v4.0.0`.

## setDotEnvLocation()

Set a custom location for a [`.env`](https://www.npmjs.com/package/dotenv) file. You can specify an absolute path or a relative path in which case it gets resolved based on the current working directory.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setDotEnvLocation(".my-env");
```

The [command line flag](/docs/cli/render#--env-file) `--env-file` will take precedence over this option.

## setEveryNthFrame()

This option may only be set when rendering GIFs. [It determines how many frames are rendered, while the other ones gets skipped in order to lower the FPS of the GIF.](/docs/render-as-gif)

For example, if the `fps` is 30, and `everyNthFrame` is 2, the FPS of the GIF is `15`.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setEveryNthFrame(2);
```

The [command line flag](/docs/cli/render#--every-nth-frame) `--every-nth-frame` will take precedence over this option.

## setNumberOfGifLoops()

This option may only be set when rendering GIFs. [If it is set, it will limit the amount of times a GIF will loop. If set to `0`, the GIF will play once, if set to `1`, it will play twice. If set to `null` or not set at all, it will play forever](/docs/render-as-gif).

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setNumberOfGifLoops(2);
```

The [command line flag](/docs/cli/render#--number-of-gif-loops) `--number-of-gif-loops` will take precedence over this option.

## setOutputLocation()<AvailableFrom v="3.1.6" />

Set the output location of the video or still, relative to the current working directory. The default is `out/{composition}.{container}`. For example, `out/HelloWorld.mp4`.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setOutputLocation("out/video.mp4");
```

If you pass another argument to the render command, it will take precedence: `npx remotion render src/index.ts HelloWorld out/video.mp4`.

## setOverwriteOutput()

Set this to `false` to prevent overwriting Remotion outputs when they already exists.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setOverwriteOutput(false);
```

:::info
In version 1.x, the default behavior was inverse - Remotion would not override by default.
:::

## setPixelFormat()

Controls the pixel format in FFMPEG. [Read more about it here.](https://trac.ffmpeg.org/wiki/Chroma%20Subsampling) Acceptable values: `yuv420p`, `yuv422p`, `yuv444p`, `yuv420p10le`, `yuv422p10le`, `yuv444p10le`. Since v1.4, `yuva420p` is also supported for transparent WebM videos. Since v2.1.7, `yuva444p10le` is also supported for transparent ProRes videos
Default value: `yuv420p`

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setPixelFormat("yuv420p");
```

The [command line flag](/docs/cli/render#--pixel-format) `--pixel-format` will take precedence over this option.

## setCodec()<AvailableFrom v="1.4.0" />

Choose one of the supported codecs: `h264` _(default)_, `h265`, `vp8`, `vp9`.

- `h264` is the classic MP4 file as you know it.
- `h265` is the successor of H264, with smaller file sizes. Also known as HEVC. Poor browser compatibility.
- `vp8` is the codec for WebM.
- `vp9` is the next-generation codec for WebM. Lower file size, longer compression time.
- `prores` is a common codec if you want to import the output into another video editing program _(available from v2.1.6)_
- `mp3` will export audio only as an MP3 file _(available from v2.0)_
- `wav` will export audio only as an WAV file _(available from v2.0)_
- `aac` will export audio only as an AAC file _(available from v2.0)_

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setCodec("h265");
```

The [command line flag](/docs/cli/render#--codec) `--codec` will take precedence over this option.

**See also**: [Encoding guide](/docs/encoding)

## setAudioCodec()

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setAudioCodec("pcm-16");
```

Choose the encoding of your audio.

- The default is dependent on the chosen `codec`.
- Choose `pcm-16` if you need uncompressed audio.
- Not all video containers support all audio codecs.
- This option takes precedence if the `codec` option also specifies an audio codec.

The [command line flag](/docs/cli/render#--audio-codec) `--audio-codec` will take precedence over this option.

Refer to the [Encoding guide](/docs/encoding) to see defaults and supported combinations.

## setProResProfile()<AvailableFrom v="2.1.6" />

Set the ProRes profile. This option is only valid if the codec has been set to `prores`.
Possible values: `4444-xq`, `4444`, `hq`, `standard`, `light`, `proxy`.
See [here](https://video.stackexchange.com/a/14715) for explanation of possible values.
Default: `hq`

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setProResProfile("4444");
```

The [command line flag](/docs/cli/render#--prores-profile) `--prores-profile` will take precedence over this option.

**See also**: [Encoding guide](/docs/encoding), [Transparent videos](/docs/transparent-videos)

## setImageSequence()<AvailableFrom v="1.4.0" />

Set to true if you want to output an image sequence instead of a video.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setImageSequence(true);
```

The [command line flag](/docs/cli/render#--sequence) `--sequence` will take precedence over this option.

## overrideHeight()<AvailableFrom v="3.2.40" />

Overrides the height of the rendered video.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.overrideHeight(600);
```

The [command line flag](/docs/cli/render#--height) `--height` will take precedence over this option.
(see h264 validation?)

## overrideWidth()<AvailableFrom v="3.2.40" />

Overrides the width of the rendered video.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.overrideWidth(900);
```

The [command line flag](/docs/cli/render#--width) `--width` will take precedence over this option

## ~~setOutputFormat()~~

_Removed in v4.0.0_
_Deprecated_. Use `setCodec()` and `setImageSequence()` instead.

Either `'mp4'` or `'png-sequence'`.

```ts title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setOutputFormat("mp4");
```

The [command line flags](/docs/cli) `--sequence` and `--codec` will take precedence over this option.

The [command line flag](/docs/cli) `--quality` will take precedence over this option.

## setCrf()<AvailableFrom v="1.4.0" />

The "Constant Rate Factor" (CRF) of the output. [Use this setting to tell FFMPEG how to trade off size and quality.](/docs/encoding#controlling-quality-using-the-crf-setting)

Ranges for CRF scale, by codec:

- `h264` crf range is 1-51 where crf 18 is _default_.
- `h265` crf range is 0-51 where crf 23 is _default_.
- `vp8` crf range is 4-63 where crf 9 is _default_.
- `vp9` crf range is 0-63 where crf 28 is _default_.

The lowest value is lossless, and the highest value is the worst quality possible. Higher values decrease the filesize at the cost of quality.

The range is exponential, so increasing the CRF value +6 results in roughly half the bitrate / file size, while -6 leads to roughly twice the bitrate.

Choose the highest CRF value that still provides an acceptable quality. If the output looks good, then try a higher value. If it looks bad, choose a lower value.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setCrf(16);
```

The [command line flag](/docs/cli/render#--crf) `--crf` will take precedence over this option.

### `setVideoBitrate()`<AvailableFrom v="3.2.32" />

Specify the target bitrate for the generated video.  
The syntax for FFMPEGs `-b:v` parameter should be used.  
FFMPEG may encode the video in a way that will not result in the exact video bitrate specified.  
This option cannot be set if `--crf` is set.
Example values: `512K` for 512 kbps, `1M` for 1 Mbps.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setVideoBitrate("1M");
```

The [command line flag](/docs/cli/render#--video-bitrate) `--video-bitrate` will take precedence over this option.

### `setAudioBitrate`<AvailableFrom v="3.2.32" />

Specify the target bitrate for the generated audio.  
The syntax for FFMPEGs `-b:a` parameter should be used.  
FFMPEG may encode the video in a way that will not result in the exact audio bitrate specified.
Example values: `128K` for 128 kbps, `1M` for 1 Mbps.  
Default: `320k`

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setAudioBitrate("128K");
```

The [command line flag](/docs/cli/render#--audio-bitrate) `--audio-bitrate` will take precedence over this option.

## overrideFfmpegCommand<AvailableFrom v="3.2.22" />

Modifies the FFMPEG command that Remotion uses under the hood. It works reducer-style, meaning that you pass a function that takes a command as an argument and returns a new command.

```tsx twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.overrideFfmpegCommand(({ args }) => {
  return [...args, "-vf", "eq=brightness=0:saturation=1"];
});
```

The function you pass must accept an object as it's only parameter which contains the following properties:

- `type`: Either `"stitcher"` or `"pre-stitcher"`. If enough memory and CPU is available, Remotion may use parallel rendering and encoding, which means that a pre-stitcher process gets spawned before all frames are rendered. You can tell whether parallel encoding is enabled by adding `--log=verbose` to your render command.
- `args`: An array of strings that is passed as arguments to the FFMPEG command.

Your function must return a modified array of strings.

:::warning
Using this feature is discouraged. Before using it, we want to make you aware of some caveats:

- The render command can change with any new Remotion version, even when it is a patch upgrade. This might break your usage of this feature.
- Depending on the selected codec, available CPU and RAM, Remotion may or may not use "parallel encoding" which will result in multiple FFMPEG commands being executed. Your function must be able to handle being called multiple times.
- This feature is not available when using Remotion Lambda.

Before you use this hack, reach out to the Remotion team on [Discord](https://remotion.dev/discord) and ask us if we are open to implement the feature you need in a clean way - we often do implement new features quickly based on users feedback.
:::

## ~~setFfmpegExecutable()~~

_removed in v4.0_

Allows you to use a custom FFMPEG binary. Must be an absolute path. By default, this is null and the FFMPEG in `PATH` will be used.

```ts title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setFfmpegExecutable("/path/to/custom/ffmpeg");
```

The [command line flag](/docs/cli/render#--ffmpeg-executable) `--ffmpeg-executable` will take precedence over this option.

## ~~setFfprobeExecutable()~~

_removed in v4.0_

Allows you to use a custom `ffprobe` binary. Must be an absolute path. By default, this is null and the `ffprobe` in `PATH` will be used.

```ts title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
Config.setFfprobeExecutable("/path/to/custom/ffprobe");
```

The [command line flag](/docs/cli/render#--ffprobe-executable) `--ffprobe-executable` will take precedence over this option.

## See also

- [Encoding guide](/docs/encoding)
