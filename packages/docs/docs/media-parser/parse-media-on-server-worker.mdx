---
image: /generated/articles-docs-media-parser-parse-media-on-server-worker.png
id: parse-media-on-server-worker
title: parseMediaOnServerWorker()
slug: /media-parser/parse-media-on-server-worker
crumb: '@remotion/media-parser'
---

:::warning
[We are phasing out Media Parser and are moving to Mediabunny](/blog/mediabunny)!
:::

This API is the same as [`parseMediaOnWebWorker()`](/docs/media-parser/parse-media-on-web-worker), but besides reading from URLs and [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) objects, you can also pass file paths that will be read using the `fs` module.

This makes the function also work on the server, but incompatible with the browser.

Only Bun has support for [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker), while Node.js does not. That means that this function currently only makes sense if you want to run a media parse on Bun on a worker thread.

:::note
We do not test against Deno's `Worker` implementation.
:::

```tsx twoslash title="Parsing a video on a Bun Worker"
import {parseMediaOnServerWorker} from '@remotion/media-parser/server-worker';

const result = await parseMediaOnServerWorker({
  src: '/tmp/video.mp4',
  fields: {
    durationInSeconds: true,
    dimensions: true,
  },
});

console.log(result.durationInSeconds); // 10
console.log(result.dimensions); // {width: 1920, height: 1080}
```

## API

Same as [`parseMedia()`](/docs/media-parser/parse-media), but without the option to pass a [`reader`](/docs/media-parser/parse-media#reader).

The [`reader`](/docs/media-parser/parse-media#reader) option in the worker is hardcoded to [`universalReader`](/docs/media-parser/universal-reader).

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/media-parser/src/server-worker.module.ts)
- [`parseMedia()`](/docs/media-parser/parse-media)
- [`parseMediaOnWebWorker()`](/docs/media-parser/parse-media-on-web-worker)
