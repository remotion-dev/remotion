---
image: /generated/articles-docs-transitions-presentations-custom.png
crumb: '@remotion/transitions'
title: 'Custom presentations'
---

This page describes how to create your own custom effect for [`<TransitionSeries>`](/docs/transitions/transitionseries).

## Concept

A presentation is a higher order component which wraps around the entering slide as well as the exiting slide and which implements an effect based on three parameters:

<Step>1</Step> The current <code>presentationProgress</code>, influenced by the
timing of the transition
<br />
<Step>2</Step> The <code>presentationDirection</code>, either <code>entering</code> or <code>exiting</code>
<br />
<Step>3</Step> The <code>presentationDurationInFrames</code> (_available from v4.0.153_)
<Step>4</Step> Additional developer-defined <code>passedProps</code>

## Boilerplate

A custom presentation is a function which returns an object of type `TransitionPresentation`.  
It is an object with a React component (`component`) and React props which are passed to the component as `passedProps`.

```tsx twoslash title="custom-presentation.tsx"
import type {TransitionPresentationComponentProps} from '@remotion/transitions';

const StarPresentation: React.FC<
  TransitionPresentationComponentProps<CustomPresentationProps>
> = ({children, presentationDirection, presentationProgress, passedProps}) =>
  null;

// ---cut---

import type {TransitionPresentation} from '@remotion/transitions';

type CustomPresentationProps = {
  width: number;
  height: number;
};

export const customPresentation = (
  props: CustomPresentationProps,
): TransitionPresentation<CustomPresentationProps> => {
  return {component: StarPresentation, props};
};
```

The `component` is a React component which receives the following props:

<Step>1</Step> <code>children</code>: The markup to wrap around
<br />
<Step>2</Step> <code>presentationDirection</code>: Either <code>
  "entering"
</code> or <code>"exiting"</code>
<br />
<Step>3</Step> <code>presentationProgress</code>: A number between <code>
  0
</code> and <code>1</code> which represents the progress of the transition.
<br />
<Step>4</Step> <code>passedProps</code>: The custom props passed to the presentation

<br />
<br />

```tsx twoslash title="StarPresentation.tsx"
type CustomPresentationProps = {
  width: number;
  height: number;
};

// ---cut---
import type {TransitionPresentationComponentProps} from '@remotion/transitions';
import {AbsoluteFill} from 'remotion';

const StarPresentation: React.FC<
  TransitionPresentationComponentProps<CustomPresentationProps>
> = ({children, presentationDirection, presentationProgress, passedProps}) => {
  return (
    <AbsoluteFill>
      <AbsoluteFill>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
```

## Example

<Demo type="custom-presentation" />

The following example implements a star mask transition:

<Step>1</Step> Based on the <code>passedProps</code> <code>height</code> and <code>width</code>
, the inner radius of the star is calculated that will completely fill the canvas.
<br />
<Step>2</Step> Using <a href="/docs/shapes"><code>@remotion/shapes</code></a>, an SVG path is calculated, and grown from zero to the full size of the canvas. <br />
<Step>3</Step> The <code>presentationProgress</code> is used to interpolate the shape
size. <br /> <Step>4</Step> <a href="/docs/paths"><code>@remotion/paths</code></a> is used to center the star in the middle of the canvas.
<br />
<Step>5</Step> A <code>clipPath</code> is used to clip the entering slide.
Inside the container, the <code>children</code> get rendered.
<br />
<Step>6</Step> The effect is disabled if <code>presentationDirection</code> is set
to <code>"exiting"</code>{' '}

<br />
<br />

```tsx twoslash title="StarPresentation.tsx"
import {getBoundingBox, translatePath} from '@remotion/paths';
import {makeStar} from '@remotion/shapes';
import type {TransitionPresentationComponentProps} from '@remotion/transitions';
import React, {useMemo, useState} from 'react';
import {AbsoluteFill, random} from 'remotion';

export type CustomPresentationProps = {
  width: number;
  height: number;
};

const StarPresentation: React.FC<
  TransitionPresentationComponentProps<CustomPresentationProps>
> = ({children, presentationDirection, presentationProgress, passedProps}) => {
  const finishedRadius =
    Math.sqrt(passedProps.width ** 2 + passedProps.height ** 2) / 2;
  const innerRadius = finishedRadius * presentationProgress;
  const outerRadius = finishedRadius * 2 * presentationProgress;

  const {path} = makeStar({
    innerRadius,
    outerRadius,
    points: 5,
  });

  const boundingBox = getBoundingBox(path);

  const translatedPath = translatePath(
    path,
    passedProps.width / 2 - boundingBox.width / 2,
    passedProps.height / 2 - boundingBox.height / 2,
  );

  const [clipId] = useState(() => String(random(null)));

  const style: React.CSSProperties = useMemo(() => {
    return {
      width: '100%',
      height: '100%',
      clipPath:
        presentationDirection === 'exiting' ? undefined : `url(#${clipId})`,
    };
  }, [clipId, presentationDirection]);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
      {presentationDirection === 'exiting' ? null : (
        <AbsoluteFill>
          <svg>
            <defs>
              <clipPath id={clipId}>
                <path d={translatedPath} fill="black" />
              </clipPath>
            </defs>
          </svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
```

Example usage:

```tsx twoslash title="MyComp.tsx"
import {springTiming, TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill, useVideoConfig} from 'remotion';

import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';

type CustomPresentationProps = {
  width: number;
  height: number;
};

export const customPresentation = (
  props: CustomPresentationProps,
): TransitionPresentation<CustomPresentationProps> => {
  return {component: StarPresentation, props};
};

const StarPresentation: React.FC<
  TransitionPresentationComponentProps<CustomPresentationProps>
> = ({children, presentationDirection, presentationProgress, passedProps}) =>
  null;

export const Letter: React.FC<{
  children: React.ReactNode;
  color: string;
}> = ({children, color}) => {
  return <AbsoluteFill style={{}}>{children}</AbsoluteFill>;
};

// ---cut---
export const MyComp: React.FC = () => {
  const {width, height} = useVideoConfig();

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={70}>
        <Letter color="orange">A</Letter>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={customPresentation({width, height})}
        timing={springTiming({
          durationInFrames: 45,
          config: {
            damping: 200,
          },
          durationRestThreshold: 0.0001,
        })}
      />
      <TransitionSeries.Sequence durationInFrames={60}>
        <Letter color="pink">B</Letter>
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

## References

See the source code for [already implemented presentations](https://github.com/remotion-dev/remotion/blob/main/packages/transitions/src/presentations) for a useful reference.

## See also

- [Custom timings](/docs/transitions/timings/custom)
