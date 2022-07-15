---
title: npx remotion compositions
sidebar_label: compositions
---

_Available from v2.6.12._

Print list of composition IDs based on a path of an entry point.

```bash
npx remotion compositions <entry-file>
```

## Flags

### `--props`

[React Props that can be retrieved using `getInputProps()`.](/docs/get-input-props) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`).

:::info
Inline JSON string isn't supported on Windows because it removes the `"` character, use a temporary file instead.
:::

### `--config`

Specify a location for the Remotion config file.

### `--env-file`

Specify a location for a dotenv file. Default `.env`. Available in v2.2 and later.

### `--bundle-cache`

[Enable or disable Webpack caching](/docs/config#setcachingenabled). This flag is enabled by default, use `--bundle-cache=false` to disable caching.

### `--log`

[Set the log level](/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` (_default_), `verbose`

:::info
If you don't feel like passing command line flags every time, consider creating a `remotion.config.ts` [config file](/docs/config).
:::

### `--port`

[Set a custom HTTP server port to host the Webpack bundle](/docs/config#setPort). If not defined, Remotion will try to find a free port.

### `--ffmpeg-executable`

[Set a custom `ffmpeg` executable](/docs/config#setFfmpegExecutable). If not defined, a `ffmpeg` executable will be searched in `PATH`.

### `--ffprobe-executable`

[Set a custom `ffprobe` executable](/docs/config#setFfprobeExecutable). If not defined, a `ffprobe` executable will be searched in `PATH`.

### `--timeout`

Define how long it may take to resolve all [`delayRender()`](/docs/delay-render) calls before the composition fetching times out in milliseconds. Default: `30000`.

:::info
Not to be confused with the [`--timeout` flag when deploying a Lambda function](/docs/lambda/cli/functions#--timeout).
:::

### `--ignore-certificate-errors`

Results in invalid SSL certificates in Chrome, such as self-signed ones, being ignored.

### `--disable-web-security`

This will most notably disable CORS in Chrome among other security features.

### `--disable-headless`

Opens an actual browser to observe the composition fetching.

### `--quiet`, `--q`

Only prints the composition IDs, separated by a space.
