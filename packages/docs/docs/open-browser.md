---
title: openBrowser()
id: open-browser
slug: /renderer/open-browser
---

_Available since v3.0 - Part of the `@remotion/renderer` package._

Opens a Chrome or Chromium browser instance. By reusing an instance across [`renderFrames()`](/docs/renderer/render-frames), [`renderStill()`](/docs/renderer/render-still) and [`getCompositions()`](/docs/get-compositions) calls

```ts
const openBrowser: (
  browser: Browser,
  options: {
    shouldDumpIo?: boolean;
    browserExecutable?: BrowserExecutable;
  }
) => Promise<puppeteer.Browser>;
```

## Arguments

### `browser`

Currently the only valid option is `"chrome"`. This field is reserved for future compatibility with other browsers.

### `options?`

_optional_

An object containing one or more of the following options:

#### `shouldDumpIo?`

_optional_

If set to `true`, logs and other browser diagnostics are being printed to standard output. This setting is useful for debugging.

#### `browserExecutable?`

_optional_

A string defining the absolute path on disk of the browser executable that should be used. By default Remotion will try to detect it automatically and download one if none is available. If `puppeteerInstance` is defined, it will take precedence over `browserExecutable`.

## See also

- [Server-Side rendering](/docs/ssr)
