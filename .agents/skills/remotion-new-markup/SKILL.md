---
name: remotion-new-markup
description: Write or refactor Remotion markup using components that inherit timing props and managed absolute-fill layouts. Use when choosing scene wrappers, replacing redundant Sequence or AbsoluteFill components, or reducing unnecessary Studio timeline layers.
---

# New Remotion Markup

## Put timing on the content component

Discourage direct use of `<Sequence>` in new markup. It provides timing
primitives that other components should inherit, rather than requiring an
additional wrapper around the content.

Use built-in interactive components, media components that support timing, or
custom components created with `Interactive.create()`.
Pass `from`, `durationInFrames`, `trimBefore`, `playbackRate`, and
`name` directly to the component that supports them.

Avoid wrapping one timing-aware component in a `<Sequence>` just to schedule
or name it. For custom components, prefer adding timing through
`Interactive.create()` instead of introducing another sequence at each
call site. Keep a direct `<Sequence>` only when a necessary timing boundary
cannot be expressed by the content components. Specialized containers such as
`<TransitionSeries.Sequence>` still serve their own sequencing behavior.

When removing an existing wrapper, preserve its timing, dimensions, and
premount behavior. Account for any timing already on the child; do not overwrite
it or apply offsets twice. Preserve the distinction between the component's
local frame and animation expressions evaluated in its parent.

## Use a managed full-size layout

Discourage `<AbsoluteFill>` as a scene or component wrapper. It often creates
an additional timeline layer that does not represent useful content. Prefer
`Interactive.create()` with
`layout: 'absolute-fill'`: the full-size container shares the component's
timeline item.

The inner component can return a fragment. Put instance styles, timing,
`width`, and `height` on the exported interactive component. Do not
declare `style`, `width`, or `height` props on the inner component when using
this layout; the wrapper owns them.

```tsx
import {Interactive, useVideoConfig} from 'remotion';

const SceneInner = ({title}: {readonly title: string}) => (
  <>
    <Interactive.H1 name="Title" style={{color: 'white', fontSize: 80}}>
      {title}
    </Interactive.H1>
  </>
);

export const Scene = Interactive.create({
  Component: SceneInner,
  schema: {
    title: {type: 'string', default: '', description: 'Title'},
    ...Interactive.backgroundSchema,
  },
  layout: 'absolute-fill',
});

export const MyVideo = () => {
  const {fps} = useVideoConfig();

  return <Scene name="Opening scene" from={fps} durationInFrames={3 * fps} title="A new perspective" style={{backgroundColor: '#111111'}} />;
};
```

The managed container clips overflow by default. Use
`style={{overflow: 'visible'}}` on the exported component when needed. Keep
additional layout containers only when they provide useful alignment, clipping,
or grouping that the managed root does not supply. Components with their own
bounds, such as text boxes or SVGs, can use the default `layout: 'none'` and
forward `style` to their visual root.

For further guidance, see [Remotion Interactivity](../remotion-interactivity/SKILL.md)
and the [Interactive.create() API](../../../packages/docs/docs/interactive-create.mdx).
