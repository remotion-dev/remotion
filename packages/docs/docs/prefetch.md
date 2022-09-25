---
id: prefetch
title: prefetch()
---

_Available in v3.2.23_

By calling `prefetch()`, an asset will be fetched and turned into a Blob URL using [`URL.createObjectURL()`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL).

If you pass the original URL into either an [`<Audio>`](/docs/audio), [`<Video>`](/docs/video), [`<OffthreadVideo>`](/docs/offthreadvideo) or [`<Img>`](/docs/img) tag and the asset is fully fetched, those components will use Blob URL instead.

:::note
Remote assets need to support [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

<details>
<summary>More info</summary>
<ul>
<li>
Remotion's origin is usually <code>http://localhost:3000</code>, but it may be different if rendering on Lambda or the port is busy.
</li>
<li>
You can <a href="/docs/chromium-flags#--disable-web-security">disable CORS</a> during renders.
</li>
</ul>
</details>
:::

```tsx twoslash
import { prefetch } from "remotion";

const { free, waitUntilDone } = prefetch("https://example.com/video.mp4");

waitUntilDone().then(() => {
  console.log("Video has finished loading");
});

// Call free() if you want to un-prefetch and free up the memory:
free();
```

This API is useful if you are using the [`<Player />`](/docs/player) component and you want to display a media asset and want to be sure it is fully loaded before it appears.

An alternative to `prefetch()` are the [`@remotion/preload`](/docs/preload) APIs. See [`@remotion/preload` vs `prefetch()`](/docs/player/preloading#remotionpreload-vs-prefetch) to decide which one is better for your usecase.

## API

The function takes a `src`, which can be a remote URL, an imported asset or an asset loaded using [`staticFile()`](/docs/staticfile) (see: [Importing assets](/docs/assets)). Once called, prefetching starts and an object with two properties are returned:

- `free()` will abort the prefetching and free up the memory. Components using the asset might re-request the asset
- `waitUntilDone()` will return a promise if called that resolves once asset has finished downloading and is ready to be using in [`<Audio>`](/docs/audio), [`<Video>`](/docs/video), [`<OffthreadVideo>`](/docs/offthreadvideo) or [`<Img>`](/docs/img).

## See also

- [`@remotion/preload`](/docs/preload)
- [`@remotion/preload` vs `prefetch()`](/docs/player/preloading#remotionpreload-vs-prefetch)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/prefetch.ts)
