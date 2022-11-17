---
id: temporary-url
title: How to display a video in the Remotion Player before it's fully uploaded to a cloude storage.
---

## Problem

Lets say you are building a webapp where you want to enable your users to upload a Video which then gets displayed by the Remotion Player in your webapp. You choose to store the videos in a Amazon S3 Bucket. Each time a video gets uploaded, several seconds, sometimes even minutes pass untill your video is fully uploaded to the cloud and can be displayed in the player. Definitely not a great user experience. You would like to have your video ready to watch as soon as it gets provided by the client, without having to wait for the cloud to completely finish the upload.

Good news: This can be done pretty easily!

## Overview

Lets analyze the problem.

We will somwhere have a composition which returns a video tag that includes an url as source.

```tsx twoslash
const upload = async (file: File) => {
  return "https://example.com";
};
// ---cut---
import { AbsoluteFill, Sequence, Video } from "remotion";

type VideoProps = {
  videoUrl: string | null;
};

export const MyComposition: React.FC<VideoProps> = ({ videoUrl }) => {
  if (!videoUrl) {
    return null;
  }
  return (
    <AbsoluteFill>
      <Sequence>
        <Video src={videoUrl} />
      </Sequence>
    </AbsoluteFill>
  );
};
```

The videoUrl will be passed from the Remotion Player to our composition.
As soon as a file is fully uploaded to S3, the url will be set and can be used by the composition to display the video.

```tsx twoslash
const MyComposition: React.FC<{ videoUrl: string | null }> = (url) => {
  return null;
};
const upload = async (file: File) => {
  return "https://exampleName.s3.examplesRegion.amazonaws.com";
};
// ---cut---
import { Player } from "@remotion/player";
import { useState } from "react";

export const RemotionPlayer: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const handleChange = async (event: any) => {
    const file = event.target.files[0];
    //upload is an example function  & returns a url when a file is uploaded on S3.
    const s3Url = await upload(file);
    // E.g., s3Url = https://exampleBucketName.s3.ExampleAwsRegion.amazonaws.com
    setVideoUrl(s3Url);
  };

  return (
    <div>
      <Player
        component={MyComposition}
        durationInFrames={120}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        inputProps={{ videoUrl }}
      />

      <input type="file" onChange={handleChange} />
    </div>
  );
};
```

As mentioned, depending on the file size and available bandwidth, the uploading can take quite some time and we have to wait pretty long until the video can be displayed.

Therefore, lets see how we can solve this problem.

## Solution

When we start the upload of the file, we want to create a blob url which can be used by the composition to display the file residing on our clients system. Like this, the video can be displayed as soon as the file gets provided by the client. When the file is uploaded and we get the S3 url, the composition shall use the S3 url as source.

```tsx twoslash
const MyComposition: React.FC<{ url: string | null }> = (url) => {
  return null;
};
const upload = async (file: File) => {
  return "https://example.com";
};

// ---cut---
import { Player } from "@remotion/player";
import { useState } from "react";

type VideoUrl =
  | {
      type: "empty";
      url: null;
    }
  | {
      type: "blob" | "s3";
      url: string;
    };

export const RemotionPlayer: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<VideoUrl>({
    type: "empty",
    url: null,
  });

  const handleChange = async (event: any) => {
    const file = event.target.files[0];
    const blobUrl = URL.createObjectURL(file);
    setVideoUrl({ type: "blob", url: blobUrl });
    const s3Url = await upload(file);
    setVideoUrl({ type: "s3", url: s3Url });
  };

  return (
    <div>
      <Player
        component={MyComposition}
        durationInFrames={120}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        inputProps={{ url: videoUrl.url }}
      />

      <input type="file" onChange={handleChange} />
    </div>
  );
};
```

How does it work?

First, we create a new type called VideoUrl with which we can easily keep track what kind of url our videUrl state is at the moment (empty, blob or S3)

See how in `handleChange()` we now create a blob url simply with `URL.createObjectURL(file)` and set our `videoUrl` state
to type = "blob" and url = blobUrl. Like this, while we are still awaiting the S3 url, the Video will already be displayed in the Player with the blobUrl as source! Exactly what we wanted.
When the S3 url gets returned by our `upload()` function, the state will be updated with type = "S3" and url = S3url.
