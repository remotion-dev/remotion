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

## Frame setup

In your newly created Remotion project you go into the `src/Root.tsx` file and adjust the frame width and height like this:

```tsx title="src/Background.tsx"
import { Composition } from "remotion";
import { MyComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
```

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

This results to the following:

<img src="/img/apple-wow-tutorial/Background.png"/>

## Cricle as a React component

Render a white circle by creating a new file `src/Dot.tsx` and returning a React component which contains the characterists of our circle, e.g. centered.

```tsx title="src/Dot.tsx"
import React from "react";
import { AbsoluteFill } from "remotion";

export const Dot: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          height: 14,
          width: 14,
          borderRadius: 14 / 2,
          backgroundColor: "#ccc",
        }}
      />
    </AbsoluteFill>
  );
};
```

Return the circle in your main composition `src/Composition.tsx`:

```tsx
// @filename: Dot.tsx
export const Dot: React.FC = () => null;

// @filename: Composition.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { Dot } from "./Dot";
// ---cut---

export const MyComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Dot />
    </AbsoluteFill>
  );
};
```

Now we got the white dot on top of our Background:
<img src="/img/apple-wow-tutorial/Dot.png"/>

## Animate the dot

Let's apply some animation on the white circle we created above. We create another component called `<Schrinking>` in a new file `src/Shrinking.tsx`, which then wraps the circle in the main composition `src/Composition.tsx`.

```tsx title="src/Shrinking.tsx"
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const Shrinking: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        scale: String(
          interpolate(frame, [60, 90], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        ),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
```

Return the `<Shrinking>`component in your main composition `src/Composition.tsx`:

```tsx
// @filename: Shrinking.tsx
export const Shrinking: React.FC = () => null;

// @filename: Composition.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { Dot } from "./Dot";
import { Shrinking } from "./Shrinking";

// ---cut---

export const MyComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Shrinking>
        <Dot />
      </Shrinking>
    </AbsoluteFill>
  );
};
```

Now we have some action to show:
<img src="/img/apple-wow-tutorial/Shrinking.gif"/>

## Move the dot

Now combine the `<Shrinking>` from above with a component called `<Move>`. This component has a spring animation which by default goes from zero to one and has a duration of four seconds (durationInFrames: 120) in the code snipped below defined:

```tsx title="src/Move.tsx"
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const Move: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const down = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    durationInFrames: 120,
  });

  const y = interpolate(down, [0, 1], [0, -400]);

  return (
    <AbsoluteFill
      style={{
        translate: `0 ${y}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
```

Return the `<Move>` component in your main composition `src/Composition.tsx`:

```tsx
// @filename: Move.tsx
export const Move: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => null;

// @filename: Composition.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { Dot } from "./Dot";
import { Move } from "./Move";
import { Shrinking } from "./Shrinking";

// ---cut---

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Move>
        <Shrinking>
          <Dot />
        </Shrinking>
      </Move>
    </AbsoluteFill>
  );
};
```

And up goes the dot:
<img src="/img/apple-wow-tutorial/Move.gif"/>

## Duplicate the moving dot

This step is a little bit trickier, but makes the animation very nice! In this step we are going to make changes on three files: `src/Move.tsx`, `src/Trail.tsx` and `src/Composition.tsx`. You create a so called `<Trail>` component. It takes some React children and duplicates them for a certain amount of time. Each dot will have a scale applied to it, so that each dot is smaller than the previous one. And here comes the important step: Within the `<Trail>` component you implement the previously created `<Move>` component. In addition to the implementation we also apply a delay between the animation start of each dot. To do this we need to add an argument `delay` in the `src/Move.tsx` file.

```tsx title="src/Move.tsx"
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const Move: React.FC<{
  children: React.ReactNode;
  delay: number;
}> = ({ children, delay }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const down = spring({
    fps,
    frame: frame - delay,
    config: {
      damping: 200,
    },
    durationInFrames: 120,
  });

  const y = interpolate(down, [0, 1], [0, -400]);

  return (
    <AbsoluteFill
      style={{
        translate: `0 ${y}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
```

```tsx title="src/Trail.tsx"
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Move } from "./Move";

export const Trail: React.FC<{
  amount: number;
  extraOffset: number;
  children: React.ReactNode;
}> = ({ amount, extraOffset, children }) => {
  return (
    <AbsoluteFill>
      {new Array(amount).fill(true).map((a, i) => {
        return (
          <Sequence from={i * 3}>
            <AbsoluteFill
              style={{
                translate: `0 ${-extraOffset}px`,
              }}
            >
              <Move delay={0}>
                <AbsoluteFill
                  style={{
                    scale: String(1 - i / amount),
                  }}
                >
                  {children}
                </AbsoluteFill>
              </Move>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
```

Because you already implemented the `<Move>`component in the `<Trail>` component, you need to consider this in your main composition `src/Composition.tsx`:

```tsx
// @filename: Composition.tsx
import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { Dot } from "./Dot";
import { Shrinking } from "./Shrinking";
import { Trail } from "./Trail";
// ---cut---

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Trail amount={4} extraOffset={0}>
        <Shrinking>
          <Dot />
        </Shrinking>
      </Trail>
    </AbsoluteFill>
  );
};
```

And this is how your animation with the duplicated dots should look like:
<img src="/img/apple-wow-tutorial/Trail.gif"/>
