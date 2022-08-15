---
id: data-fetching
title: Data fetching
---

One of the most groundbreaking things about Remotion is that you can fetch data from an API to display in your video like you would in a regular React project. It works almost like you are used to: You can use the `fetch` API to load the data in a `useEffect` and set a state.

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

## Caching

It is important to know that in the render process, data fetching works on a per-frame basis. 
Every frame, every component is re-rendered by the _frame context_ modification and then screenshotted.
You should consider caching the result of your API, to avoid rate-limits and also to speed up the render of your video. We have two suggestions on how to do that:

- Use the `localStorage` API to persist data after a network request and make a request only if the local storage is empty.

- Fetch the data before the render, and store it as a JSON file, then import this JSON file.

## Time limit

You need to clear all handles created by `delayRender` within 30 seconds after the page is opened. This limit is imposed by Puppeteer, but makes a lot of sense as going over this limit would make the rendering process massively slow.

## Using `delayRender()` to calculate video metadata

You can also customize duration, frame rate and dimensions based on asynchronous data fetching:

- **See: [Dynamic duration, FPS & dimensions](/docs/dynamic-metadata)**

## See also

- [delayRender()](/docs/delay-render)
