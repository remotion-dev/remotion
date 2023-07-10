---
image: /generated/articles-docs-use-delay-render.png
id: use-delay-render
title: useDelayRender()
crumb: "API"
---

Same as [`delayRender()`](/docs/delay-render), but as a hook.

## Example

```tsx twoslash {6, 13, 14}
import { useCallback, useEffect, useState } from "react";
import { useDelayRender } from "remotion";

export const MyVideo = () => {
  const [data, setData] = useState(null);
  const continueRender = useDelayRender();

  const fetchData = useCallback(async () => {
    const response = await fetch("http://example.com/api");
    const json = await response.json();
    setData(json);

    continueRender();
  }, [continueRender]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {data ? (
        <div>This video has data from an API! {JSON.stringify(data)}</div>
      ) : null}
    </div>
  );
};
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/use-delay-render.ts)
- [Data fetching](/docs/data-fetching)
- [delayRender()](/docs/delay-render)
- [continueRender()](/docs/continue-render)
