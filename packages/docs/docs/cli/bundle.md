---
title: npx remotion bundle
sidebar_label: bundle
---

This command bundles your Remotion code into a website that you can use to:

- trigger a render locally without it bundling first
- Deploy it to the internet using a static site hosting provider (e.g. Netlify, S3, Vercel) and trigger a render using the URL

This is the equivalent of calling [`bundle()`](/docs/bundle) via the Node.JS APIs.

```bash
npx remotion bundle src/index.tsx
```

## Flags

### `--config`

Specify a location for the Remotion config file.

### `--bundle-cache`

[Enable or disable Webpack caching](/docs/config#setcachingenabled). This flag is enabled by default, use `--bundle-cache=false` to disable caching.

### `--log`

[Set the log level](/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` (_default_), `verbose`.

