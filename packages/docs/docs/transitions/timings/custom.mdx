---
image: /generated/articles-docs-transitions-timings-custom.png
crumb: "@remotion/transitions"
title: "Custom timings"
---

This page describes how to create your own custom timings for [`<TransitionSeries>`](/docs/transitions/transitionseries).

## Concept

A timing is a configuration which includes:

<Step>1</Step> The duration of the transition <br />
<Step>2</Step> A progress function.

## Implementation

To implement a custom timing function, create a function which returns an object `TransitionTiming`.

```tsx twoslash title="custom-timing.ts"
import type { TransitionTiming } from "@remotion/transitions";

const customTiming = (): TransitionTiming => {
  return {
    getDurationInFrames: ({ fps }) => fps, // 1 second
    getProgress: ({ frame, fps }) => Math.min(1, frame / fps),
  };
};
```

In this example, the timing function will last for 1 second and will be linear.

## Advanced example

<Demo type="custom-timing" />

In the following example:

<Step>1</Step> a spring animation will push the progress to 50% <br />
<Step>2</Step> a pause with customizable duration follows <br />
<Step>3</Step> a second spring animation will push the progress to 100%
<br />
<br />

```tsx twoslash title="spring-timing-with-pause.ts"
import type { TransitionTiming } from "@remotion/transitions";
import { measureSpring, spring, SpringConfig } from "remotion";

const springTimingWithPause = ({
  pauseDuration,
}: {
  pauseDuration: number;
}): TransitionTiming => {
  const firstHalf: Partial<SpringConfig> = {};
  const secondPush: Partial<SpringConfig> = {
    damping: 200,
  };

  return {
    getDurationInFrames: ({ fps }) => {
      return (
        measureSpring({ fps, config: firstHalf }) +
        measureSpring({ fps, config: secondPush }) +
        pauseDuration
      );
    },
    getProgress({ fps, frame }) {
      const first = spring({ fps, frame, config: firstHalf });
      const second = spring({
        fps,
        frame,
        config: secondPush,
        delay: pauseDuration + measureSpring({ fps, config: firstHalf }),
      });

      return first / 2 + second / 2;
    },
  };
};
```

The duration needs to be calculated deterministically by adding the duration of the two springs and the pause duration, so that the previous and next scenes are timed correctly.

A `spring()` animation by default goes from 0 to 1, which is why they [can be added together](/docs/animation-math).

## Using a custom timing

You may use a custom timing like any other timing by calling it and passing it to the `timing` prop of `<TransitionSeries.Transition>`.

```tsx twoslash title="using-custom-timing.tsx" {16}
import { TransitionPresentation } from "@remotion/transitions";

const SlidePresentation: React.FC = () => null;
type CustomPresentationProps = { direction: "from-left" | "from-right" };
const customTransition = (
  props: CustomPresentationProps,
): TransitionPresentation<CustomPresentationProps> => {
  return { component: SlidePresentation, props };
};

const Letter: React.FC<{
  children: React.ReactNode;
  color: string;
}> = () => null;

import type { TransitionTiming } from "@remotion/transitions";

const customTiming = (options: { pauseDuration: number }): TransitionTiming => {
  return {
    getDurationInFrames: ({ fps }) => fps, // 1 second
    getProgress: ({ frame, fps }) => Math.min(1, frame / fps),
  };
};

// ---cut---

import { TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { useVideoConfig } from "remotion";

export const CustomTransition: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={80}>
        <Letter color="orange">A</Letter>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-left" })}
        timing={customTiming({ pauseDuration: 10 })}
      />
      <TransitionSeries.Sequence durationInFrames={200}>
        <Letter color="pink">B</Letter>
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

## Getting the duration of a timing

Call `.getDurationInFrames({fps})` on any timing function and pass [`fps`](/docs/use-video-config) to get the duration in frames.

## References

See the source code for already implemented timings [here](https://github.com/remotion-dev/remotion/blob/main/packages/transitions/src/timings).

## See also

- [Custom presentations](/docs/transitions/presentations/custom)
