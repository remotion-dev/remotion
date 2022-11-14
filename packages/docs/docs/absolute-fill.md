---
id: absolute-fill
title: <AbsoluteFill>
---

A helper component - it is an absolutely positioned `<div>` with the following styles:

```ts twoslash
import React from "react";
// ---cut---
const style: React.CSSProperties = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
};
```

## Adding a ref

You can add a [React ref](https://reactjs.org/docs/refs-and-the-dom.html) to an `<AbsoluteFill>` from version `v3.2.13` on. If you use TypeScript, you need to type it with `HTMLDivElement`:

```tsx twoslash
import { useRef } from "react";
import { AbsoluteFill } from "remotion";

const content = <div>Hello, World</div>;
// ---cut---
const MyComp = () => {
  const ref = useRef<HTMLDivElement>(null);
  return <AbsoluteFill ref={ref}>{content}</AbsoluteFill>;
};
```

## See also

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/AbsoluteFill.tsx)
