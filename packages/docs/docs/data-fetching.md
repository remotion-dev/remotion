---
id: data-fetching
title: Data fetching
---

One of the coolest things about Remotion is that you can fetch data from an API.

It works almost like you are used to: You can use the [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API to load data in a [`useEffect()`](https://reactjs.org/docs/hooks-effect.html) call and set a state.

## Telling Remotion to wait until the data is loaded

There are two functions, [`delayRender`](/docs/delay-render) and [`continueRender`](/docs/continue-render), which you can use to tell Remotion to not yet render the frame. If you want to asynchronously render a frame, you should call `delayRender()` as soon as possible, before the window `onload` event is fired. The function returns a handle that you need to give Remotion the green light to render later using `continueRender()`.

```tsx twoslash
import { useEffect, useCallback, useState } from "react";
import { continueRender, delayRender } from "remotion";

export const MyVideo = () => {
  const [data, setData] = useState(null);
  const [handle] = useState(() => delayRender());

  const fetchData = useCallback(async () => {
    const response = await fetch("http://example.com/api");
    const json = await response.json();
    setData(json);

    continueRender(handle);
  }, [handle]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      {data ? (
        <div>This video has data from an API! {JSON.stringify(data)}</div>
      ) : null}
    </div>
  );
};
```

## Best practices

During rendering, multiple tabs are opened to speed up rendering. In each of these tabs, the tree is re-rendered by changing the value of [`useCurrentFrame()`](/docs/use-current-frame) and then screenshotted.

- Each tab will execute the data fetching individually, so if you are rendering with a high concurrency, you may run into a rate limit.
- You can use the `localStorage` API to persist data after a network request and make a request only if the local storage is empty.
- The data returned by an API must be the same when called multiple times, otherwise [flickering](/docs/flickering) may apply.
- Consider fetching data before the render, and pass data as [input props](/docs/parametrized-rendering)

## Time limit

You need to clear all handles created by [`delayRender()`](/docs/delay-render) within 30 seconds after the page is opened. You may [increase the timeout](/docs/timeout#increase-timeout).

## Using `delayRender()` to calculate video metadata

You can also customize duration, frame rate and dimensions based on asynchronous data fetching:

- **See: [Dynamic duration, FPS & dimensions](/docs/dynamic-metadata)**

## See also

- [delayRender()](/docs/delay-render)
