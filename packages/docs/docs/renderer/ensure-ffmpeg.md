---
id: ensure-ffmpeg
title: ensureFfmpeg()
---

_Available from v3.3_

Checks if the `ffmpeg` binary is installed and if it is not, [downloads it and puts it into your `node_modules` folder](/docs/ffmpeg).

```ts twoslash title="ensure.mjs"
// @module: esnext
// @target: es2018
import { ensureFfmpeg } from "@remotion/renderer";

await ensureFfmpeg();
```

You might not need to call this function. Remotion will automatically download `ffmpeg` if a render is attempted, and no binary was found.

This function is useful if you need FFmpeg to be ready before the first render is started.

Also call [`ensureFfprobe()`](/docs/renderer/ensure-ffprobe) to get both binaries that Remotion requires.

## Options

Optionally, you can pass an object and pass the following options:

### `remotionRoot`

_string_

The directory in which your `node_modules` is locted.

## Return value

A promise which resolves an object with the following properties:

- `wasAlreadyInstalled`: Boolean whether the binary was downloaded because of this function call.
- `result`: A string, either `found-in-path`, `found-in-node-modules` or `installed`.

## Exceptions

This function throws if no binary was found, the download fails or no binaries are available for your platform.

## See also

- CLI equivalent: [`npx remotion install ffmpeg`](/docs/cli/install)
- [`ensureFfprobe()`](/docs/renderer/ensure-ffprobe)
- [Installing FFmpeg](/docs/ffmpeg)
