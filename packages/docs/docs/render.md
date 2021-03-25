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

## See also

- [CLI options](/docs/cli)
