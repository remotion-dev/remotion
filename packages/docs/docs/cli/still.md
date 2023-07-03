---
image: /generated/articles-docs-cli-still.png
title: npx remotion still
sidebar_label: still
crumb: CLI Reference
---

import {AngleChangelog} from '../../components/AngleChangelog';

_Available from v2.3._

Render a still frame based on the entry point, the composition ID and save it to the output location.

```bash
npx remotion still <entry-file> [<composition-id>] [<output-location>]
```

If `output-location` is not passed, the still will be rendered into the `out` folder.  
If `composition-id` is also not passed, Remotion will let you select a composition.

## Flags

### `--props`

[React Props to pass to the selected composition of your video.](/docs/parametrized-rendering#passing-input-props-in-the-cli) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`). Can also be read using [`getInputProps()`](/docs/get-input-props).

:::info
Inline JSON string isn't supported on Windows because it removes the `"` character, use a temporary file instead.
:::

### `--image-format`

`jpeg`, `png`, `webp` or `pdf`. The default is `png`.

### `--config`

Specify a location for the Remotion config file.

### `--env-file`

Specify a location for a dotenv file - Default `.env`. [Read about how environment variables work in Remotion.](/docs/env-variables)

### `--jpeg-quality` <AvailableFrom v="4.0.0" />

[Value between 0 and 100 for JPEG rendering quality](/docs/config#setjpegquality). Doesn't work when PNG frames are rendered.

### ~~`--quality`~~ <AvailableFrom v="1.4.0" />

Renamed to `--jpeg-quality` in v4.0.0

### `--output` <AvailableFrom v="4.0.0" />

Sets the output file path, as an alternative to the `output-location` positional argument.

### `--overwrite`

[Write to output even if file already exists.](/docs/config#setoverwriteoutput). This flag is enabled by default, use `--overwrite=false` to disable it.

### `--browser-executable`

[Path to a Chrome executable](/docs/config#setbrowserexecutable). If not specified and Remotion cannot find one, it will download one during rendering.

### `--scale`

[Scales the output frames by the factor you pass in.](/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details. `scale` must be greater than 0 and less than equal to 16. Default: `1`.

### `--frame`

Which frame should be rendered. Example `--frame=10`. Default `0`.  
From v3.2.27, negative values are allowed, with `-1` being the last frame.

### `--bundle-cache`

[Enable or disable Webpack caching](/docs/config#setcachingenabled). This flag is enabled by default, use `--bundle-cache=false` to disable caching.

### `--log`

[Set the log level](/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` (_default_), `verbose`

### `--port`

[Set a custom HTTP server port to serve the Webpack bundle](/docs/config#setPort). If not defined, Remotion will try to find a free port.

### `--public-dir`<AvailableFrom v="3.2.13" />

[Define the location of the `public/` directory.](/docs/config#setpublicdir). If not defined, Remotion will assume the location is the `public` folder in your Remotion root.

### `--timeout`

Define how long a single frame may take to resolve all [`delayRender()`](/docs/delay-render) calls [before it times out](/docs/timeout) in milliseconds. Default: `30000`.

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

### ~~`--ffprobe-executable`~~

_removed in v4.0_

[Set a custom `ffprobe` executable](/docs/config#setFfprobeExecutable). If not defined, a `ffprobe` executable will be searched in `PATH`.
