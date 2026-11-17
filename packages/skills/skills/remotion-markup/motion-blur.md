# Motion blur

Motion blur samples times around the current frame and blends the results.
Use `@remotion/motion-blur` for motion blur on animated content.  
For transition presentation movement, use the optimized `motionBlur` prop from `@remotion/transitions`.

## `<HtmlInCanvasMotionBlur>`

`<HtmlInCanvasMotionBlur>` captures animated content at fractional frames and averages its pixels in a canvas.  
Supply the canvas `width` and `height`.

```bash
bunx remotion add @remotion/motion-blur
```

Call `useCurrentFrame()` inside the child component so each sample receives its own frame.

```tsx title="MyComposition.tsx"
import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import {useCurrentFrame, useVideoConfig} from 'remotion';

const MovingBox = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: 'absolute',
        left: frame * 10,
        top: 300,
        width: 120,
        height: 120,
        backgroundColor: '#ff6b6b',
      }}
    />
  );
};

export const MyComposition = () => {
  const {width, height} = useVideoConfig();

  return (
    <HtmlInCanvasMotionBlur
      width={width}
      height={height}
      samples={8}
      shutterAngle={180}
    >
      <MovingBox />
    </HtmlInCanvasMotionBlur>
  );
};
```

### Motion blur on transitions

Use `motionBlur` on a `<TransitionSeries.Transition>` to blur the presentation's movement.  
This is faster than `<HtmlInCanvasMotionBlur>` and advisable for transitions, but content that does not fit the transitions primitive should not be shoehorned.

```bash
bunx remotion add @remotion/transitions
```

```tsx title="TransitionVideo.tsx"
import {springTiming, TransitionSeries} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {AbsoluteFill} from 'remotion';

export const TransitionVideo = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={60}>
        <AbsoluteFill style={{backgroundColor: '#0b84f3'}} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({direction: 'from-bottom'})}
        timing={springTiming({durationInFrames: 20})}
        motionBlur={{shutterAngle: 180, samples: 16}}
      />
      <TransitionSeries.Sequence durationInFrames={60}>
        <AbsoluteFill style={{backgroundColor: '#2ecc71'}} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

All built-in presentations support motion blur. Custom presentations need an HTML-in-canvas implementation. [Custom presentation guide](https://www.remotion.dev/docs/transitions/presentations/custom-html-in-canvas)

Each scene is captured once at the current frame, and the presentation is drawn at fractional times using those captures.  
Both scenes keep advancing during the transition. To sample animations or videos inside a scene at multiple times, apply `<HtmlInCanvasMotionBlur>` to that content.

Place a `<TransitionSeries.Sequence>` on each side of a blurred transition. Keep the entering and exiting transitions of a middle sequence within its duration, with no overlap.

Passing `enterStyle`, `exitStyle`, `innerEnterStyle`, `innerExitStyle`, `outerEnterStyle`, or `outerExitStyle` alongside `motionBlur` throws an error.  
Keep styling in the scene contents or implement it in a custom HTML-in-canvas presentation.

### `shutterAngle` and `samples`

`shutterAngle` accepts values from `0` to `360` and defaults to `180`. `0` disables blur. `360` exposes one frame, `180` half a frame, and `90` a quarter of a frame.
The exposure time in seconds is `(shutterAngle / 360) / fps`. At 30 fps, `180` gives an exposure time of `1 / 60` second.

`samples` controls how many snapshots are blended within the exposure time. It defaults to `8` for `<HtmlInCanvasMotionBlur>` and `16` for transition `motionBlur`.
Use a positive integer. `<HtmlInCanvasMotionBlur>` accepts `1` to `64`. More samples smooth the blur and increase preview and render cost.
