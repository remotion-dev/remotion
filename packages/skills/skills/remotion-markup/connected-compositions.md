# Connected compositions

Using the connected compositions pattern, a group of layers can get their own Studio timeline, like a precomposition in After Effects.

Use connected composition when a section has its own layers or timing, will be reused, or would be easier to edit and preview on its own.

1. Put the scene's markup in a named React component. Multiple internal layers and sequences can live inside it.
2. Prefer making the component interactive with `Interactive.withSchema({wrapInSequence: true})`, following [Remotion Interactivity](../remotion-interactivity/SKILL.md). Render the exported component directly in the parent with inline timing and editable props. It does not need an additional `<Sequence>` to connect to its registration. For consecutive scenes or transitions, render one direct instance as the only child of a `<Series.Sequence>` or `<TransitionSeries.Sequence>`. An explicit `<Sequence>` remains useful for components that do not handle timing or need dimension overrides.
3. Register the **same component reference** with `<Composition component={...}>` in the root. Give it a unique `id` and the dimensions, fps, and natural duration needed to preview the scene on its own. A `<Folder>` can keep scene compositions together.

```tsx
// MyVideo.tsx
import {Chapter} from './Chapter';

// Chapter is the exported Interactive.withSchema({wrapInSequence: true}) component.
export const MyVideo = () => (
  <>
    <Chapter name="Opening" durationInFrames={90} title="Introduction" />
    <Chapter name="Feature" from={90} durationInFrames={120} title="New features" />
  </>
);
```

```tsx
// Root.tsx
import {Composition, Folder} from 'remotion';
import {MyVideo} from './MyVideo';
import {Chapter} from './Chapter';

export const RemotionRoot = () => (
  <>
    <Folder name="MyVideo-Scenes">
      <Composition
        id="Chapter"
        component={Chapter}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={120}
        defaultProps={{title: 'Introduction'}}
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
Double-clicking a timeline item with one connected composition opens it at the corresponding frame.
Editing the shared component changes both views.

If the scene takes props, pass the intended values in the parent and use matching `defaultProps` on its standalone registration; registration does not automatically copy the parent's props.
Keep scene and parent fps and dimensions aligned unless their difference is intentional.

For a selection wrapped in a new `<Sequence layout="none">` with default timing, move a captured `useCurrentFrame()` call into the extracted component. Its clock is unchanged, and later `from` and `trimBefore` edits can control the local animation. `from` sets when the sequence appears; `trimBefore` sets the frame its children see at that start. Preserve timing props on any selected element inside the wrapper.

When extracting children from an existing timed sequence, compare the clock where a frame was originally read with the clock inside the extracted component. A child sees `(parentFrame - from) * playbackRate + trimBefore`. Do not add `trimBefore` just to make a parent frame expression match: it also changes the clock of every descendant. If the clocks differ and the timing or descendant behavior cannot be proven safe, use an agent refactor rather than the codemod. A registered composition must last through the highest child frame used by its parent sequence.

`durationInFrames` is measured in child frames. With `playbackRate={r}`, a non-looping sequence occupies `durationInFrames / r` frames in its parent timeline. A looping sequence repeats that many child frames per cycle. Account for `trimBefore` and the last visible child frame when setting the standalone composition's duration.
