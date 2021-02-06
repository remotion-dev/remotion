---
id: delay-render
title: delayRender() and continueRender()
sidebar_label: delayRender()
---

By calling `delayRender`, you are signaling that a frame should not be immediately rendered and instead should wait on an asynchronous task to complete.

This method is useful if you for example want to call an API to fetch data before you before you render.

`delayRender` returns an identifier. Once you have fetched data or finished the asynchronous task, you should call `continueRender(identifier)` to let Remotion know that you are now ready to render..

## Useful to know

- You need to call `continueRender()` within 30 seconds of page load. This is the default timeout of puppeteer and it will throw if you miss to call `continueRender()`.

- For every frame that is rendered, the whole page is reloaded, so the whole lifecycle of `delayRender` and `continueRender` happens on every frame. If you are doing an API request, you can speed up the render and avoid rate limits by caching the request, for example by storing the data in `localStorage`.

- You can call `delayRender` multiple times. The render will be blocked for as long as at least one blocking handle exists and that has not been cleared by `continueRender()`.

## Example

```tsx
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

const handle = delayRender();

export const MyVideo = () => {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    const response = await fetch('http://example.com/api');
    const json = await response.json();
    setData(json);

    continueRender(handle);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {data ? (
        <div>This video has data from an API! {JSON.stringify(data)}</div>
      ) : null}
    </div>
  );
}

```

## See also

- [Data fetching](data-fetching)
