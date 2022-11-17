---
id: temporary-url
title: How to display a video in the Remotion Player before it's fully uploaded to a cloud storage.
---

## Problem

Lets say you are building a webapp where you want to enable your users to upload a Video which then gets displayed by the Remotion Player in your webapp. You choose to store the video in a cloud. Each time a video gets uploaded, several seconds, sometimes even minutes pass untill your video is fully uploaded to the cloud and can be displayed in the player. Definitely not a great user experience. You would like to have your video ready to watch as soon as it gets provided by the client, without having to wait for the cloud to completely finish the upload.

Good news: This can be done pretty easily!

## Overview

Lets analyze the problem.

We will somewhere have a component which returns a video tag that includes an URL as source.

```tsx twoslash
const upload = async (file: File) => {
  return "https://example.com";
};
// ---cut---
import { AbsoluteFill, Sequence, Video } from "remotion";

type VideoProps = {
  videoURL: string | null;
};

export const MyComponent: React.FC<VideoProps> = ({ videoURL }) => {
  if (!videoURL) {
    return null;
  }
  return (
    <AbsoluteFill>
      <Sequence>
        <Video src={videoURL} />
      </Sequence>
    </AbsoluteFill>
  );
};
```

The videoURL will be passed from the Remotion Player to our component.
As soon as a file is fully uploaded to the cloud, the URL will be set and can be used by the component to display the video.

```tsx twoslash
import { useCallback } from "react";
const MyComposition: React.FC<{ videoURL: string | null }> = (URL) => {
  return null;
};
const upload = async (file: File) => {
  return "https://exampleName.s3.examplesRegion.amazonaws.com";
};
// ---cut---
import { Player } from "@remotion/player";
import { useState } from "react";

export const RemotionPlayer: React.FC = () => {
  const [videoURL, setVideoURL] = useState<string | null>(null);

  const handleChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files === null) {
        return;
      }

      const file = event.target.files[0];
      //upload is an example function  & returns a URL when a file is uploaded on the cloud.
      const cloudURL = await upload(file);
      // E.g., cloudURL = https://exampleBucketName.s3.ExampleAwsRegion.amazonaws.com
      setVideoURL(cloudURL);
    },
    []
  );

  return (
    <div>
      <Player
        component={MyComposition}
        durationInFrames={120}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        inputProps={{ videoURL }}
      />

      <input type="file" onChange={handleChange} />
    </div>
  );
};
```

## Solution

When we start the upload of the file, we want to create a blob URL which can be used by the composition to display the file residing on our clients system. Like this, the video can be displayed as soon as the file gets provided by the client. When the file is uploaded and we get the S3 URL, the composition shall use the S3 URL as source.

```tsx twoslash
const MyComposition: React.FC<{ URL: string | null }> = (URL) => {
  return null;
};
const upload = async (file: File) => {
  return "https://example.com";
};

// ---cut---
import { Player } from "@remotion/player";
import { useState } from "react";

type VideoURL =
  | {
      type: "empty";
    }
  | {
      type: "blob" | "cloud";
      URL: string;
    };

export const RemotionPlayer: React.FC = () => {
  const [videoURL, setVideoURL] = useState<VideoURL>({
    type: "empty",
  });

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) {
      return;
    }

    const file = event.target.files[0];
    const blobURL = URL.createObjectURL(file);
    setVideoURL({ type: "blob", URL: blobURL });
    const cloudURL = await upload(file);
    setVideoURL({ type: "cloud", URL: cloudURL });
    URL.revokeObjectURL(blobURL);
  };
  const deriveURL = () => {
    if (videoURL.type === "empty") {
      return null;
    }
    return videoURL.URL;
  };

  return (
    <div>
      <Player
        component={MyComposition}
        durationInFrames={120}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        inputProps={{ URL: deriveURL() }}
      />

      <input type="file" onChange={handleChange} />
    </div>
  );
};
```

How does it work?

First, we create a new type called VideoURL with which we can easily keep track what kind of URL our videURL state is at the moment (empty, blob or cloud)

See how in `handleChange()` we now create a blob URL simply with `URL.createObjectURL(file)` and set our `videoURL` state
to type = "blob" and URL = blobURL. Like this, while we are still awaiting the cloud URL, the Video will already be displayed in the Player with the blobURL as source! Exactly what we wanted.
When the cloud URL gets returned by our `upload()` function, the state will be updated with type = "cloud" and URL = cloudURL and the player will automatically use the cloudURL as new source.
