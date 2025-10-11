---
image: /generated/articles-docs-install-whisper-cpp-install-whisper-cpp.png
slug: install-whisper-cpp
title: installWhisperCpp()
crumb: '@remotion/install-whisper-cpp'
---

# installWhisperCpp()<AvailableFrom v="4.0.115"/>

Installs a Whisper.cpp version into a folder.

```tsx twoslash title="install-whisper.mjs"
import path from 'path';
import {installWhisperCpp} from '@remotion/install-whisper-cpp';

const {alreadyExisted} = await installWhisperCpp({
  to: path.join(process.cwd(), 'whisper.cpp'),
  version: '1.5.5', // A Whisper.cpp semver or git tag
});
```

## Which Whisper.cpp version to select?

- Generally, the source is cloned from Whisper.cpp GitHub and built.
- On Windows, a binary is downloaded. Only semantic version format (e.g. `1.5.4` is supported).
- On Windows, there are no binaries newer than `1.6.0` available.
- From `1.7.3` and later, `cmake` is required for Whisper.cpp to be built.

## Note this

- You should add the folder you install Whisper.cpp into to the `.gitignore` file.
- If the output folder already exists, the function will not do anything and return `{ alreadyExisted: true }`.
- You also need to download a model for Whisper.cpp to work. You can do this with the [`downloadWhisperModel()`](/docs/install-whisper-cpp/download-whisper-model) function.

## Options

### `to`

The folder to install Whisper.cpp into.

### `version`

The version of Whisper.cpp to install. Don't include the `v` prefix.
This can be either a hash of a Whisper.cpp commit or a semantic version of an official release.

:::info
On Windows, currently only release tags of Whisper.cpp are supported (e.g `1.5.4`).
:::

### `printOutput?`

Whether to print the output of the installation process to the console. Defaults to `true`.

### `signal?`<AvailableFrom v="4.0.156" />

A signal from an [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) to cancel the installation process.

## Return value

Returns a `Promise` that resolves to an object with the following property:

### `alreadyExisted`

Whether the folder already existed. If it did, and contains the necessary executable, the function did not perform any installation and returned `true`. If the executable is missing in the existing folder, the function expects manual deletion of the folder before attempting another installation.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/install-whisper-cpp/src/install-whisper-cpp.ts)
- [`@remotion/install-whisper-cpp`](/docs/install-whisper-cpp)
- [`@remotion/openai-whisper`](/docs/openai-whisper)
- [`downloadWhisperModel()`](/docs/install-whisper-cpp/download-whisper-model)
