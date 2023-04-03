---
image: /generated/articles-docs-static-file-relative-paths.png
id: staticfile-relative-paths
title: staticFile() does not support relative paths
sidebar_label: staticFile() relative paths
crumb: "Troubleshooting"
---

If you got the following error message:

```
staticFile() does not support relative paths. Instead, pass the name of a file that is inside the public/ folder.
```

You have tried to pass a relative path to `staticFile()`:

```tsx twoslash title="❌ Relative path"
import { staticFile } from "remotion";
staticFile("../public/image.png");
```

```tsx twoslash title="❌ File should not have ./ prefix"
import { staticFile } from "remotion";
staticFile("./image.png");
```

Or you tried to pass an absolute path:

```tsx twoslash title="❌ File should not use absolute paths"
import { staticFile } from "remotion";
staticFile("/Users/bob/remotion-project/public/image.png");
```

Or you tried to add a public/ fix which is unnecessary:

```tsx twoslash title="❌ File should not include the public/ prefix"
import { staticFile } from "remotion";
staticFile("public/image.png");
```

Instead, pass the name of the file that is inside the public folder directly:

```tsx twoslash title="✅ Filename"
import { staticFile } from "remotion";
staticFile("image.png");
```

## See also

- [`staticFile()`](/docs/staticfile)
