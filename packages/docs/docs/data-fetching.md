---
image: /generated/articles-docs-data-fetching.png
id: data-fetching
title: Data fetching
crumb: "How to"
---

## Fetching data before the render

You may use the [`calculateMetadata`](/docs/composition#calculatemetadata) prop of the [`<Composition />`](/docs/composition) component to alter the props that get passed to your React component.

```tsx twoslash
// ---cut---
import { useCallback } from "react";
import { Composition } from "remotion";

type MyVideoProps = {
  title: string;
  description: string;
};

const MyVideo: React.FC<MyVideoProps> = () => null;

export const Root: React.FC = () => {
  const calculateMyVideoMetadata = useCallback(async () => {
    const data = await fetch("http://example.com/api");
    const json = await data.json();

    return {
      props: json,
    };
  }, []);

  return (
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        title: "My video",
        description: "This is my video",
      }}
      calculateMetadata={calculateMyVideoMetadata}
    />
  );
};
```

## Fetching data during the render

Using [`delayRender()`](/docs/delay-render) and [`continueRender()`](/docs/continue-render) you can tell Remotion to wait for asynchronous operations to finish before rendering a frame.  
Call `delayRender()` as soon as possible, for example when initializing the state inside your component.

```tsx twoslash
import { useCallback, useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";

export const MyVideo = () => {
  const [data, setData] = useState(null);
  const [handle] = useState(() => delayRender());

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("http://example.com/api");
      const json = await response.json();
      setData(json);

      continueRender(handle);
    } catch (err) {
      cancelRender(err);
    }
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

Once the data is fetched, you can call [`continueRender()`](/docs/continue-render) to tell Remotion to continue rendering the video.  
In case the data fetching fails, you can call [`cancelRender()`](/docs/cancel-render) to cancel the render without waiting for the timeout.

## Time limit

You need to clear all handles created by [`delayRender()`](/docs/delay-render) within 30 seconds after the page is opened. You may [increase the timeout](/docs/timeout#increase-timeout).

## Prevent overfetching

During rendering, multiple headless browser tabs are opened to speed up rendering.  
This means that if you are fetching data inside your component, the data fetching will be executed multiple times.

<Step>1</Step> Each tab will execute the data fetching individually, so if you are rendering with a high concurrency, you may run into a rate limit. <br/>
<Step>2</Step> The data returned by an API must be the same when called multiple times, otherwise <a href="/docs/flickering">flickering</a> may occur. <br/>
<Step>3</Step> Consider fetching data before the render, and pass data as <a href="/docs/parametrized-rendering">input props</a> <br/>
<Step>4</Step> Make sure to not have <code>frame</code> as a dependency of the <code>useEffect()</code>, otherwise data will be fetched every frame leading to slowdown and potentially running into rate limits. <br/>

## See also

- [delayRender()](/docs/delay-render)
