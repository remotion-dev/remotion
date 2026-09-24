# BUG: OffthreadVideo hides ERR_CONNECTION_RESET from the renderer's retry

- Date: 2026-09-24 (AEST)
- Component: `remotion` 4.0.527, `OffthreadVideoForRendering` (dist/esm/index.mjs ~L13113) and `@remotion/renderer` `render-frame-and-retry-target-close.js`
- Severity: medium. A 5,366-frame render (MortgageReel, ty-do) died at frame 2377 after ~6 minutes; a rerun of frames 2340-2420 alone succeeded.

## Observed

```
Browser failed to load http://localhost:3000/proxy?src=...source.mp4&time=109.66333333333327&transparent=false&toneMapped=true (Fetch): net::ERR_CONNECTION_RESET
An error occurred while rendering frame 2377:
Error Failed to fetch http://localhost:3000/proxy?src=...&time=109.62666666666661&... This could be caused by Chrome rejecting the request because the disk space is low.
```

Disk had 1.3 TB free.

## Documented vs observed

The renderer treats `ERR_CONNECTION_RESET` as a flaky network error and retries the frame (`isFlakyNetworkError` in `browser/flaky-errors.js`). But OffthreadVideo catches the fetch's `TypeError: Failed to fetch`, replaces the message with the disk-space hint and calls `cancelRender`, so the error reaching the renderer contains neither `ERR_CONNECTION_RESET` nor the delayRender retry token, and the render aborts on the first transient reset.

## A correct result

1. A `Failed to fetch` from the OffthreadVideo frame server during rendering is retried like other flaky network errors (or carries the original `net::` code in its message).
2. The disk-space hint is not the only text in the error when free disk space is ample.
3. A single transient reset does not abort a long render.

## Workaround in this repo

`retryVideoFetch` in `src/mortgage/style.ts`: OffthreadVideo gets an `onError` that only logs, plus `delayRenderRetries: 2`, so the stuck frame times out (30 s) and the renderer retries it via the delayRender retry token.
