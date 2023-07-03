---
image: /generated/articles-docs-cli-render.png
title: npx remotion render
sidebar_label: render
crumb: CLI Reference
---

import {AngleChangelog} from '../../components/AngleChangelog';

Render a video or audio based on the entry point, the composition ID and save it to the output location.

```bash
npx remotion render <entry-file?> [<composition-id>] [<output-location>]
```

If `entry-file` is not passed, Remotion will try to detect the entry file with the following priority order:

1. Get the path from the Config (Can be set using `Config.setEntryPoint("<entry-point>")`).
2. Look for some common paths i.e. `src/index.ts`, `src/index.tsx` `src/index.js`, `remotion/index.ts`, `app/remotion/index.ts`.
3. Fail as entry point could not be determined.

If `output-location` is not passed, the media will be rendered into the `out` folder.  
If `composition-id` is also not passed, Remotion will let you select a composition.

## Flags

Besides choosing a video and output location with the command line arguments, the following flags are supported:

### `--props`

[React Props to pass to the selected composition of your video.](/docs/parametrized-rendering#passing-input-props-in-the-cli) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`). Can also be read using [`getInputProps()`](/docs/get-input-props).

:::info
Inline JSON string isn't supported on Windows because it removes the `"` character, use a temporary file instead.
:::

### `--height`<AvailableFrom v="3.2.40" />

[Overrides composition height.](/docs/config#overrideheight)

### `--width`<AvailableFrom v="3.2.40" />

[Overrides composition width.](/docs/config#overridewidth)

### `--concurrency`

[How many CPU threads to use.](/docs/config#setconcurrency) Minimum 1. The maximum is the amount of threads you have (In Node.JS `os.cpus().length`). You can also provide a percentage value (e.g. 50%).

### `--pixel-format`

[Set a custom pixel format. See here for available values.](/docs/config#setpixelformat)

### `--image-format`<AvailableFrom v="1.4.0" />

[`jpeg` or `png` - JPEG is faster, but doesn't support transparency.](/docs/config#setvideoimageformat) The default image format is `jpeg` since v1.1.

### `--config`<AvailableFrom v="1.2.0" />

Specify a location for the Remotion config file.

### `--env-file`<AvailableFrom v="2.2.0" />

Specify a location for a dotenv file. Default `.env`.

### `--jpeg-quality`<AvailableFrom v="4.0.0" />

[Value between 0 and 100 for JPEG rendering quality](/docs/config#setjpegquality). Doesn't work when PNG frames are rendered.

### ~~`--quality`~~<AvailableFrom v="1.4.0" />

Renamed to `--jpeg-quality` in v4.0.0

### `--output` <AvailableFrom v="4.0.0" />

Sets the output file path, as an alternative to the `output-location` positional argument.

### `--overwrite`

[Write to output even if file already exists.](/docs/config#setoverwriteoutput). This flag is enabled by default, use `--overwrite=false` to disable it.

### `--sequence`<AvailableFrom v="1.4.0" />

[Pass this flag if you want an image sequence as the output instead of a video.](/docs/config#setimagesequence)

### `--codec`<AvailableFrom v="1.4.0" />

[`h264` or `h265` or `png` or `vp8` or `vp9` or `mp3` or `aac` or `wav` or `prores` or `h264-mkv`](/docs/config#setcodec). If you don't supply `--codec`, it will use the H.264 encoder.

### `--audio-codec`<AvailableFrom v="3.3.42" />

[Set which codec the audio should have.](/docs/config#setaudiocodec) For defaults and possible values, refer to the [Encoding guide](/docs/encoding/#audio-codec).

### `--audio-bitrate`<AvailableFrom v="3.2.32" />

Specify the target bitrate for the generated audio.  
The syntax for FFMPEGs `-b:a` parameter should be used.  
FFMPEG may encode the video in a way that will not result in the exact audio bitrate specified.
Example values: `128K` for 128 kbps, `1M` for 1 Mbps.  
Default: `320k`

### `--video-bitrate`<AvailableFrom v="3.2.32" />

Specify the target bitrate for the generated video.  
The syntax for FFMPEGs `-b:v` parameter should be used.  
FFMPEG may encode the video in a way that will not result in the exact video bitrate specified.  
This option cannot be set if `--crf` is set.
Example values: `512K` for 512 kbps, `1M` for 1 Mbps.

### `--prores-profile`<AvailableFrom v="2.1.6" />

[Set the ProRes profile](/docs/config#setproresprofile). This option is only valid if the [`codec`](#--codec) has been set to `prores`. Possible values: `4444-xq`, `4444`, `hq`, `standard`, `light`, `proxy`. See [here](https://video.stackexchange.com/a/14715) for explanation of possible values. Default: `hq`.

### `--crf`<AvailableFrom v="1.4.0" />

[To set Constant Rate Factor (CRF) of the output](/docs/config#setcrf). Minimum 0. Use this rate control mode if you want to keep the best quality and care less about the file size. This option cannot be set if `--video-bitrate` is set.

### `--browser-executable`<AvailableFrom v="1.5.0" />

[Path to a Chrome executable](/docs/config#setbrowserexecutable). If not specified and Remotion cannot find one, it will download one during rendering.

### `--scale`

[Scales the output frames by the factor you pass in.](/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details. `scale` must be greater than 0 and less than equal to 16. Default: `1`.

### `--frames`<AvailableFrom v="2.0.0" />

[Render a subset of a video](/docs/config#setframerange). Example: `--frames=0-9` to select the first 10 frames. To render a still, use the `still` command.

### `--every-nth-frame`<AvailableFrom v="3.1.0" />

[Render only every nth frame.](/docs/config#seteverynthframe) This option may only be set when rendering GIFs. This allows you to lower the FPS of the GIF.

For example only every second frame, every third frame and so on. Only works for rendering GIFs. [See here for more details.](/docs/render-as-gif#reducing-frame-rate)

### `--muted`<AvailableFrom v="3.2.1" />

[Disables audio output.](/docs/config#setmuted) This option may only be used when rendering a video.

### `--enforce-audio-track`<AvailableFrom v="3.2.1" />

[Render a silent audio track if there wouldn't be one otherwise.](/docs/config#enforceaudiotrack).

### `--number-of-gif-loops`<AvailableFrom v="3.1.0" />

[Set the looping behavior.](/docs/config#setnumberofgifloops) This option may only be set when rendering GIFs. [See here for more details.](/docs/render-as-gif#changing-the-number-of-loops)

### `--bundle-cache`<AvailableFrom v="2.0.0" />

[Enable or disable Webpack caching](/docs/config#setcachingenabled). This flag is enabled by default, use `--bundle-cache=false` to disable caching.

### `--log`

[Set the log level](/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` (_default_), `verbose`

### `--port`

[Set a custom HTTP server port that will be used to host the Webpack bundle](/docs/config#setport). If not defined, Remotion will try to find a free port.

### `--public-dir`<AvailableFrom v="3.2.13" />

[Define the location of the `public/` directory.](/docs/config#setpublicdir). If not defined, Remotion will assume the location is the `public` folder in your Remotion root.

### `--ffmpeg-executable`

:::info
Not to be confused with the [`--timeout` flag when deploying a Lambda function](/docs/lambda/cli/functions#--timeout).
:::

### `--ignore-certificate-errors`<AvailableFrom v="2.6.5" />

Results in invalid SSL certificates in Chrome, such as self-signed ones, being ignored.

### `--disable-web-security`<AvailableFrom v="2.6.5" />

This will most notably disable CORS in Chrome among other security features.

### `--disable-headless`<AvailableFrom v="2.6.5" />

Opens an actual browser during rendering to observe the render.

### `--gl`

<AngleChangelog />

Select the OpenGL renderer backend for Chromium.
Accepted values:

- `"angle"`,
- `"egl"`,
- `"swiftshader"`
- `"swangle"`
- `null` - Chromium's default

**Default for local rendering**: `null`.  
**Default for Lambda rendering**: `"swangle"`.

### `--user-agent`<AvailableFrom v="3.3.83"/>

Lets you set a custom user agent that the headless Chrome browser assumes.

### ~~`--ffmpeg-executable`~~

_removed in v4.0_

[Set a custom `ffmpeg` executable](/docs/config#setFfmpegExecutable). If not defined, a `ffmpeg` executable will be searched in `PATH`.

### ~~`--ffprobe-executable`~~ <AvailableFrom v="3.0.17" />

_removed in v4.0_

[Set a custom `ffprobe` executable](/docs/config#setFfprobeExecutable). If not defined, a `ffprobe` executable will be searched in `PATH`.
