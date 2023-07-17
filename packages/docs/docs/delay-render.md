---
image: /generated/articles-docs-delay-render.png
id: delay-render
title: delayRender() and continueRender()
sidebar_label: delayRender()
crumb: "How to"
---

By calling `delayRender()`, you are signaling that a frame should not be immediately rendered and instead should wait on an asynchronous task to complete.

This method is useful if you want to call an API to fetch data before you render.

`delayRender()` returns a handle. Once you have fetched data or finished the asynchronous task, you should call `continueRender(handle)` to let Remotion know that you are now ready to render.

## Example

```tsx twoslash {6, 13}
import { useCallback, useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

export const MyVideo = () => {
  const [data, setData] = useState(null);
  const [handle] = useState(() => delayRender());

  const fetchData = useCallback(async () => {
    const response = await fetch("http://example.com/api");
    const json = await response.json();
    setData(json);

    continueRender(handle);
  }, []);

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

## Timeout

You need to call `continueRender()` within 30 seconds of page load. This is the default timeout of puppeteer and it will throw if you miss to call `continueRender()`. You can [customize the timeout](/docs/timeout#increase-timeout).

If `continueRender()` is not called within the timeout frame, the render will fail with an exception similarly to this:

```
A delayRender() was called but not cleared after 28000ms. See https://remotion.dev/docs/timeout for help. The delayRender was called
```

See the [Timeout](/docs/timeout) page to troubleshoot timeouts.

## Adding a label<AvailableFrom v="2.6.13"/>

If you encounter a timeout and don't know where it came from, you can add a label as a parameter:

```tsx twoslash
import { delayRender } from "remotion";

// ---cut---

delayRender("Fetching data from API...");
```

If the call times out, the label will be referenced in the error message:

```
Uncaught Error: A delayRender() "Fetching data from API..." was called but not cleared after 28000ms. See https://remotion.dev/docs/timeout for help. The delayRender was called
```

## Concurrency

Multiple pages are used for rendering, so delayRender() can be called multiple times for a render. If you are doing an API request, you can speed up the render and avoid rate limits by caching the request, for example by storing the data in `localStorage`.

## Multiple calls

You can call `delayRender()` multiple times. The render will be blocked for as long as at least one blocking handle exists and that has not been cleared by `continueRender()`.

```tsx twoslash
import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

const MyComp: React.FC = () => {
  const [handle1] = useState(() => delayRender());
  const [handle2] = useState(() => delayRender());

  useEffect(() => {
    // You need to clear all handles before the render continues
    continueRender(handle1);
    continueRender(handle2);
  }, []);

  return null;
};
```

## Encapsulation

You should put `delayRender()` calls inside your components rather than placing them as a top-level statement, to avoid blocking a render if a different composition is rendered. Also, in the example below the call is wrapped in a `useState()` to avoid creating multiple blocking calls when the component rerenders.

```tsx twoslash title="❌ Don't do this" {4-7}
import { useEffect } from "react";
import { continueRender, delayRender } from "remotion";

// Don't call a delayRender() call outside a component -
// it will block the render if a different composition is rendered
// as well as block the fetching of the list of compositions.
const handle = delayRender();

const MyComp: React.FC = () => {
  useEffect(() => {
    continueRender(handle);
  }, []);

  return null;
};
```

## Failing with an error<AvailableFrom v="3.3.44" />

If your code fails to do an asynchronous operation and you want to cancel the render, you can call `cancelRender()` with an error message. This will automatically cancel all `delayRender()` calls to not further delay the render.

```tsx twoslash title="MyComposition.tsx"
import React, { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";

export const MyComp: React.FC = () => {
  const [handle] = useState(() => delayRender("Fetching data..."));

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

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/delay-render.ts)
- [Data fetching](/docs/data-fetching)
- [continueRender()](/docs/continue-render)
- [cancelRender()](/docs/cancel-render)
