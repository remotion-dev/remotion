---
title: npx remotion render
sidebar_label: render
---

import {AngleChangelog} from '../../components/AngleChangelog';

Render a video or audio based on the entry point, the composition ID and save it to the output location.

```bash
npx remotion render <entry-file> <composition-id> <output-location>
```

## Flags

Besides choosing a video and output location with the command line arguments, the following flags are supported:

### `--props`

[React Props to pass to the selected composition of your video.](/docs/parametrized-rendering#passing-input-props-in-the-cli) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`). Can also be read using [`getInputProps()`](/docs/get-input-props).

:::info
Inline JSON string isn't supported on Windows because it removes the `"` character, use a temporary file instead.
:::

### `--concurrency`

[How many CPU threads to use.](/docs/config#setconcurrency) Minimum 1. The maximum is the amount of threads you have (In Node.JS `os.cpus().length`).

### `--pixel-format`

[Set a custom pixel format. See here for available values.](/docs/config#setpixelformat)

### `--image-format`

[`jpeg` or `png` - JPEG is faster, but doesn't support transparency.](/docs/config#setimageformat) The default image format is `jpeg` since v1.1. Flag available since v1.4.

### `--config`

Specify a location for the Remotion config file. Available in v1.2 and later.

### `--env-file`

Specify a location for a dotenv file. Default `.env`. Available in v2.2 and later.

### `--quality`

[Value between 0 and 100 for JPEG rendering quality](/docs/config#setquality). Doesn't work when PNG frames are rendered. Available since v1.4.

### `--overwrite`

[Write to output even if file already exists.](/docs/config#setoverwriteoutput). This flag is enabled by default, use `--overwrite=false` to disable it.

### `--sequence`

[Pass this flag if you want an image sequence as the output instead of a video.](/docs/config#setimagesequence) Available since v1.4.

### `--codec`

[`h264` or `h265` or `png` or `vp8` or `vp9` or `mp3` or `aac` or `wav` or `prores` or `h264-mkv`](/docs/config#setcodec). If you don't supply `--codec`, it will use the H.264 encoder. Available since v1.4.

### `--audio-bitrate`

Specify the output bitrate for the generated audio.
Beware, ffmpeg may, depending on the codec chosen, not take this parameter into account.
Example:  `512K`, `1M`

### `--video-bitrate`

Specify the output bitrate for the generated video.
Beware, ffmpeg may, depending on the codec chosen, not take this parameter into account.
Example:  `512K`, `1M`

### `--prores-profile`

[Set the ProRes profile](/docs/config#setproresprofile). This option is only valid if the [`codec`](#--codec) has been set to `prores`. Possible values: `4444-xq`, `4444`, `hq`, `standard`, `light`, `proxy`. See [here](https://video.stackexchange.com/a/14715) for explanation of possible values. Default: `hq`. Available since v2.1.6.

### `--crf`

[To set Constant Rate Factor (CRF) of the output](/docs/config#setcrf). Minimum 0. Use this rate control mode if you want to keep the best quality and care less about the file size. Available since v1.4.

### `--browser-executable`

[Path to a Chrome executable](/docs/config#setbrowserexecutable). If not specified and Remotion cannot find one, it will download one during rendering. Available since v1.5.

### `--scale`

[Scales the output frames by the factor you pass in.](/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details. `scale` must be greater than 0 and less than equal to 16. Default: `1`.

### `--frames`

[Render a subset of a video](/docs/config#setframerange). Example: `--frames=0-9` to select the first 10 frames. To render a still, use the `still` command. Available since v2.0.

### `--every-nth-frame`

_available from v3.1_

[Render only every nth frame.](/docs/config#seteverynthframe) This option may only be set when rendering GIFs. This allows you to lower the FPS of the GIF.

For example only every second frame, every third frame and so on. Only works for rendering GIFs. [See here for more details.](/docs/render-as-gif#reducing-frame-rate)

### `--muted`

_available from v3.2.1_

[Disables audio output.](/docs/config#setmuted) This option may only be used when rendering a video.

### `--enforce-audio-track`

_available from v3.2.1_

[Render a silent audio track if there wouldn't be one otherwise.](/docs/config#enforceaudiotrack).

### `--number-of-gif-loops`

_available from v3.1_

[Set the looping behavior.](/docs/config#setnumberofgifloops) This option may only be set when rendering GIFs. [See here for more details.](/docs/render-as-gif#changing-the-number-of-loops)

### `--bundle-cache`

[Enable or disable Webpack caching](/docs/config#setcachingenabled). This flag is enabled by default, use `--bundle-cache=false` to disable caching. Available since v2.0.

### `--log`

[Set the log level](/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` (_default_), `verbose`

### `--port`

[Set a custom HTTP server port that will be used to host the Webpack bundle](/docs/config#setport). If not defined, Remotion will try to find a free port.

### `--public-dir`

_Available from v3.2.13_

[Define the location of the `public/` directory.](/docs/config#setpublicdir). If not defined, Remotion will assume the location is the `public` folder in your Remotion root.

### `--ffmpeg-executable`

[Set a custom `ffmpeg` executable](/docs/config#setFfmpegExecutable). If not defined, a `ffmpeg` executable will be searched in `PATH`.

### `--ffprobe-executable`

_available from v3.0.17_

[Set a custom `ffprobe` executable](/docs/config#setFfprobeExecutable). If not defined, a `ffprobe` executable will be searched in `PATH`.

### `--timeout`

Define how long a single frame may take to resolve all [`delayRender()`](/docs/delay-render) calls [before it times out](/docs/timeout) in milliseconds. Default: `30000`.

:::info
Not to be confused with the [`--timeout` flag when deploying a Lambda function](/docs/lambda/cli/functions#--timeout).
:::

### `--ignore-certificate-errors`

Results in invalid SSL certificates in Chrome, such as self-signed ones, being ignored. Available since v2.6.5.

### `--disable-web-security`

This will most notably disable CORS in Chrome among other security features.
Available since v2.6.5.

### `--disable-headless`

Opens an actual browser during rendering to observe the render.
Available since v2.6.5.

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
