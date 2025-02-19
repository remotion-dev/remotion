---
id: resolve-redirect
title: resolveRedirect()
crumb: "@remotion/player"
---

Follows the redirects of a URL (most commonly a remote video or audio) until the final URL is resolved and returns that.

If the resource does not support CORS, the function will throw. **If the resource redirects, and does not support CORS, you cannot preload the asset.**

```tsx twoslash
import { resolveRedirect } from "@remotion/preload";

resolveRedirect(
  "https://player.vimeo.com/external/291648067.hd.mp4?s=94998971682c6a3267e4cbd19d16a7b6c720f345&profile_id=175&oauth2_token_id=57447761"
)
  .then((src) => {
    console.log(src); // "https://vod-progressive.akamaized.net/..."
  })
  .catch((err) => {
    console.log("Could not resolve redirect", err);
  });
```

## Example: Resolve and preload a video

This snippet tries to preload a video on a best-effort basis. If the redirect cannot be resolved, it tries to preload the original URL.

```tsx twoslash
import { preloadVideo, resolveRedirect } from "@remotion/preload";
import { Video } from "remotion";

// This code gets executed immediately once the page loads
let urlToLoad =
  "https://player.vimeo.com/external/291648067.hd.mp4?s=94998971682c6a3267e4cbd19d16a7b6c720f345&profile_id=175&oauth2_token_id=57447761";

resolveRedirect(urlToLoad)
  .then((resolved) => {
    // Was able to resolve a redirect, setting this as the video to load
    urlToLoad = resolved;
  })
  .catch((err) => {
    // Was unable to resolve redirect e.g. due to no CORS support
    console.log("Could not resolve redirect", err);
  })
  .finally(() => {
    // In either case, we try to preload the original or resolved URL
    preloadVideo(urlToLoad);
  });

// This code only executes once the component gets mounted
const MyComp: React.FC = () => {
  // If the component did not mount immediately, this will be the resolved URL.

  // If the component mounted immediately, this will be the original URL.
  // In that case preloading is ineffective anyway.
  return <Video src={urlToLoad}></Video>;
};
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/preload/src/resolve-redirect.ts)
- [Installing `@remotion/preload`](/docs/preload)
- [preloadAudio()](/docs/preload/preload-audio)
- [preloadVideo()](/docs/preload/preload-video)
