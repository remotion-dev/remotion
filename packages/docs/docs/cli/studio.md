---
image: /generated/articles-docs-cli-studio.png
title: npx remotion studio
sidebar_label: studio
crumb: CLI Reference
---

_Alias: npx remotion preview_

Start the Remotion Studio. The only argument to pass is the entry file:

```bash
npx remotion studio <entry-file>
```

If `entry-file` is not passed, Remotion will try to detect the entry file with the following priority order:

1. Get the path from the Config (Can be set using `Config.setEntryPoint("<entry-point>")`).
2. Look for some common paths i.e. `src/index.ts`, `src/index.tsx`, `src/index.js`, `remotion/index.js`.
3. Fail as entry point could not be determined.

## Flags

### `--props`

[React Props to pass to the selected composition of your video.](/docs/parametrized-rendering#passing-input-props-in-the-cli) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`). Can also be read using [`getInputProps()`](/docs/get-input-props).

:::info
Inline JSON string isn't supported on Windows because it removes the `"` character, use a temporary file instead.
:::

### `--config`<AvailableFrom v="1.2.0" />

Specify a location for the Remotion config file.

### `--env-file`<AvailableFrom v="2.2.0" />

Specify a location for a dotenv file - Default `.env`. [Read about how environment variables work in Remotion.](/docs/env-variables)

### `--log`

[Set the log level](/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` (_default_), `verbose`

### `--port`

[Set a custom HTTP server port](/docs/config#setPort). If not defined, Remotion will try to find a free port.

### `--public-dir`<AvailableFrom v="3.2.13" />

[Define the location of the `public/` directory.](/docs/config#setpublicdir). If not defined, Remotion will assume the location is the `public` folder in your Remotion root.

### `--disable-keyboard-shortcuts`<AvailableFrom v="3.2.11" />

[Disables all keyboard shortcuts in the Studio](/docs/config#setkeyboardshortcutsenabled).

### `--webpack-poll`<AvailableFrom v="3.3.11" />

[Enables Webpack polling](/docs/config#setwebpackpollinginmilliseconds) instead of the file system event listeners for hot reloading. This is useful if you are inside a virtual machine or have a remote file system.
Pass a value in milliseconds, for example `--webpack-poll=1000`.

### `--no-open`<AvailableFrom v="3.3.19" />

[Prevents Remotion from trying to open a browser](/docs/config#setshouldopenbrowser). This is useful if you use a different browser for Remotion than the operating system default.

### `--browser`<AvailableFrom v="3.3.79" />

Specify the browser which should be used for opening tab - using the default browser by default.  
Pass an absolute string or `"chrome"` to use Chrome.
If Chrome is selected as the browser and you are on macOS, Remotion will try to reuse an existing tab

For backwards compatibility, the `BROWSER` environment variable is also supported.

### `--browser-args`<AvailableFrom v="3.3.79" />

A set of command line flags that should be passed to the browser. Pass them like this:

```console
npx remotion studio --browser-args="--disable-web-security"
```
