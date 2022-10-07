---
title: npx remotion benchmark
sidebar_label: benchmark
---

_available from v3.2.28_

Allows you to benchmark your remotion version against a certain entry file. This command was added in v3.2.28. The only argument to pass is the entry file and codec:

```bash
npx remotion benchmark src/index.tsx [composition-name]
```

You can provide multiple composition IDs separated by comma, ex: `npx remotion benchmark ./src/index --codec=h264 Main,Canvas,CSS`

## Flags

### `--runs`

_optional. Default is 3_

Specify how many times video must be rendered. Default value is 3.

### `--concurrencies`

_optional_

You can specify which concurrency value should be used while rendering the video. Multiple concurrency values can be passed separated by comma. Learn more about [concurrency](/docs/terminology#concurrency)

### `--codec`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--codec)

### `--crf`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--crf)

### `--ffmpeg-executable`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--ffmpeg-executable)

### `--ffprobe-executable`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--ffprobe-executable)

### `--frames`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--frames)

### `--image-format`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--image-format)

### `--pixel-format`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--pixel-format)

### `--props`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--props)

### `--prores-profile`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--prores-profile)

### `--quality`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--quality)

### `--log`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--log)

### `--ignore-certificate-errors`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--ignore-certificate-errors)

### `--disable-web-security`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--disable-web-security)

### `--disable-headless`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--disable-headless)

### `--gl`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--gl)

### `--timeout`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--timeout)

### `--scale`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--scale)

### `--port`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--port)

### `--number-of-gif-loops`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--number-of-gif-loops)

### `--every-nth-frame`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--every-nth-frame)

### `--log`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--log)

### `--muted`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--muted)

### `--enforce-audio-track`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--enforce-audio-track)

### `--browser-executable`

_optional_

Inherited from [`npx remotion render`](/docs/cli/render#--browser-executable)
