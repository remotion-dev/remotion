---
image: /generated/articles-docs-renderer-ensure-ffprobe.png
id: ensure-ffprobe
title: ensureFfprobe()
crumb: "@remotion/renderer"
---

_Available from v3.3, removed from v4.0_

:::warning
This API has been removed in v4.0 and is not necessary to call anymore. This page remains for archival purposes.
:::

Checks if the `ffprobe` binary is installed and if it is not, [downloads it and puts it into your `node_modules` folder](/docs/ffmpeg).

```ts title="ensure.mjs"
// @module: esnext
// @target: es2018
import { ensureFfprobe } from "@remotion/renderer";

await ensureFfprobe();
```

You might not need to call this function. Remotion will automatically download `ffprobe` if a render is attempted, and no binary was found.

This function is useful if you need `ffprobe` to be ready before the first render is started.

Also call [`ensureFfmpeg()`](/docs/renderer/ensure-ffmpeg) to get both binaries that Remotion requires.

## Options

Optionally, you can pass an object and pass the following options:

### `remotionRoot`

_string_

The directory in which your `node_modules` is located.

## Return value

A promise which resolves an object with the following properties:

- `wasAlreadyInstalled`: Boolean whether the binary was downloaded because of this function call.
- `result`: A string, either `found-in-path`, `found-in-node-modules` or `installed`.

## Exceptions

This function throws if no binary was found, the download fails or no binaries are available for your platform.

## See also

- CLI equivalent: [`npx remotion install ffprobe`](/docs/cli/install)
- [`ensureFfmpeg()`](/docs/renderer/ensure-ffmpeg)
- [Installing FFmpeg](/docs/ffmpeg)
