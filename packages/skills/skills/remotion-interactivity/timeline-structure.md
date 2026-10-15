# Timeline structure

Use timeline rows for content the user can meaningfully select, move, trim, or
style. A scene can contain separate text and media items, but its alignment
wrappers and decorative primitives do not each need a row.

## Choose one interactive owner per item

| Purpose                                                 | Preferred structure                                                                          |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Full-size scene or content group                        | `Interactive.create({layout: 'absolute-fill'})`, with a fragment inside                      |
| Reusable text, card, or SVG with its own bounds         | `Interactive.create({layout: 'none'})`, forwarding `style` to a plain visual root            |
| Individual text or graphic authored directly in a scene | A named `Interactive.H1`, `Interactive.P`, `Interactive.Div`, or appropriate media component |
| Alignment, mask, or clipping inside an item             | Plain `div`, `span`, or SVG element                                                          |
| Wrapper with no layout, timing, or grouping purpose     | Fragment or remove it                                                                        |
| Successive non-overlapping scenes or clips              | Named `Track` with timing directly on each child                                             |
| Scenes joined by transitions                            | `TransitionSeries` with its specialized sequence boundaries                                  |

Do not wrap a timing-aware component in `Sequence` just to schedule or name it.
Do not put an `Interactive.Div` around a media component just to position or
scale it when the media component accepts those styles directly.

Use named interactive groups for content that should move together, such as a
foreground group or a wall of repeated text. Use plain elements for repeated
primitives that are intentionally edited as part of that group, such as rings,
particles, or individual animated letters. Keep separate JSX nodes for items
that need independent editing.

## Reusable text owns its row and controls

An `Interactive.create()` text component already owns a timeline item. Its
inner root should normally be a plain `span`, `p`, or `div`, not another
interactive component representing the same text.

Expose content and typography on that owner. `Interactive.textSchema` supplies
typography controls; use `Interactive.childrenSchema` for React-node children
or an explicit string field for string-only text. Forward instance styles to
the visual root with `layout: 'none'`.

```tsx
import type React from 'react';
import {Interactive} from 'remotion';

const LabelInner = ({
  text,
  style,
}: {
  readonly text: string;
  readonly style?: React.CSSProperties;
}) => <span style={{display: 'inline-block', ...style}}>{text}</span>;

export const Label = Interactive.create({
  Component: LabelInner,
  layout: 'none',
  schema: {
    ...Interactive.textSchema,
    text: {type: 'string', default: '', description: 'Text'},
  },
});
```

At the call site, keep the name, timing, text, and editable styles inline:

```tsx
<Label
  name="Chapter title"
  from={30}
  durationInFrames={90}
  text="A new perspective"
  style={{fontSize: 80, fontWeight: 700, color: 'white'}}
/>
```

## Managed scene roots own layout

With `layout: 'absolute-fill'`, put instance `style`, `width`, and `height` on
the exported component. Do not declare or forward those props in its inner
component: the managed container owns them. Return a fragment unless an inner
container has an additional layout or grouping purpose.

Put editable scene backgrounds and alignment on the scene instance. Expose the
relevant schema fragments, such as `Interactive.backgroundSchema`. When the
scene is also a connected composition, register the same exported component
and provide equivalent inline `defaultProps` for its standalone appearance.
Registration defaults do not automatically apply to instances in the parent.

Custom transition presentations have a different owner: the transition
boundary already supplies their timing. Use plain positioned elements for
their masks and panels, and fragments for roots that only group children.
Adding interactive wrappers for those implementation details clutters the
timeline. Keep `TransitionSeries.Sequence` and its premounting behavior.

## Preserve behavior when removing wrappers

Wrapper removal changes CSS and frame contexts unless their responsibilities
are deliberately transferred:

- Move timing and names to the content owner without double-applying child
  offsets. Preserve local-frame animation semantics, dimensions, premounting,
  and transition overlap.
- Managed full-size roots clip overflow by default. Set
  `style={{overflow: 'visible'}}` where the old root allowed overflow.
- Preserve flex direction explicitly. `AbsoluteFill` uses a column, while a
  managed root does not imply that direction. This can change image sizing and
  child alignment even when both roots fill the same area.
- Preserve explicit width and height, percentage offsets, transform origins,
  and positioning contexts. In particular, a full-height container with
  `top: '50%'` is not equivalent to one stretched between that top and bottom.
- Check paint order after removing positioned wrappers. Text may need its own
  positioning to remain above absolutely positioned decoration.
- Keep inherited typography, background, and font loading available when a
  component is opened as a standalone connected composition.

Compare representative frames before and after, including scene and transition
boundaries. Inspect the Studio timeline for meaningful names and redundant
rows, and verify that text and style controls still target the intended item.
Investigate visual differences; do not dismiss them as harmless unless their
cause is understood, such as existing wall-clock-driven animation.
