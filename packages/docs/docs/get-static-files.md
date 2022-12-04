---
image: /generated/articles-docs-get-static-files.png
id: getstaticfiles
title: getStaticFiles()
crumb: "API"
---

_Available from v3.3.7._

Gets an array containing all files in the `public/` folder. You can reference them by using [`staticFile()`](/docs/staticfile).

```tsx twoslash
import { getStaticFiles, staticFile } from "remotion";

const files = getStaticFiles();
/*
[
  {
    "path": "video.mp4",
    "sizeInBytes": 432944,
    "lastModified": 1670170466865
  },
  {
    "path": "assets/data.json",
    "sizeInBytes": 1311,
    "lastModified": 1670170486089
  },
]
*/

const videoSrc = staticFile(files[0].path); // Don't forget to wrap the path in staticFile() still!
const dataSrc = staticFile(
  files.find((f) => f.path === "assets/data.json") as string
); // Use `as string` to assure a file is valid
```

## API

Takes no arguments and returns an array of object, each of which have three entries:

- `path`: The path relative to the public folder. Contains forward slashes `/` even on Windows.
- `sizeInBytes`: The file size. If it is a symbolic link, the file size of the original is reported.
- `lastModified`: Last modified date in Unix timestamp in milliseconds.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/get-static-files.ts)
- [`staticFile()`](/docs/staticfile)
