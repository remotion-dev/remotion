---
id: staticfile-relative-paths
title: staticFile() does not support relative paths
sidebar_label: staticFile() relative paths
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

Instead, pass the name of the file that is inside the public folder directly:

```tsx twoslash title="✅ Filename"
import { staticFile } from "remotion";
staticFile("image.png");
```

## See also

- [`staticFile()`](/docs/staticfile)
