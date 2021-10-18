---
title: Command line reference
sidebar_label: CLI reference
id: cli
---

## Commands

The following commands are available - you can always run them using `npx remotion` or even without the `npx` prefix if you put the command inside an npm script.

### `npx remotion preview`

Start the server which allows you to preview the Remotion video. The only argument to pass is the entry file:

```bash
npx remotion preview src/index.tsx
```

### `npx remotion render`

Render a video based on the entry point, the composition ID and save it to the output location.

```bash
npx remotion render <entry-file> <composition-id> <output-location>
```

### `npx remotion still`

_Available from v2.3._

Render a still frame basd on the entry point, the composition ID and save it to the output location.

```bash
npx remotion still <entry-file> <composition-id> <output-location>
```

### `npx remotion upgrade`

Upgrade all Remotion-related dependencies to the newest version.

### `npx remotion --help`

Prints the list of commands and flags for quick lookup.

## Flags

Besides choosing a video and output location with the command line arguments, the following flags are supported:

### `--props`

_available for `preview`, `render`, `still` commands_

[React Props to pass to the root component of your video.](/docs/parametrized-rendering#passing-input-props-in-the-cli) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`).

:::info
Inline JSON string isn't supported on Windows because it removes the `"` character, use a temporary file instead.
:::

### `--concurrency`

_available for `render` command_

[How many CPU threads to use.](/docs/config#setconcurrency) Minimum 1. The maximum is the amount of threads you have (In Node.JS `os.cpus().length`).

### `--pixel-format`

_available for `render` command_

[Set a custom pixel format. See here for available values.](/docs/config#setpixelformat)

### `--image-format`

_available for `render`, `still` commands_

[`jpeg` or `png` - JPEG is faster, but doesn't support transparency.](/docs/config#setimageformat) The default image format is `jpeg` since v1.1. Flag available since v1.4.

### `--config`

_available for `preview`, `render`, `still` commands_

Specify a location for the Remotion config file. Available in v1.2 and later.

### `--env-file`

_available for `preview`, `render`, `still` commands_

Specify a location for a dotenv file. Default `.env`. Available in v2.2 and later.

### `--quality`

_available for `render`, `still` commands_

[Value between 0 and 100 for JPEG rendering quality](/docs/config#setquality). Doesn't work when PNG frames are rendered. Available since v1.4.

### `--overwrite`

_available for `render`, `still` commands_

[Write to output even if file already exists.](/docs/config#setoverwriteoutput)

### `--sequence`

_available for `render` command_

[Pass this flag if you want an image sequence as the output instead of a video.](/docs/config#setimagesequence) Available since v1.4.

### `--codec`

_available for `render` command_

[`h264` or `h265` or `png` or `vp8` or `vp9` or `mp3` or `aac` or `wav` or `prores` or `h264-mkv`](/docs/config#setcodec). If you don't supply `--codec`, it will use the H.264 encoder. Available since v1.4.

### `--prores-profile`

_available for `render` command_

[Set the ProRes profile](/docs/config#setproresprofile). This option is only valid if the [`codec`](#--codec) has been set to `prores`. Possible values: `4444-xq`, `4444`, `hq`, `standard`, `light`, `proxy`. See [here](https://video.stackexchange.com/a/14715) for explanation of possible values. Default: `hq`. Available since v2.1.6.

### `--crf`

_available for `render` command_

[To set Constant Rate Factor (CRF) of the output](/docs/config#setcrf). Minimum 0. Use this rate control mode if you want to keep the best quality and care less about the file size. Available since v1.4.

### `--browser-executable`

_available for `still`, `render` commands_

[Path to a Chrome executable](/docs/config#setbrowserexecutable). If not specified and Remotion cannot find one, it will download one during rendering. Available since v1.5.

### `--frames`

_available for `render` command_

[Render a still frame or a subset of a video](/docs/config#setframerange). Example: `--frames=0-9` (To select the first 10 frames) or `--frames=50` (To render a still of the 51st frame). Available since v2.0.

### `--frame`

_available for `still` command_

Which frame should be rendered when rendering a still. Example `--frame=10`. Default `0`. Available from v2.3

### `--bundle-cache`

_available for `still`, `render` commands_

[Enable or disable Webpack caching](/docs/config#setcachingenabled). This flag is enabled by default, use `--bundle-cache=false` to disable caching. Available since v2.0.

### `--log`

_available for `preview`, `still`, `render` commands_

[Set the log level](/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` (_default_), `verbose`

:::info
If you don't feel like passing command line flags every time, consider creating a `remotion.config.ts` [config file](/docs/config).
:::

### `--port`

_available for `preview`, `still`, `render` commands_

[Set a custom HTTP server port](/docs/config#setPort). If not defined, Remotion will try to find a free port.

### `--help`

Print the list of available CLI commands and flags.

## Example command

```
npx remotion render --codec=vp8 src/index.tsx HelloWorld out/video.webm
```

## Fig.io autocompletion

Fig adds visual apps, shortcuts, and autocomplete to your existing Terminal. The remotion autocompletion is available on Fig, try i with `npx remotion`, `remotion`, `yarn create video`. Useful if you have a memory lapse.

## See also

- [Render your video](/docs/render)
- [Configuration file](/docs/config)
