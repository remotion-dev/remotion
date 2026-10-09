# Connected compositions

Using the connected compositions pattern, a group of layers can get their own Studio timeline, like a precomposition in After Effects.

Use connected composition when a section has its own layers or timing, will be reused, or would be easier to edit and preview on its own.

1. Put the scene's markup in a named React component.
   Multiple internal layers and sequences can live inside it.

2. Prefer making the component interactive with `Interactive.withSchema({wrapInSequence: true, layout: 'absolute-fill'})`, following [Remotion Interactivity](../remotion-interactivity/SKILL.md).
   Render the exported component directly in the parent with inline timing and editable props.
   It does not need an additional `<Sequence>` to connect to its registration.
   For consecutive scenes or transitions, render one direct instance as the only child of a `<TransitionSeries.Sequence>`.
3. Register the **same component reference** with `<Composition component={...}>` in the root.
   Give it a unique `id` and the dimensions, fps, and natural duration needed to preview the scene on its own. A `<Folder>` can keep scene compositions together.

## Make the component independent of its parent

The parent is not mounted when a connected composition opens on its own.
Define required styles such as `fontFamily` inside the component, and avoid
parent-only context providers or mount side effects. Load custom fonts in its
module or a shared module it imports; see [Google fonts](google-fonts.md) and
[local fonts](local-fonts.md).

When extracting markup, carry over these dependencies. Verify its appearance
by opening it directly in a fresh Studio preview before opening the parent.

## Example

```tsx
// Chapter.tsx
import type React from 'react';
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
  type InteractivitySchema,
} from 'remotion';

type ChapterProps = {
  readonly title: string;
};

const ChapterInner: React.FC<ChapterProps> = ({title}) => {
  // Frame 0 is the start of this chapter, wherever the parent places it.
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      showInTimeline={false}
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        color: 'black',
        fontFamily: 'Helvetica, Arial, sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: 96,
          opacity: interpolate(frame, [0, 20], [0, 1], {
            extrapolateRight: 'clamp',
          }),
        }}
      >
        {title}
      </h1>
    </AbsoluteFill>
  );
};

const chapterSchema = {
  title: {type: 'string', default: '', description: 'Title'},
} as const satisfies InteractivitySchema;

export const Chapter = Interactive.withSchema({
  Component: ChapterInner,
  componentName: '<Chapter>',
  schema: chapterSchema,
  wrapInSequence: true,
  layout: 'absolute-fill',
});
```

`ChapterInner` only declares `title`. Its inner container handles the chapter's centering and background; the wrapper handles instance styles and timing.
Because of `wrapInSequence: true`, the exported `Chapter` additionally accepts the timing props of a `<Sequence>`: `from`, `durationInFrames`, `trimBefore`, `playbackRate`, `loop`, `freeze`, `hidden`, `name` and `showInTimeline`, plus `premountFor`, `postmountFor` and crop props.
These are handled by the wrapper and are not passed to `ChapterInner`.
See [Prefer interactive components with their own timelines](../remotion-interactivity/SKILL.md#prefer-interactive-components-with-their-own-timelines).

```tsx
// MyVideo.tsx
import {Chapter} from './Chapter';

export const MyVideo = () => (
  <>
    <Chapter name="Opening" durationInFrames={90} title="Introduction" />
    <Chapter
      name="Feature"
      from={90}
      durationInFrames={120}
      title="New features"
    />
  </>
);
```

```tsx title="src/Root.tsx"
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

Example: If user has `MyVideo` selected, they can see 2 layers in the timeline, and can double-click one to go to the `Chapter` composition.

If the scene takes props, pass the intended values in the parent and use matching `defaultProps` on its standalone registration; registration does not automatically copy the parent's props.
Keep scene and parent fps and dimensions aligned unless their difference is intentional.
