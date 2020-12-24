---
id: render
title: Render your video
---

Now here comes the magic! Turn your creation into an MP4.

```bash
npm run build
```

The underlying command in package.json is defined as followed:

```bash
ts-node render.ts HelloWorld out.mp4
```

Modify it to select a different video to render, or change it's output location.
Learn about all the options on the [CLI reference page](cli).
