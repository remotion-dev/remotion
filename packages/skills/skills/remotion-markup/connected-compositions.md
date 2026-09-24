---
name: connected-compositions
description: Structure scenes as connected compositions for editing in Remotion Studio
metadata:
  tags: composition, scene, sequence, studio, precompose
---

# Connected compositions

A connected composition gives a scene or group of layers its own Studio timeline, like a precomposition in After Effects. The parent renders the scene component directly; the separate `<Composition>` registration makes that same component available for focused editing and navigation. It does not render an intermediate video file.

## When to use this structure

Prefer a connected composition when a section has its own layers or timing, will be reused, or would be easier to edit and preview on its own. This is the default structure for substantial scenes in a multi-scene video. Keep small, one-off elements in the parent timeline when a separate composition would add navigation without making editing easier.

## Markup pattern

1. Put the scene's markup in a named React component. Multiple internal layers and sequences can live inside it.
2. Render exactly one direct instance of that component inside a `<Sequence>`, `<Series.Sequence>`, or `<TransitionSeries.Sequence>` in the parent. Give the sequence a descriptive `name` and explicit timing.
3. Register the **same component reference** with `<Composition component={...}>` in the root. Give it a unique `id` and the dimensions, fps, and natural duration needed to preview the scene on its own. A `<Folder>` can keep scene compositions together.

```tsx
// MyVideo.tsx
import {Series} from 'remotion';
import {OpeningScene} from './OpeningScene';
import {FeatureScene} from './FeatureScene';

export const MyVideo = () => (
  <Series>
    <Series.Sequence name="Opening" durationInFrames={90}>
      <OpeningScene />
    </Series.Sequence>
    <Series.Sequence name="Feature" durationInFrames={120}>
      <FeatureScene />
    </Series.Sequence>
  </Series>
);
```

```tsx
// Root.tsx
import {Composition, Folder} from 'remotion';
import {MyVideo} from './MyVideo';
import {OpeningScene} from './OpeningScene';
import {FeatureScene} from './FeatureScene';

export const RemotionRoot = () => (
  <>
    <Folder name="MyVideo-Scenes">
      <Composition id="Opening" component={OpeningScene} width={1920} height={1080} fps={30} durationInFrames={90} />
      <Composition id="Feature" component={FeatureScene} width={1920} height={1080} fps={30} durationInFrames={120} />
    </Folder>
    <Composition id="MyVideo" component={MyVideo} width={1920} height={1080} fps={30} durationInFrames={210} />
  </>
);
```

Use the same direct-child pattern with `<TransitionSeries.Sequence>` when the scenes have transitions. Use `<Sequence>` for an independently positioned scene or group. A connected scene can contain many elements; only its parent sequence needs a single direct child.

The connection requires the direct child to be the registered component itself. A fragment, DOM wrapper, multiple children, or a different wrapper component between the sequence and that component prevents the match. If several compositions register the same component, Studio finds several connections; give a scene one composition registration when you want double-click to open it directly.

Studio shows the connected composition on the parent timeline and in the sequence inspector. Double-clicking a sequence with one connected composition opens it at the corresponding frame. Editing the shared component changes both views. If the scene takes props, pass the intended values in the parent and use matching `defaultProps` on its standalone registration; registration does not automatically copy the parent's props. Keep scene and parent fps and dimensions aligned unless their difference is intentional.
