---
title: CLI options
id: cli
---

The default command in package.json that powers `npm run build` is:

```bash
npx remotion render <entry-file> <composition-id> <output-location>
```

## Flags

Besides choosing a video and output location with the command line arguments, the following flags are supported:

- `--props`: React Props to pass to the root component of your video. Must be a serialized JSON string.
- `--concurrency`: [How many CPU threads to use.](config#setconcurrency) Minimum 1. The maximum is the amount of threads you have.
- `--png`: [Render a PNG sequence with transparency instead.](config#setoutputformat) If you use this option, the output location you pass must be a folder name.
- `--pixel-format`: [Set a custom pixel format. See here for available values.](config#setpixelformat)
- `--config`: Specify a location for the Remotion config file.
- `--quality`: [Value between 0 and 100 for JPEG rendering quality](config#setquality). Doesn't work when `--png` is set.
- `--overwrite`: [Write to output even if file already exists.](config#setoverwriteoutput)

:::info
If you don't feel like passing command line flags every time, consider creating a `remotion.config.ts` [config file](config).
:::

## See also

- [Render your video](render)
- [Configuration file](config)
