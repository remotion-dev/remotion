---
title: npx remotion preview
sidebar_label: preview
---

Start the server which allows you to preview the Remotion video. The only argument to pass is the entry file:

```bash
npx remotion preview src/index.tsx
```

## Flags

### `--props`

[React Props to pass to the selected composition of your video.](/docs/parametrized-rendering#passing-input-props-in-the-cli) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`). Can also be read using [`getInputProps()`](/docs/get-input-props).

:::info
Inline JSON string isn't supported on Windows because it removes the `"` character, use a temporary file instead.
:::

### `--config`

Specify a location for the Remotion config file. Available in v1.2 and later.

### `--env-file`

Specify a location for a dotenv file. Default `.env`. Available in v2.2 and later.

### `--log`

[Set the log level](/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` (_default_), `verbose`

### `--port`

[Set a custom HTTP server port](/docs/config#setPort). If not defined, Remotion will try to find a free port.

### `--public-dir`

_Available from v3.2.13_

[Define the location of the `public/` directory.](/docs/config#setpublicdir). If not defined, Remotion will assume the location is the `public` folder in your Remotion root.

### `--disable-keyboard-shortcuts`

_Available from v3.2.11_

Disables all keyboard shortcuts in the Preview.
