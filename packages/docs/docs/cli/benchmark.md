---
title: npx remotion benchmark
sidebar_label: benchmark
---

Allows you to benchmark your remotion version against a certain entry file. This command was added in v3.2.26. The only argument to pass is the entry file and codec:

```bash
npx remotion benchmark src/index.tsx --codec=h264
```

## Flags

### `--runs`

_optional. Default is 3_

Specify how many times video must be rendered. Default value is 3.

### `--compositions`

_optional. Default is `Main`_

Which compositions to render and benchmark. You can provide multiple composition IDs seperated by comma, ex: `npx remotion benchmark ./src/index --codec=h264 --compositions=Main,Canvas,CSS`

### `--concurrencies`

_optional_

You can specify which concurrency value should be used while rendering the video. Multiple concurrency values can be passed seperated by comma. Learn more about [concurrency](/docs/terminology#concurrency)

### `--codec`

Specify which codec the output should be rendered in. Learn [how to choose codec for your video](/docs/encoding/#choosing-a-codec)
