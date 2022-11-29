---
title: "FPS converter"
crumb: "Snippets"
---

This snippet is useful if you have designed your video with a different frame rate than you want to render in the end. Wrap your markup in the `<FpsConverter>` component override the time of it's children to achieve a different FPS.

```tsx twoslash title="FpsConverter.tsx"
import React, { useContext, useMemo } from "react";
import { Internals, TimelineContextValue } from "remotion";

export const FpsConverter: React.FC<{
  originalFps: number;
  newFps: number;
  children: React.ReactNode;
}> = ({ originalFps, newFps, children }) => {
  const context = useContext(Internals.Timeline.TimelineContext);
  const ratio = originalFps / newFps;

  const value: TimelineContextValue = useMemo(() => {
    return {
      ...context,
      frame: context.frame * ratio,
    };
  }, [context, ratio]);

  return (
    <Internals.Timeline.TimelineContext.Provider value={value}>
      {children}
    </Internals.Timeline.TimelineContext.Provider>
  );
};
```

```tsx twoslash title="Usage"
// @filename: "MyComp.tsx"
export const MyComp = () => {
  return null;
};

// @filename: "FpsConverter.tsx"
import React, { useContext, useMemo } from "react";
import { Internals, TimelineContextValue } from "remotion";

export const FpsConverter: React.FC<{
  originalFps: number;
  newFps: number;
  children: React.ReactNode;
}> = ({ originalFps, newFps, children }) => {
  const context = useContext(Internals.Timeline.TimelineContext);
  const ratio = originalFps / newFps;

  const value: TimelineContextValue = useMemo(() => {
    return {
      ...context,
      frame: context.frame * ratio,
    };
  }, [context, ratio]);

  return (
    <Internals.Timeline.TimelineContext.Provider value={value}>
      {children}
    </Internals.Timeline.TimelineContext.Provider>
  );
};

// @filename: "index.tsx"
import { FpsConverter } from "./FpsConverter";
import { MyComp } from "./MyComp";
// ---cut---

export const Converted: React.FC = () => {
  return (
    <FpsConverter newFps={29.97} originalFps={60}>
      <MyComp></MyComp>
    </FpsConverter>
  );
};
```
