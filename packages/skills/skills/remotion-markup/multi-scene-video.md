# Multi-scene videos

Put each substantial scene in its own component and file.  
Register those components as [connected compositions](connected-compositions.md) so each scene has an editable Studio timeline.

Use `<TransitionSeries>` when the scenes may have transitions.  
Install `@remotion/transitions` if it is missing.  
Give each sequence an inline `durationInFrames` value so Studio can edit its timing.

Example:

```tsx
// MyVideo.tsx
import {TransitionSeries} from '@remotion/transitions';
import {OpeningScene} from './OpeningScene';
import {FeatureScene} from './FeatureScene';

export const MyVideo = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence
      name="Opening"
      durationInFrames={90}
    >
      <OpeningScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Sequence
      name="Feature"
      durationInFrames={120}
    >
      <FeatureScene />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
```

Register the same scene components, plus the parent video, in the root:

```tsx
// Root.tsx
import {Composition, Folder} from 'remotion';
import {OpeningScene} from './OpeningScene';
import {FeatureScene} from './FeatureScene';
import {MyVideo} from './MyVideo';

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

Keep each scene's standalone metadata and `defaultProps` consistent with how it is used in the main video.

With no transition, this example needs a 210-frame main composition. If you add a transition, account for its overlap in the main duration; see [transitions](transitions.md).

Use `<Series>` for consecutive scenes that do not need transitions. Use `<Sequence>` for scenes placed independently on the parent timeline.
