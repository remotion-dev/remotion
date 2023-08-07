---
image: /generated/articles-docs-get-static-files.png
id: getstaticfiles
title: getStaticFiles()
crumb: "API"
---

_Available from v3.3.26._

Gets an array containing all files in the `public/` folder. You can reference them by using [`staticFile()`](/docs/staticfile).

:::note
This feature does not work in the Remotion Player and returns an empty array.  
On Linux, watching for changes in subdirectories is only supported from Node.js v19.1.0. If you use a version earlier than that, you need to refresh the Remotion Studio browser tab manually.
:::

```tsx twoslash title="example.ts"
import { getStaticFiles, StaticFile, Video } from "remotion";

const files = getStaticFiles();
/*
[
  {
    "name": "video.mp4",
    "src": "/static-7n5spa/video.mp4",
    "sizeInBytes": 432944,
    "lastModified": 1670170466865
  },
  {
    "name": "assets/data.json",
    "src": "/static-7n5spa/assets/data.json",
    "sizeInBytes": 1311,
    "lastModified": 1670170486089
  },
]
*/

// ❗ Don't pass the `name` directly to the `src` of a media element
const videoName = files[0].name;

// ✅ Wrap it in staticFile() instead or use `src`
const videoSrc = files[0].src;

// Find a file by it's name and import it
const data = files.find((f) => {
  return f.name === "video.mp4";
}) as StaticFile; // Use `as StaticFile` to assert the file exists

// Use the `src` property to get a src to pass to a media element
<Video src={data.src} />;
```

## API

Takes no arguments and returns an array of object, each of which have three entries:

- `name`: The path relative to the public folder.
  :::note
  Contains forward slashes `/` even on Windows.
  :::note

- `src`: The path with a prefix. The prefix changes whenever the Studio server restarts.
- `sizeInBytes`: The file size. If it is a symbolic link, the file size of the original is reported.
- `lastModified`: Last modified date in Unix timestamp in milliseconds.

## Maximum files

For performance, only the first 1000 items are fetched and displayed.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/get-static-files.ts)
- [`staticFile()`](/docs/staticfile)
