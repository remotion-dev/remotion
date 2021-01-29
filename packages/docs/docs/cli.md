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
- `--concurrency`: How many CPU core threads to use. Minimum 1. The maximum is the amount of threads you have.
- `--png`: Render a PNG sequence with transparency instead. If you use this option, the output location you pass must be a folder name.

## See also

- [Render your video](render)
