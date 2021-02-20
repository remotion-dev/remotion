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
- `--pixel-format`: [Set a custom pixel format. See here for available values.](config#setpixelformat)
- `--config`: Specify a location for the Remotion config file.
- `--quality`: [Value between 0 and 100 for JPEG rendering quality](config#setquality). Doesn't work when `--png` is set.
- `--overwrite`: [Write to output even if file already exists.](config#setoverwriteoutput)
- `--format`: [Either `mp4`(is an alias for 'mp4-h264') or 'mp4-h264' or 'mp4-h265' or `png` or `webm-v8` or `webm-v9`](config#setoutputformat). If you don't supply `--format` flag `--format=mp4` is the default behaviour which uses the default h264 codec.

:::info
If you supply `--png` and `--format` flag both, `--format` flag will take precedence over `--png` flag.
:::
:::info
If you don't feel like passing command line flags every time, consider creating a `remotion.config.ts` [config file](config).
:::

## See also

- [Render your video](render)
- [Configuration file](config)
