---
image: /generated/articles-docs-motion-blur-common-mistake.png
title: Common mistake with <MotionBlur> and <Trail>
sidebar_label: Common mistake
---

The [`<Trail>`](/docs/motion-blur/trail) and [`<CameraMotionBlur>`](/docs/motion-blur/camera-motion-blur) components manipulate the React context that holds the current time.  
This means that the motion blur effect doesn't work if you use the [`useCurrentFrame()`](/docs/use-current-frame) hook outside of a motion blur component.

```tsx twoslash title="❌ Wrong - useCurrentFrame() outside of CameraMotionBlur"
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';

export const MyComp = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <CameraMotionBlur>
        <AbsoluteFill
          style={{
            backgroundColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: frame,
          }}
        >
          A
        </AbsoluteFill>
      </CameraMotionBlur>
    </AbsoluteFill>
  );
};
```

You can fix this by extracting the animation into a separate component:

```tsx twoslash title="✅ Correct - useCurrentFrame() inside the child component"
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';

const A: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: frame,
      }}
    >
      A
    </AbsoluteFill>
  );
};

export const MyComp = () => {
  return (
    <AbsoluteFill>
      <CameraMotionBlur>
        <A />
      </CameraMotionBlur>
    </AbsoluteFill>
  );
};
```

## See also

- [`<Trail>`](/docs/motion-blur/trail)
- [`<CameraMotionBlur>`](/docs/motion-blur/camera-motion-blur)
