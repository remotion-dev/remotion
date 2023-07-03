---
image: /generated/articles-docs-dynamic-metadata.png
id: dynamic-metadata
title: Variable metadata
crumb: "How To"
---

You may change the duration of the video based on some asynchronously determined data.  
The same goes for the width, height and framerate of the video.

## Using the `calculateMetadata()` function<AvailableFrom v="4.0.0"/>

Consider a scenario where a video is dynamically specified as a background and the duration of the composition should be aligned with the duration of the video.

Pass a [`calculateMetadata`](/docs/composition#calculatemetadata) callback function to a [`<Composition>`](/docs/composition). This function should take the [combined props](/docs/props-resolution) and calculate the metadata.

```tsx twoslash title="src/Root.tsx"
import { getVideoMetadata } from "@remotion/media-utils";
import { Composition, Video } from "remotion";

type MyCompProps = {
  src: string;
};

const MyComp: React.FC<MyCompProps> = ({ src }) => {
  return <Video src={src} />;
};

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
        src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      }}
      calculateMetadata={async ({ props }) => {
        const data = await getVideoMetadata(props.src);

        return {
          durationInFrames: Math.floor(data.durationInSeconds * 30),
        };
      }}
    />
  );
};
```

The `props` defaults to the `defaultProps` specified, but may be overriden by [passing input props to the render](/docs/props-resolution).

Return an object with `durationInFrames` to change the duration of the video.
In addition or instead, you may also return `fps`, `width` and `height` to update the video's resolution and framerate.

It is also possible to transform the props [passed to the component by returning a `props` field](/docs/data-fetching) at the same time.

## With `useEffect()` and `getInputProps()`

In the following example, Remotion is instructed to wait for the [`getVideoMetadata()`](/docs/get-video-metadata) promise to resolve before evaluating the composition.

By calling [`delayRender()`](/docs/delay-render), Remotion will be blocked from proceeding until [`continueRender()`](/docs/continue-render) is called.

```tsx twoslash title="src/Root.tsx"
import { useEffect, useState } from "react";
import { Composition, continueRender, delayRender } from "remotion";
const VideoTesting: React.FC = () => null;
// ---cut---
import { getVideoMetadata } from "@remotion/media-utils";

export const Index: React.FC = () => {
  const [handle] = useState(() => delayRender());
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    getVideoMetadata(
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    )
      .then(({ durationInSeconds }) => {
        setDuration(Math.round(durationInSeconds * 30));
        continueRender(handle);
      })
      .catch((err) => {
        console.log(`Error fetching metadata: ${err}`);
      });
  }, [handle]);

  return (
    <Composition
      id="dynamic-duration"
      component={VideoTesting}
      width={1080}
      height={1080}
      fps={30}
      durationInFrames={duration}
    />
  );
};
```

To dynamically pass a video asset, you [may pass input props](/docs/props-resolution) when rendering and retrieve them inside your React code using [`getInputProps()`](/docs/get-input-props).

```tsx twoslash title="src/Root.tsx"
import { getInputProps } from "remotion";

const inputProps = getInputProps();
const src = inputProps.src;
```

### Drawbacks

This technique is not recommended anymore since v4.0, because the `useEffect()` does not only get executed when Remotion is initially calculating the metadata of the video, but also when spawning a render worker.

Since a render process might be highly concurrent, this might lead to unnecessary API calls and rate limitations.

## Using together with dimension overrides

Override parameters such as [`--width`](/docs/cli/render#--width) will be given priority and override the variable dimensions you set using `calculateMetadata()`.

The [`--scale`](/docs/scaling) parameter has the highest priority and will be applied after override parameters and `calculateMetadata()`.

## Changing dimensions and FPS after the video was designed

If you designed your video with certain dimensions and then want to render a different resolution (e.g. 4K instead of Full HD), you can use [output scaling](/docs/scaling).

If you designed your video with certain FPS and then want to change the frame rate, you can use the [`<FpsConverter>`](/docs/miscellaneous/snippets/fps-converter) snippet.

## With the `<Player>`

The [`<Player>`](/docs/player) will react if the metadata being passed to it changes. There are two viable ways to do dynamically set the metadata of the Player:

<p><Step>1</Step> Perform data fetching using <code>useEffect()</code>:</p>

```tsx twoslash title="MyApp.tsx"
import { getVideoMetadata } from "@remotion/media-utils";
import { useEffect, useState } from "react";

const VideoTesting: React.FC = () => null;
// ---cut---
import { Player } from "@remotion/player";

export const Index: React.FC = () => {
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    getVideoMetadata(
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    )
      .then(({ durationInSeconds }) => {
        setDuration(Math.round(durationInSeconds * 30));
      })
      .catch((err) => {
        console.log(`Error fetching metadata: ${err}`);
      });
  }, []);

  return (
    <Player
      component={VideoTesting}
      compositionWidth={1080}
      compositionHeight={1080}
      fps={30}
      durationInFrames={duration}
    />
  );
};
```

<p><Step>2</Step> Call your own <code>calculateMetadata()</code> function reused from your Remotion project:</p>

```tsx twoslash title="MyApp.tsx"
import { useEffect, useState } from "react";
import { CalculateMetadataFunction } from "remotion";

const VideoTesting: React.FC = () => null;

// ---cut---
import { Player } from "@remotion/player";

type Props = {};

const calculateMetadataFunction: CalculateMetadataFunction<Props> = () => {
  return {
    props: {},
    durationInFrames: 1,
    width: 100,
    height: 100,
    fps: 30,
  };
};

type Metadata = {
  durationInFrames: number;
  compositionWidth: number;
  compositionHeight: number;
  fps: number;
  props: Props;
};

export const Index: React.FC = () => {
  const [metadata, setMetadata] = useState<Metadata | null>(null);

  useEffect(() => {
    Promise.resolve(
      calculateMetadataFunction({
        defaultProps: {},
        props: {},
        abortSignal: new AbortController().signal,
      })
    )
      .then(({ durationInFrames, props, width, height, fps }) => {
        setMetadata({
          durationInFrames: durationInFrames as number,
          compositionWidth: width as number,
          compositionHeight: height as number,
          fps: fps as number,
          props: props as Props,
        });
      })
      .catch((err) => {
        console.log(`Error fetching metadata: ${err}`);
      });
  }, []);

  if (!metadata) {
    return null;
  }

  return <Player component={VideoTesting} {...metadata} />;
};
```

## See also

- [How props get resolved](/docs/props-resolution)
- [Data fetching](/docs/data-fetching)
