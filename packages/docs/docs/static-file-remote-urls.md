---
image: /generated/articles-docs-static-file-remote-urls.png
id: staticfile-remote-urls
title: staticFile() does not support remote URLs
sidebar_label: staticFile() remote URLs
crumb: "Troubleshooting"
---

If you got the following error message:

```
staticFile() does not support remote URLs. Instead, pass the URL without wrapping it in staticFile().
```

You have tried to pass a remote URL to `staticFile()`. You don't need to wrap the path in `staticFile`, you can pass it directly:

```tsx twoslash title="❌ Remote URL inside staticFile()"
import { Img, staticFile } from "remotion";

const MyComp = () => {
  return <Img src={staticFile("https://example.com/image.png")} />;
};
```

Instead, :

```tsx twoslash title="✅ Remote URL passed directly"
import { Img } from "remotion";

const MyComp = () => {
  return <Img src={"https://example.com/image.png"} />;
};
```

## See also

- [`staticFile()`](/docs/staticfile)
