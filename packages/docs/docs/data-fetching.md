---
image: /generated/articles-docs-data-fetching.png
id: data-fetching
title: Data fetching
crumb: "How to"
---

In Remotion, you may fetch data from an API to use it in your video. On this page, we document recipes and best practices.

## Fetching data before the render<AvailableFrom v="4.0.0"/>

You may use the [`calculateMetadata`](/docs/composition#calculatemetadata) prop of the [`<Composition />`](/docs/composition) component to alter the props that get passed to your React component.

### When to use

The data being fetched using `calculateMetadata()` must be JSON-serializable. That means it is useful for API responses, but not for assets in binary format.

### Usage

Pass a callback function which takes the untransformed `props`, and return an object with the new props.

```tsx twoslash title="src/Root.tsx"
import { Composition } from "remotion";

type ApiResponse = {
  title: string;
  description: string;
};
type MyCompProps = {
  id: string;
  data: ApiResponse | null;
};

const MyComp: React.FC<MyCompProps> = () => null;

export const Root: React.FC = () => {
  return (
    <Composition
      id="MyComp"
      component={MyComp}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        id: "1",
        data: null,
      }}
      calculateMetadata={async ({ props }) => {
        const data = await fetch(`https://example.com/api/${props.id}`);
        const json = await data.json();

        return {
          props: {
            ...props,
            data: json,
          },
        };
      }}
    />
  );
};
```

The `props` being passed to `calculateMetadata()` are the [input props merged together with the default props](/docs/props-resolution). If you only want to fetch based on the default props, use the `defaultProps` also available in the same object.

The type of the untransformed input and the transformed output must be the same.  
Consider using a nullable type for your data and throw an error inside your component to deal with the `null` type:

```tsx twoslash title="MyComp.tsx"
type ApiResponse = {
  title: string;
  description: string;
};
// ---cut---
type MyCompProps = {
  id: string;
  data: ApiResponse | null;
};

const MyComp: React.FC<MyCompProps> = ({ data }) => {
  if (data === null) {
    throw new Error("Data was not fetched");
  }

  return <div>{data.title}</div>;
};
```

### TypeScript typing

You may use the `CalculateMetadataFunction` type from `remotion` to type your callback function. Pass as the generic value (`<>`) the type of your props.

```tsx twoslash title="src/Root.tsx"
type ApiResponse = {
  title: string;
  description: string;
};
type MyCompProps = {
  id: string;
  data: ApiResponse | null;
};

// ---cut---
import { CalculateMetadataFunction } from "remotion";

export const calculateMyCompMetadata: CalculateMetadataFunction<
  MyCompProps
> = async ({ props }) => {
  return {
    props: {
      ...props,
      data: {
        title: "Hello world",
        description: "This is a description",
      },
    },
  };
};

export const MyComp: React.FC<MyCompProps> = () => null;
```

### Colocation

Here is an example of how you could define a schema, a component and a fetcher function in the same file:

```tsx twoslash title="MyComp.tsx"
import { CalculateMetadataFunction } from "remotion";
import { z } from "zod";

const apiResponse = z.object({ title: z.string(), description: z.string() });

export const myCompSchema = z.object({
  id: z.string(),
  data: z.nullable(apiResponse),
});

type Props = z.infer<typeof myCompSchema>;

export const calcMyCompMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const data = await fetch(`https://example.com/api/${props.id}`);
  const json = await data.json();

  return {
    props: {
      ...props,
      data: json,
    },
  };
};

export const MyComp: React.FC<Props> = ({ data }) => {
  if (data === null) {
    throw new Error("Data was not fetched");
  }

  return <div>{data.title}</div>;
};
```

```tsx twoslash title="src/Root.tsx"
// @filename: src/MyComp.tsx
// organize-imports-ignore
import React from "react";
import { CalculateMetadataFunction } from "remotion";
import { z } from "zod";

const apiResponse = z.object({ title: z.string(), description: z.string() });

export const myCompSchema = z.object({
  id: z.string(),
  data: z.nullable(apiResponse),
});

type Props = z.infer<typeof myCompSchema>;

export const calcMyCompMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const data = await fetch(`https://example.com/api/${props.id}`);
  const json = await data.json();

  return {
    props: {
      ...props,
      data: json,
    },
  };
};

export const MyComp: React.FC<Props> = ({ data }) => {
  if (data === null) {
    throw new Error("Data was not fetched");
  }

  return <div>{data.title}</div>;
};

// @filename: src/Root.tsx
// ---cut---
import React from "react";
import { Composition } from "remotion";
import { MyComp, calcMyCompMetadata, myCompSchema } from "./MyComp";

export const Root = () => {
  return (
    <Composition
      id="MyComp"
      component={MyComp}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        id: "1",
        data: null,
      }}
      schema={myCompSchema}
      calculateMetadata={calcMyCompMetadata}
    />
  );
};
```

By implementing this pattern, The `id` in the [props editor](/docs/visual-editing) can now be tweaked and Remotion will refetch the data whenever it changes.

### Aborting stale requests

The props in the props editor may rapidly change for example by typing fast.  
It is a good practice to cancel requests which are stale using the `abortSignal` that gets passed to the [`calculateMetadata()`](/docs/composition#calculatemetadata) function:

```tsx twoslash title="src/Root.tsx" {3-6}
// ---cut---
import { CalculateMetadataFunction } from "remotion";

type ApiResponse = {
  title: string;
  description: string;
};
type MyCompProps = {
  id: string;
  data: ApiResponse | null;
};

// ---cut---
export const calculateMyCompMetadata: CalculateMetadataFunction<
  MyCompProps
> = async ({ props, abortSignal }) => {
  const data = await fetch(`https://example.com/api/${props.id}`, {
    signal: abortSignal,
  });
  const json = await data.json();

  return {
    props: {
      ...props,
      data: json,
    },
  };
};

export const MyComp: React.FC<MyCompProps> = () => null;
```

This `abortSignal` is created by Remotion using the [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) API.

## Fetching data during the render

Using [`delayRender()`](/docs/delay-render) and [`continueRender()`](/docs/continue-render) you can tell Remotion to wait for asynchronous operations to finish before rendering a frame.

### When to use

Use this approach to load assets which are not JSON serializable or if you are using a Remotion version lower than 4.0.

### Usage

Call [`delayRender()`](/docs/delay-render) as soon as possible, for example when initializing the state inside your component.

```tsx twoslash
import { useCallback, useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";

export const MyComp = () => {
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

### Time limit

You need to clear all handles created by [`delayRender()`](/docs/delay-render) within 30 seconds after the page is opened. You may [increase the timeout](/docs/timeout#increase-timeout).

### Prevent overfetching

During rendering, multiple headless browser tabs are opened to speed up rendering.  
In Remotion Lambda, the [rendering concurrency](/docs/lambda/concurrency) may be up to 200x.  
This means that if you are fetching data inside your component, the data fetching will be performed many times.

<Step>1</Step> Prefer fetching the data before render if possible. <br/>
<Step>2</Step> Ensure you are entitled to a high request rate without running into a rate limit.<br/>
<Step>3</Step> The data returned by the API must be the same on all threads, otherwise <a href="/docs/flickering">flickering</a> may occur. <br/>
<Step>4</Step> Make sure to not have <code>frame</code> as a dependency of the <code>useEffect()</code>, directly or indirectly, otherwise data will be fetched every frame leading to slowdown and potentially running into rate limits. <br/>

## See also

- [`delayRender()`](/docs/delay-render)
- [How props get resolved](/docs/props-resolution)
