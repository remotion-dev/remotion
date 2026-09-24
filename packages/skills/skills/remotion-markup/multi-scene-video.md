# Multi-scene videos

Put each substantial scene in its own component and file. Register those components as [connected compositions](connected-compositions.md) so each scene has an editable Studio timeline. The main video uses the same components as the sole direct children of its scene sequences.

Use `<TransitionSeries>` when the scenes may have transitions. Install `@remotion/transitions` if it is missing. Give each sequence an inline `durationInFrames` value so Studio can edit its timing. The component inside a sequence may contain as many layers and nested sequences as the scene needs.

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

Register `OpeningScene`, `FeatureScene`, and `MyVideo` as `<Composition>` entries in the root, as shown in [connected compositions](connected-compositions.md). Keep each scene's standalone metadata and `defaultProps` consistent with how it is used in the main video. With no transition, this example needs a 210-frame main composition. If you add a transition, account for its overlap in the main duration; see [transitions](transitions.md).

Use `<Series>` for consecutive scenes that do not need transitions. Use `<Sequence>` for scenes placed independently on the parent timeline.
