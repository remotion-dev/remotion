---
name: text-highlights
description: Animated text highlights and hand-drawn annotations using @remotion/rough-notation.
metadata:
  tags: text, highlights, annotations, circles, rough-notation
---

# Text highlights

Use `@remotion/rough-notation` to draw animated annotations around or behind text. It supports highlights, circles, underlines, strike-throughs, crossed-off text, boxes, and brackets.

Docs: https://www.remotion.dev/docs/text-highlights

Install the package using the same Remotion version as the project:

```bash
bunx remotion add @remotion/rough-notation
```

Use `<AnnotationBehind>` for annotations that should appear behind the text, such as a marker highlight. Use `<AnnotationOnTop>` for circles, underlines, strike-throughs, crossed-off text, boxes, and brackets.

Drive `progress` from `useCurrentFrame()` so the annotation is deterministic and synchronized with the video:

```tsx
import {AnnotationBehind, AnnotationOnTop} from '@remotion/rough-notation';
import {interpolate, useCurrentFrame} from 'remotion';

export const TextAnnotations: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [15, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{fontSize: 80}}>
      This is{' '}
      <AnnotationBehind
        type="highlight"
        color="rgba(255, 236, 79, 0.62)"
        progress={progress}
      >
        important
      </AnnotationBehind>
      , and this is{' '}
      <AnnotationOnTop type="circle" color="#2563eb" progress={progress}>
        connected
      </AnnotationOnTop>
      .
    </div>
  );
};
```

Keep the annotated component inline with the surrounding text. Prefer annotating a word or short phrase rather than wrapping the full text block.
