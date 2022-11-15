---
slug: apple-fireworks
title: Making the Apple fireworks tutorial
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Getting started

Start a new Remotion project and select the blank template:

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
]
}>
<TabItem value="npm">

```bash
npm init video
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm create video
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn create video
```

  </TabItem>
</Tabs>

## Create a background

Create a background by creating a new file `src/Background.tsx` and returning a linear gradient:

```tsx title="src/Background.tsx"
import React from "react";
import { AbsoluteFill } from "remotion";

export const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(to bottom, #000021, #010024)",
      }}
    />
  );
};
```

Return the background in your main composition `src/Composition.tsx`:

```tsx twoslash
// @filename: Background.tsx
export const Background: React.FC = () => null;

// @filename: Composition.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
// ---cut---

export const MyComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
    </AbsoluteFill>
  );
};
```
