---
id: render
title: Render your video
---

Now here comes the magic! Turn your creation into an MP4.

```bash
npm run build
```

The underlying command in package.json is defined as follows:

```bash
npx remotion render src/index.tsx HelloWorld out.mp4
```

Modify it to select a different video to render, or change its output location.
Learn about all the options on the [CLI reference page](/docs/cli).

## More ways to render a video

Remotion has a full-featured server-side rendering API. Read more about it on the [server-side rendering API](/docs/ssr).

You can also render a [video using a Github Action.](/docs/ssr#render-using-github-actions)

We are also working on a Serverless solution for rendering videos, [which is in private beta](/docs/ssr#rendering-a-video-using-serverless).

## See also

- [CLI options](/docs/cli)
