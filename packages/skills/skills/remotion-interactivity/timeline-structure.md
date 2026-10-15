# Track + connected compositions

Use this structure for new compositions: a named `Track`, directly timed scene
instances, and connected compositions made with `Interactive.create()`. Set
`layout` explicitly: `'absolute-fill'` for scenes, `'none'` for bounded elements.

## 1. A bounded element: `layout: 'none'`

Forward `style` to a plain root. The custom component already owns its timeline row.

```tsx title="Title.tsx"
import type React from 'react';
import {Interactive} from 'remotion';

const TitleInner = ({
  text,
  style,
}: {
  readonly text: string;
  readonly style?: React.CSSProperties;
}) => <h1 style={{margin: 0, ...style}}>{text}</h1>;

export const Title = Interactive.create({
  Component: TitleInner,
  layout: 'none',
  schema: {
    ...Interactive.textSchema,
    text: {type: 'string', default: '', description: 'Text'},
  },
});
```

## 2. A scene: `layout: 'absolute-fill'`

Return a fragment. Put the background and alignment on the scene instance.
The managed root handles `style`, `width`, and `height`; do not forward them inside.

```tsx title="Chapter.tsx"
import {Interactive} from 'remotion';
import {Title} from './Title';

const ChapterInner = ({title}: {readonly title: string}) => (
  <>
    <Title
      name="Chapter title"
      text={title}
      style={{
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: 96,
        fontWeight: 700,
      }}
    />
  </>
);

export const Chapter = Interactive.create({
  Component: ChapterInner,
  layout: 'absolute-fill',
  schema: {
    ...Interactive.backgroundSchema,
    title: {type: 'string', default: '', description: 'Title'},
  },
});
```

## 3. The parent: `Track` + direct timing

Write each instance separately, with inline names, timing, props, and styles.
Do not add `Sequence` or `AbsoluteFill` wrappers.

```tsx title="MyVideo.tsx"
import {Track, useVideoConfig} from 'remotion';
import {Chapter} from './Chapter';

export const MyVideo = () => {
  const {fps} = useVideoConfig();

  return (
    <Track name="Chapters">
      <Chapter
        name="Opening"
        durationInFrames={3 * fps}
        title="Introduction"
        style={{
          backgroundColor: '#111111',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
      <Chapter
        name="Feature"
        from={3 * fps}
        durationInFrames={4 * fps}
        title="New features"
        style={{
          backgroundColor: '#243b53',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    </Track>
  );
};
```

## 4. Connect the same exported components

Register the scenes and reusable elements alongside the parent. Use the same
component references and give each registration usable inline defaults.

```tsx title="Root.tsx"
import {Composition, Folder} from 'remotion';
import {Chapter} from './Chapter';
import {MyVideo} from './MyVideo';
import {Title} from './Title';

export const RemotionRoot = () => (
  <>
    <Composition
      id="MyVideo"
      component={MyVideo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={210}
    />
    <Folder name="Scenes">
      <Composition
        id="Chapter"
        component={Chapter}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={90}
        defaultProps={{
          title: 'Introduction',
          style: {
            backgroundColor: '#111111',
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      />
    </Folder>
    <Folder name="Elements">
      <Composition
        id="Title"
        component={Title}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={90}
        defaultProps={{
          text: 'Introduction',
          style: {
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            fontSize: 96,
            fontWeight: 700,
          },
        }}
      />
    </Folder>
  </>
);
```

Double-click a chapter in the parent timeline to edit its connected composition.

For overlapping scene transitions, replace `Track` with
[`TransitionSeries`](../remotion-markup/transitions.md) and keep its specialized
sequence boundaries. Use plain HTML for layout-only masks and panels.

When refactoring, preserve timing and premounting. Match clipping, flex direction,
positioning, and paint order; managed roots clip by default. Compare representative
frames and open each connected composition on its own.
