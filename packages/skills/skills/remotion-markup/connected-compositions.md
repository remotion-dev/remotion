# Connected compositions

Using the connected compositions pattern, a group of layers can get their own Studio timeline, like a precomposition in After Effects.

Use connected composition when a section has its own layers or timing, will be reused, or would be easier to edit and preview on its own.

1. Put the scene's markup in a named React component. Multiple internal layers and sequences can live inside it.
2. Render exactly one direct instance of that component inside a `<Sequence>`, `<Series.Sequence>`, or `<TransitionSeries.Sequence>` in the parent.
3. Register the **same component reference** with `<Composition component={...}>` in the root. Give it a unique `id` and the dimensions, fps, and natural duration needed to preview the scene on its own. A `<Folder>` can keep scene compositions together.

```tsx
// MyVideo.tsx
import {Series} from 'remotion';
import {OpeningScene} from './OpeningScene';
import {FeatureScene} from './FeatureScene';

export const MyVideo = () => (
  <Series>
    <Series.Sequence
      name="Opening"
      durationInFrames={90}
    >
      <OpeningScene />
    </Series.Sequence>
    <Series.Sequence
      name="Feature"
      durationInFrames={120}
    >
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
      <Composition
        id="Opening"
        component={OpeningScene}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={90}
      />
      <Composition
        id="Feature"
        component={FeatureScene}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={120}
      />
    </Folder>
    <Composition
      id="MyVideo"
      component={MyVideo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={210}
    />
  </>
);
```

Studio replaces the layers with a reference to the connected composition in the timeline.
Double-clicking a sequence with one connected composition opens it at the corresponding frame.
Editing the shared component changes both views.

If the scene takes props, pass the intended values in the parent and use matching `defaultProps` on its standalone registration; registration does not automatically copy the parent's props.
Keep scene and parent fps and dimensions aligned unless their difference is intentional.
