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

## Duplicating the `<Trail>` in a circular manner

In a next step you are going to create a `<Explosion>` component. It takes children and duplicates them for example 10 times and applies a rotation to each child.

```tsx title="src/Explosion.tsx"
import React from "react";
import { AbsoluteFill } from "remotion";

const AMOUNT = 10;

export const Explosion: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <AbsoluteFill>
      {new Array(AMOUNT).fill(true).map((_, i) => {
        return (
          <AbsoluteFill
            style={{
              rotate: (i / AMOUNT) * (Math.PI * 2) + "rad",
            }}
          >
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
```

Your main composition (`src/Composition.tsx`) looks like this:

```tsx
import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { Dot } from "./Dot";
import { Explosion } from "./Explosion";
import { Shrinking } from "./Shrinking";
import { Trail } from "./Trail";
// ---cut---

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Explosion>
        <Trail amount={4} extraOffset={0}>
          <Shrinking>
            <Dot />
          </Shrinking>
        </Trail>
      </Explosion>
    </AbsoluteFill>
  );
};
```

The animated explosion should look like this:
<img src="/img/apple-wow-tutorial/Explosion.gif"/>

## Cleanup

You have crated a bunch of files until now, let's put most of them together in one file called `src/Dots.tsx` and create a new and combined component called `<Dots>`.

```tsx title="src/Dots.tsx"
import React from "react";
import { Sequence } from "remotion";
import { Dot } from "./Dot";
import { Explosion } from "./Explosion";
import { Shrinking } from "./Shrinking";
import { Trail } from "./Trail";

export const Dots: React.FC = () => {
  return (
    <Explosion>
      <Trail amount={4} extraOffset={0}>
        <Shrinking>
          <Sequence from={5}>
            <Dot />
          </Sequence>
        </Shrinking>
      </Trail>
    </Explosion>
  );
};
```

Using `<Dots>` our main composition `src/Composition.tsx` looks now clean:

```tsx
import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { Dots } from "./Dots";
// ---cut---

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Dots />
    </AbsoluteFill>
  );
};
```

Nothing has changed on the animation itself:
<img src="/img/apple-wow-tutorial/Dots.gif"/>

## Adding stars and hearts

Next to the dots we also add some stars and hearts in different colors. This way the explosion gets a nice WOW effect. In this step we are basically repeating the previous steps. Next to the `<Dots>` component, we add three more components: `<RedHearts>`, `<YellowHearts>` and `<Stars>`.

```tsx title="src/RedHeart.tsx"
import React from "react";
import { AbsoluteFill } from "remotion";

export const RedHeart: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      ❤️
    </AbsoluteFill>
  );
};
```

Effects like `<Shrinking>`, `<Move>` and `<Explosion>` need to be applied. Also to consider is that you need to change the position of the `<RedHearts>` otherwise they would be on top of the `<Dots>`, you want to avoid this by changing the `<AbsoluteFill>`:

```tsx title="src/RedHearts.tsx"
import React from "react";
import { AbsoluteFill } from "remotion";
import { Explosion } from "./Explosion";
import { Move } from "./Move";
import { RedHeart } from "./RedHeart";
import { Shrinking } from "./Shrinking";

export const RedHearts: React.FC = () => {
  return (
    <Explosion>
      <Move delay={5}>
        <AbsoluteFill style={{ transform: `translateY(-100px)` }}>
          <Shrinking>
            <RedHeart />
          </Shrinking>
        </AbsoluteFill>
      </Move>
    </Explosion>
  );
};
```

We do the same for the `<YellowHearts>`:

```tsx title="src/YellowHeart.tsx"
import React from "react";
import { AbsoluteFill } from "remotion";

export const YellowHeart: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      💛
    </AbsoluteFill>
  );
};
```

```tsx title="src/YellowHearts.tsx"
import React from "react";
import { AbsoluteFill } from "remotion";
import { Explosion } from "./Explosion";
import { Move } from "./Move";
import { Shrinking } from "./Shrinking";
import { YellowHeart } from "./YellowHeart";

export const YellowHearts: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        rotate: "0.3rad",
      }}
    >
      <Explosion>
        <Move delay={20}>
          <AbsoluteFill
            style={{
              transform: `translateY(-50px)`,
            }}
          >
            <Shrinking>
              <YellowHeart />
            </Shrinking>
          </AbsoluteFill>
        </Move>
      </Explosion>
    </AbsoluteFill>
  );
};
```

Your main composition should look like this:
<img src="/img/apple-wow-tutorial/DotsAndHearts.gif"/>

<br/>
<br/>

As already described above we want to add some `<Stars>` to the explosion:

```tsx title="src/Star.tsx"
import React from "react";
import { AbsoluteFill } from "remotion";

export const Star: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontSize: 14,
      }}
    >
      ⭐
    </AbsoluteFill>
  );
};
```

Effects like `<Shrinking>`, `<Trail>` and `<Explosion>` need to be applied. Also to consider is that you need to change the position of the `<Stars>` otherwise they would be on top of the `<Dots>`, you want to avoid this by rotating the `<Stars>` and giving `<Trail>` an `extraOffset`:

```tsx title="src/Stars.tsx"
import React from "react";
import { AbsoluteFill } from "remotion";
import { Explosion } from "./Explosion";
import { Shrinking } from "./Shrinking";
import { Star } from "./Star";
import { Trail } from "./Trail";

export const Stars: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        rotate: "0.3rad",
      }}
    >
      <Explosion>
        <Trail extraOffset={100} amount={4}>
          <Shrinking>
            <Star />
          </Shrinking>
        </Trail>
      </Explosion>
    </AbsoluteFill>
  );
};
```

Here is how the almost complete firework should look like:
<img src="/img/apple-wow-tutorial/DotsAndHeartsAndStars.gif"/>

## Slow motion effect

Lastly let's apply a nice slow motion effect to the firework. You can do this by wrapping all moving components in a component called `<Slowed>`.

```tsx title="src/SlowedTrail.tsx"
import React from "react";
import { Freeze, interpolate, useCurrentFrame } from "remotion";

// RemapSpeed() is a helper function for the component <Slowed> that takes a frame number and a speed
const remapSpeed = ({
  frame,
  speed,
}: {
  frame: number;
  speed: (fr: number) => number;
}) => {
  let framesPassed = 0;
  for (let i = 0; i <= frame; i++) {
    framesPassed += speed(i);
  }

  return framesPassed;
};

export const Slowed: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const frame = useCurrentFrame();
  const remappedFrame = remapSpeed({
    frame,
    speed: (f) =>
      interpolate(f, [0, 20, 21], [1.5, 1.5, 0.5], {
        extrapolateRight: "clamp",
      }),
  });

  return <Freeze frame={remappedFrame}>{children}</Freeze>;
};
```

As you can tell now everything is very composable. The main composition looks like this:

```tsx title="src/Slowed.tsx"
import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { Dots } from "./Dots";
import { RedHearts } from "./RedHearts";
import { Slowed } from "./SlowedTrail";
import { Stars } from "./Stars";
import { YellowHearts } from "./YellowHearts";

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Slowed>
        <Dots />
        <RedHearts />
        <YellowHearts />
        <Stars />
      </Slowed>
    </AbsoluteFill>
  );
};
```

Your final firework should look like this:
<img src="/img/apple-wow-tutorial/Slowed.gif"/>

## Adding your animoji

As a last step of this tutorial we add your animoji on top of the firework. For the animoji you need to have an iPhone. In iMessages you can record an animoji of yourself and send it to a friend. After you've done that, it will also appear in the Messages app on your MacBook. You can download your animoji there. Once you have done that, you can right-click it and select "Services", then "Encode Selected Video Files", then choose "Apple ProRes" in the setting dropdown. Don't forget to tick box that says "Preserve Transparency". A new file of your animoji will be created. Next to the "src" folder you create a new one called "public". You put your encoded video in this folder. You can then use FFmpeg to turn it into a series of frames, just use this command: "ffmpeg -i animoji.mov -pix_fmt rgba -start_number 0 frame%03d.png". You then can import this series of frames by using the StaticFile API and we can use the current frame number to figure out the file name. By doing all of this you have finally imported a transparent version of your animoji into your composition.
