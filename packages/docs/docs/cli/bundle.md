---
image: /generated/articles-docs-cli-bundle.png
title: npx remotion bundle
sidebar_label: bundle
crumb: CLI Reference
---

_available from v4.0.89_

Creates a [Remotion Bundle](/docs/terminology#bundle) on the command line. Equivalent to the [`bundle()`](/docs/bundle) Node.JS API.

```bash
npx remotion bundle <entry-file?>
```

If `entry-file` is not passed, Remotion will try to detect the entry file with the following priority order:

1. Get the path from the Config (Can be set using `Config.setEntryPoint("<entry-point>")`).
2. Look for some common paths i.e. `src/index.ts`, `src/index.tsx`, `src/index.js`, `remotion/index.js`.
3. Fail as entry point could not be determined.

## Flags

### `--config`

Specify a location for the Remotion config file.

### `--log`

[Set the log level](/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` (_default_), `verbose`

### `--public-dir`

[Define the location of the `public/` directory.](/docs/config#setpublicdir). If not defined, Remotion will assume the location is the `public` folder in your Remotion root.

### `--out-dir`

Define the location of the resulting bundle. By default it is a folder called `./build`, adjacent to the [Remotion Root](/docs/terminology#remotion-root).
