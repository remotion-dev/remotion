---
id: temporary-url
title: Handling user video uploads
---

In a webapp where users can upload videos and edit them, we can create a better user experience by loading the video into a player even before the upload is finished. Good news: This can be done pretty easily!

## Allowing user uploads

We have a component which returns a [`<Video>`](/docs/video) tag that includes an URL as source.

```tsx twoslash title="MyComposition.tsx"
const upload = async (file: File) => {
  return "https://example.com";
};
// ---cut---
import { AbsoluteFill, Video } from "remotion";

type VideoProps = {
  videoURL: string;
};

export const MyComponent: React.FC<VideoProps> = ({ videoURL }) => {
  return (
    <AbsoluteFill>
      <Video src={videoURL} />
    </AbsoluteFill>
  );
};
```

The video URL will be passed from the Remotion Player to our component.  
Using a `<input type="file">` element, we allow a user upload.  
As soon as a file is fully uploaded to the cloud, the URL will be set and can be used by the component to display the video.

```tsx twoslash title="App.tsx"
import { useCallback } from "react";
const MyComposition: React.FC<{ videoUrl: string | null }> = (URL) => {
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

  const handleChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files === null) {
        return;
      }

      const file = event.target.files[0];
      //upload is an example function  & returns a URL when a file is uploaded on the cloud.
      const cloudURL = await upload(file);
      // E.g., cloudURL = https://exampleBucketName.s3.ExampleAwsRegion.amazonaws.com
      setVideoUrl(cloudURL);
    },
    []
  );

  return (
    <div>
      {videoUrl === null ? null : (
        <Player
          component={MyComposition}
          durationInFrames={120}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={30}
          inputProps={{ videoUrl }}
        />
      )}

      <input type="file" onChange={handleChange} />
    </div>
  );
};
```

The implementation of the `upload()` function is provider-specific and we do not show an implementation in this article. We assume it is a function that takes a file and returns an URL.

## Optimistic updates

When we start the upload of the file, we can create a blob URL which can be used to display the file residing on our clients system. Like this, the video can be displayed as soon as the file gets provided by the user. When the file is done uploading and we get the remote URL, the component shall use remote URL as source.

```tsx twoslash title="App.tsx"
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
  const [videoURL, setVideoUrl] = useState<VideoURL>({
    type: "empty",
  });

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) {
      return;
    }

    const file = event.target.files[0];
    const blobURL = URL.createObjectURL(file);
    setVideoUrl({ type: "blob", URL: blobURL });
    const cloudURL = await upload(file);
    setVideoUrl({ type: "cloud", URL: cloudURL });
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
