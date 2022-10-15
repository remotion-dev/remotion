---
id: thumbnail
title: "<Thumbnail>"
---

A component which can be rendered in a regular React App (for example: [Create React App](https://create-react-app.dev/), [Next.JS](https://nextjs.org)) to display a thumbnail from a video.
This component share React props definition of the [`<Player>`](/player/api) component.

```tsx twoslash title="MyApp.tsx"
// @allowUmdGlobalAccess
// @filename: ./remotion/MyVideo.tsx
export const MyVideo = () => <></>;

// @filename: index.tsx
// ---cut---
import { Thumbnail } from "@remotion/player";
import { MyVideo } from "./remotion/MyVideo";

export const App: React.FC = () => {
  return (
    <Thumbnail
      component={MyVideo}
      durationInFrames={120}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
    />
  );
};
```




## See also

- [`<Composition>`](/docs/composition)
- [`<Player>`](/docs/player)