---
image: /generated/articles-docs-transitions-use-transition-progress.png
crumb: "@remotion/transitions"
sidebar_label: useTransitionProgress()
title: useTransitionProgress()
---

# useTransitionProgress()<AvailableFrom v="4.0.177"/>

A hook that can be used inside a child of a [`<TransitionSeries.Sequence>`](/docs/transitions/transitionseries) to get the progress of the transition to directly manipulate the objects inside the scene.

It is meant to be used together with the [`none()`](/docs/transitions/presentations/none) presentation, but can be used with any other presentation.

## Example

```tsx twoslash title="useTransitionProgress()"
import { useTransitionProgress } from "@remotion/transitions";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { none } from "@remotion/transitions/none";

const A: React.FC = () => {
  const progress = useTransitionProgress();
  console.log(progress.entering); // Always `1`
  console.log(progress.exiting); // Going from 0 to 1
  console.log(progress.isInTransitionSeries); //  `true`

  return <div>A</div>;
};

const B: React.FC = () => {
  const progress = useTransitionProgress();
  console.log(progress.entering); // Going from 0 to 1
  console.log(progress.exiting); // Always `0`
  console.log(progress.isInTransitionSeries); //  `true`

  return <div>B</div>;
};

const C: React.FC = () => {
  const progress = useTransitionProgress();
  console.log(progress.entering); // Always `1`
  console.log(progress.exiting); // Always `0`
  console.log(progress.isInTransitionSeries); //  `false`

  return <div>C</div>;
};

const Transition: React.FC = () => {
  return (
    <>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={40}>
          <A />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 30 })}
        />
        <TransitionSeries.Sequence durationInFrames={60}>
          <B />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <C />
    </>
  );
};
```

## API

A React hook that returns an object with the following properties:

### `entering`

The progress of the entering scene. If not inside a [`<TransitionSeries.Sequence>`](/docs/transitions/transitionseries), it will always be `1`.

### `exiting`

The progress of the exiting scene. If not inside a [`<TransitionSeries.Sequence>`](/docs/transitions/transitionseries), it will always be `0`.

### `isInTransitionSeries`

Whether the current scene is inside a [`<TransitionSeries.Sequence>`](/docs/transitions/transitionseries).

## See also

- [Source code for this hook](https://github.com/remotion-dev/remotion/blob/main/packages/transitions/src/use-transition-progress.ts)
- [`<TransitionSeries>`](/docs/transitions/transitionseries)
