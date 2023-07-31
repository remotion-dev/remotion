---
image: /generated/articles-docs-miscellaneous-snippets-use-delay-render.png
title: useDelayRender()
crumb: "Snippets"
---

Same as [`delayRender()`](/docs/delay-render), but as a hook.

## Snippet

```tsx twoslash title="use-delay-render.ts"
import { useCallback, useState } from "react";
import { continueRender, delayRender } from "remotion";

type ContinueRenderFnBound = () => void;

export const useDelayRender = (label?: string): ContinueRenderFnBound => {
  const [handle] = useState(() => delayRender(label));

  return useCallback(() => {
    continueRender(handle);
  }, [handle]);
};
```

## Example

```tsx twoslash {6, 13} title="MyComp.tsx"
import { continueRender, delayRender } from "remotion";

type ContinueRenderFnBound = () => void;

export const useDelayRender = (label?: string): ContinueRenderFnBound => {
  const [handle] = useState(() => delayRender(label));

  return useCallback(() => {
    continueRender(handle);
  }, [handle]);
};

// ---cut---

import { useCallback, useEffect, useState } from "react";

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

- [Data fetching](/docs/data-fetching)
- [delayRender()](/docs/delay-render)
- [continueRender()](/docs/continue-render)
