---
name: video-report
description: Generate a report about a video
---

When a user reports a video not working, we should download the URL and put it as the `src` in `packages/example/src/NewVideo.tsx`.

Then, in `packages/example`, we should run `bunx remotion render NewVideo --log=verbose`.
