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

For a selection wrapped in a new `<Sequence layout="none">` with default timing, move a captured `useCurrentFrame()` call into the extracted component. Its clock is unchanged, and later `from` and `trimBefore` edits can control the local animation. `from` sets when the sequence appears; `trimBefore` sets the frame its children see at that start. Preserve timing props on any selected element inside the wrapper.

When extracting children from an existing timed sequence, compare the clock where a frame was originally read with the clock inside the extracted component. A child sees `(parentFrame - from) * playbackRate + trimBefore`. Do not add `trimBefore` just to make a parent frame expression match: it also changes the clock of every descendant. If the clocks differ and the timing or descendant behavior cannot be proven safe, use an agent refactor rather than the codemod. A registered composition must last through the highest child frame used by its parent sequence.
