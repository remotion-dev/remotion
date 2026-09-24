# Motion blur

Use `@remotion/motion-blur` for frame-driven motion blur. Install it with `npx remotion add @remotion/motion-blur`.

## Choose an approach

| Component                  | Use when                                              | Tradeoff                                         |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `<Trail>`                  | You want visible echoes or a stylized streak          | It is a trail, not a camera exposure             |
| `<CameraMotionBlur>`       | You need camera-like blur in regular browser previews | Translucent layers can change colors and opacity |
| `<HtmlInCanvasMotionBlur>` | You want the most faithful sampled HTML blur          | Experimental Chrome support; more work per frame |

`<HtmlInCanvasMotionBlur>` is the state of the art in Remotion for blurring animated HTML. It captures the content at fractional frames and averages its pixels in a canvas. Prefer it when the preview browser supports HTML-in-canvas; use `<CameraMotionBlur>` when broader browser preview support matters.

All three components render multiple versions of their children at different times. Put the animation and its `useCurrentFrame()` call **inside** the blur component. Do not calculate the animated position in a parent and pass an already computed style into it. Use frame-driven animation, not CSS `animation` or `transition`.

## `<Trail>`

`layers` is the number of past copies, `lagInFrames` is the delay between copies and `trailOpacity` controls their strength. Absolutely position the content so copies do not affect each other's layout.

```tsx
import {Trail} from '@remotion/motion-blur';
import {useCurrentFrame} from 'remotion';

const MovingBox = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: frame * 10,
        top: 200,
        width: 120,
        height: 120,
        backgroundColor: '#ff6b6b',
      }}
    />
  );
};

export const MyComposition = () => (
  <Trail layers={12} lagInFrames={0.15} trailOpacity={0.8}>
    <MovingBox />
  </Trail>
);
```

The next examples reuse `MovingBox` from above.

## `<CameraMotionBlur>`

`shutterAngle` controls exposure length, from `0` to `360` degrees; the default is `180`. `samples` controls smoothness; the default is `10`. Start with 5 to 10 samples and inspect colors because this component blends translucent DOM layers. Absolutely position its children.

```tsx
import {CameraMotionBlur} from '@remotion/motion-blur';

export const CameraBlur = () => (
  <CameraMotionBlur shutterAngle={180} samples={8}>
    <MovingBox />
  </CameraMotionBlur>
);
```

## `<HtmlInCanvasMotionBlur>`

Available from Remotion 4.0.528. Supply the canvas `width` and `height`, usually from `useVideoConfig()`. `shutterAngle` defaults to `180` and accepts `0` to `360`; `0` disables blur. `samples` defaults to `8` and must be an integer from `1` to `64`. More samples can smooth the blur but increase preview and render cost.

```tsx
import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import {useVideoConfig} from 'remotion';

export const HtmlInCanvasBlur = () => {
  const {width, height} = useVideoConfig();

  return (
    <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={180}>
      <MovingBox />
    </HtmlInCanvasMotionBlur>
  );
};
```

For live preview, use Chrome 149 or later and enable `chrome://flags/#canvas-draw-element`. Remotion's bundled Chrome enables the feature during rendering. Do not nest this component with another `<HtmlInCanvas>` component; nested HTML-in-canvas is unsupported. Tell the user about the preview requirement when choosing this variant.

See the [motion blur guide](https://www.remotion.dev/docs/motion-blur-guide) and the [`<HtmlInCanvasMotionBlur>` reference](https://www.remotion.dev/docs/motion-blur/html-in-canvas-motion-blur).
