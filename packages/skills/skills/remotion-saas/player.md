---
name: player
description: Embed a Remotion preview in a React app with @remotion/player.
metadata:
  tags: remotion, player, preview, react
---

# Player

Use `@remotion/player` when the user wants an interactive preview in React and does not need to create an MP4, WebM, still image, or GIF in that flow.

Use this minimal example for Player setup, then link the API docs:

```tsx
import {Player} from '@remotion/player';
import {MyVideo} from './remotion/MyVideo';

export const App: React.FC = () => {
  return (
    <Player
      component={MyVideo}
      durationInFrames={120}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      controls
    />
  );
};
```

Important Player guidance:

- The Player renders an interactive preview in the browser; it does not create an MP4 by itself.
- The Player takes a component directly. Do not wrap it in `<Composition>`.
- Pass `durationInFrames`, `compositionWidth`, `compositionHeight`, and `fps` explicitly.
- If metadata is dynamic, sync the Player props manually or reuse the composition's `calculateMetadata()` logic. Link https://www.remotion.dev/docs/dynamic-metadata.md#with-the-player.
- Link the Player API page for all props: https://www.remotion.dev/docs/player/player.md.

For a SaaS app that also needs output files, combine the Player preview with [framework.md](framework.md) or [ssr.md](ssr.md).
