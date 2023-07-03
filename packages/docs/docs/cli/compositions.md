---
image: /generated/articles-docs-cli-compositions.png
title: npx remotion compositions
sidebar_label: compositions
crumb: CLI Reference
---

_Available from v2.6.12._

Print list of composition IDs based on a path of an entry point.

```bash
npx remotion compositions <entry-file>
```

If `entry-file` is not passed, Remotion will try to detect the entry file with the following priority order:

1. Get the path from the Config (Can be set using `Config.setEntryPoint("<entry-point>")`).
2. Look for some common paths i.e. `src/index.ts`, `src/index.tsx`, `src/index.js`, `remotion/index.js`.
3. Fail as entry point could not be determined.

## Flags

### `--props`

[React Props that can be retrieved using `getInputProps()`.](/docs/get-input-props) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`).

:::info
Inline JSON string isn't supported on Windows because it removes the `"` character, use a temporary file instead.
:::

### `--config`

Specify a location for the Remotion config file.

### `--env-file`<AvailableFrom v="2.2.0" />

Specify a location for a dotenv file - Default `.env`. [Read about how environment variables work in Remotion.](/docs/env-variables)

### `--bundle-cache`

[Enable or disable Webpack caching](/docs/config#setcachingenabled). This flag is enabled by default, use `--bundle-cache=false` to disable caching.

### `--log`

[Set the log level](/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` (_default_), `verbose`

:::info
If you don't feel like passing command line flags every time, consider creating a `remotion.config.ts` [config file](/docs/config).
:::

### `--port`

[Set a custom HTTP server port to host the Webpack bundle](/docs/config#setPort). If not defined, Remotion will try to find a free port.

### `--public-dir`<AvailableFrom v="3.2.13" />

[Define the location of the `public/` directory.](/docs/config#setpublicdir). If not defined, Remotion will assume the location is the `public` folder in your Remotion root.

### `--timeout`

Define how long it may take to resolve all [`delayRender()`](/docs/delay-render) calls before the composition fetching times out in milliseconds. Default: `30000`.

:::info
Not to be confused with the [`--timeout` flag when deploying a Lambda function](/docs/lambda/cli/functions#--timeout).
:::

### `--ignore-certificate-errors`

Results in invalid SSL certificates in Chrome, such as self-signed ones, being ignored.

### `--disable-web-security`

_available since v2.6.5_

This will most notably disable CORS in Chrome among other security features.

### `--disable-headless`

Opens an actual browser to observe the composition fetching.

### `--user-agent`<AvailableFrom v="3.3.83"/>

Lets you set a custom user agent that the headless Chrome browser assumes.

### `--quiet`, `--q`

Only prints the composition IDs, separated by a space.

### ~~`--ffmpeg-executable`~~

_removed in v4.0_

[Set a custom `ffmpeg` executable](/docs/config#setFfmpegExecutable). If not defined, a `ffmpeg` executable will be searched in `PATH`.

### ~~`--ffprobe-executable`~~

_removed in v4.0_

[Set a custom `ffprobe` executable](/docs/config#setFfprobeExecutable). If not defined, a `ffprobe` executable will be searched in `PATH`.

## See also

- [`getCompositions()`](/docs/cli/compositions)
- [`npx remotion compositions`](/docs/cli/compositions)
- [`getCompositionsOnLambda()`](/docs/lambda/getcompositionsonlambda)
- [`npx remotion lambda compositions`](/docs/lambda/cli/compositions)
