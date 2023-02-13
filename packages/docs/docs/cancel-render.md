---
image: /generated/articles-docs-cancel-render.png
id: cancel-render
title: cancelRender()
sidebar_label: cancelRender()
crumb: "How to"
---

By invoking `cancelRender()`, Remotion will stop rendering all the frames, and not do any retries.

Pass a `string` or a `Error` (for best stack traces) to `cancelRender()` so you can identify the error when your render failed.

## Example

```tsx twoslash title="MyComposition.tsx"
import React, { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";

export const MyComp: React.FC = () => {
  const [handle] = useState(() => delayRender("Fetching audio data..."));

  useEffect(() => {
    fetch("https://example.com")
      .then(() => {
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, []);

  return null;
};
```

## See also

- [delayRender()](/docs/delay-render)
- [continueRender()](/docs/continue-render)
