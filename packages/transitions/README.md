# @remotion/transitions

Library for creating transitions in Remotion

[![NPM Downloads](https://img.shields.io/npm/dm/@remotion/transitions.svg?style=flat&color=black&label=Downloads)](https://npmcharts.com/compare/@remotion/transitions?minimal=true)

## Installation

```bash
npm install @remotion/transitions --save-exact
```

When installing a Remotion package, make sure to align the version of all `remotion` and `@remotion/*` packages to the same version.
Remove the `^` character from the version number to use the exact version.

## Usage

See the [documentation](https://www.remotion.dev/transitions) for more information.

## Motion blur prototype

`TransitionSeries.Transition` accepts `motionBlur` for presentations with a canvas renderer:

```tsx
import {TransitionSeries, springTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';

<TransitionSeries.Transition
	presentation={slide({direction: 'from-bottom'})}
	timing={springTiming({durationInFrames: 20})}
	motionBlur={{shutterAngle: 180, samples: 16}}
/>;
```

Each scene is captured once per frame. The presentation is drawn at several fractional frames using its timing function, and the resulting images are averaged. This blurs the transition movement; animations inside the scenes are sampled at the current frame. Use `HtmlInCanvasMotionBlur` when the contents themselves also need temporal sampling.

The defaults are 180 degrees and 16 samples. `shutterAngle` must be between 0 and 360; `samples` must be a positive integer. Omit `motionBlur` to use the presentation normally.

The prototype supports all four `slide()` directions without `enterStyle` or `exitStyle`, and presentations created with `makeHtmlInCanvasPresentation()`. Custom presentations can opt in by providing a `canvas` property implementing the exported `HtmlInCanvasShader<Props>` interface. The renderer must draw a complete image for each progress value without depending on earlier draws. As with existing canvas presentations, `prevImage` is the entering scene and `nextImage` is the exiting scene. Arbitrary React presentations and slide style overrides are rejected rather than silently approximated.

Motion blur currently requires a sequence on both sides of the transition. The entering and exiting transitions of a middle sequence must not overlap. Samples are bounded by the transition duration; scene mounting boundaries can therefore differ from full-scene motion blur.

Preview browsers without HTML-in-canvas show the original presentation and an indication that motion blur is unavailable. Rendering requires HTML-in-canvas support. The API is a prototype and may change.
