---
name: remotion-interactivity
description: Structure Remotion markup for interactivity
version: 4.0.528
---

By writing Remotion markup in a specific way, the Remotion Studio is able to recognize the structure of the code and makes it interactive:

- Allowing items to be selected by clicking on them
- Allowing drag+drop, resizing and rotation
- Editing the CSS styles
- Making keyframes and easing values editable

If the markup is too complex for the Studio to make it interactive, then the values become grayed out.

## Make an HTML element interactive using `Interactive`

Every HTML and SVG element (except `<Img>`, it already is interactive) such as `<div>` can be turned interactive using `Interactive`:

```tsx title="Interactive elements"
<Interactive.Div
  name="Greeting card"
  style={{fontSize: 80, padding: 24}}
>
  Hello
</Interactive.Div>
```

This allows styles and keyframes to be set in the Studio. Be sensible, if a component has many elements, the timeline might get messy.

## Prefer inline text

If text is fixed and only used once, write it directly inside the interactive element instead of extracting it into a constant.

```tsx title="Inline text"
// 👍 Fixed copy stays editable
<Interactive.Div name="Title">
  Remotion Best Practices
</Interactive.Div>
```

Use a prop or variable only when the text is dynamic or reused.

## Give interactive elements a descriptive name

Add a `name` prop to elements to make them easily identifyable.
Avoid computed names, hardcode them.

```tsx title="Interactive names"
<>
  <Interactive.Div name="Hero title" style={{fontSize: 80}}>
    Launch day
  </Interactive.Div>
  <Img name="Avatar" src="https://remotion.media/image.jpeg" />
  <Video name="Background" src="https://remotion.media/video.mp4" />
  <Sequence name="Title">
    Launch day
  </Sequence>
</>
```

## Keep all CSS styles inline

The best way is to just pass a plain object to `style` - no referring to constants, no object spreading, no math.

```tsx title="Interactive example"
<Interactive.Div
  style={{
    fontSize: 80,
    color: 'red',
  }}
>
  Hello World!
</Interactive.Div>
```

```tsx title="❌ Bad for interactivity"
const baseStyle = useMemo(() => {
  return {
    fontSize: 12 // ❌ Non-inline styles are not supported
  }
}, []);

<Interactive.Div
  style={{
    ...baseStyle, // ❌ Spreading is not supported
    color: RED, // ❌ Referring to constants is not supported
    scale: frame * 10 // ❌ Math is not supported
  }}
>
  Hello World!
</Interactive.Div>
```

## Animate using `interpolate()`

Write animations as inline `interpolate()` calls on the property that changes.  
The output range, easing, extrapolation and `output` property should use hardcoded values.

The input range may additionally use `durationInFrames`, `fps`, `width` and `height` destructured directly from `useVideoConfig()`. Bare identifiers such as `durationInFrames`, multiplication with a number such as `2 * fps` or `fps * 2`, and subtraction of a number such as `durationInFrames - 1` are supported.

```tsx title="Inline values"
const {fps, durationInFrames} = useVideoConfig();

// 👍 Inline values can be standardized and keyframed
<Interactive.Div
  name="Product card"
  style={{
    color: 'white',
    fontSize: 80,
    scale: interpolate(frame, [0, fps], [0, 1], {
      easing: Easing.spring({damping: 200}),
      output: 'perceptual-scale',
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }),
    rotate: interpolate(frame, [0, 1 * fps], ['0deg', '20deg'], {
      easing: Easing.spring({damping: 200}),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }),
    translate: interpolate(
      frame,
      [durationInFrames - 30, durationInFrames],
      ['0px 0px', '0px 120px'],
      {
        easing: Easing.spring({damping: 200}),
        output: 'perceptual-scale',
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      }
    ),
  }}
/>
```

```tsx title="❌ Bad interactivity"
const translateY = interpolate(frame, [0, 30], [0, 120]); // ❌ Math should be directly in the markup

<Interactive.Div
  name="Product card"
  style={{
    translate: translateY, // ❌ Only inline interpolate() calls are supported,
    rotate: interpolate(frame, [start, start + 10], [0, Math.PI]), // ❌ Cannot use math with arbitrary variables, cannot use constants
    scale: interpolate(anyVariable, [0, 30], [0, 1]) // ❌ Can only interpret the `frame` variable.
  }}
/>
```

## Keep SVG paths editable with `Interactive.Path`

Use `Interactive.Path` from `remotion` inside an SVG to make path anchors and Bézier handles editable on the Studio canvas.
Install `@remotion/paths` for path interpolation and Studio path keyframes, keeping its version aligned with `remotion`:

```sh
bunx remotion add @remotion/paths
```

### Inline static path data

If the geometry is meant to be static, put the path string directly in the `d` prop. Do not extract it into a constant, construct it with a template literal, or call a path-generating helper in the prop. For a generated shape that should stay static, generate the data once and inline the resulting string.

```tsx title="Editable static path"
import {Interactive} from 'remotion';

<Interactive.Svg width={300} height={300} viewBox="0 0 300 300">
  <Interactive.Path
    name="Triangle"
    d="M 40 40 L 260 40 L 150 260 Z"
    fill="#0b84f3"
  />
</Interactive.Svg>
```

### Morph paths using inline `interpolatePaths()`

Use `interpolatePaths()` from `@remotion/paths` (available from Remotion 4.0.529) directly in `d`. It accepts a frame, an input range, an equally sized array of path strings, and options for easing, extrapolation, and posterization.
Keep the output paths, ranges, and options inline, following the same input-range rules as `interpolate()` above. Do not use the pairwise `interpolatePath()` API or extract the interpolated result into a variable when the path keyframes should remain editable in Studio.

```tsx title="Editable path keyframes"
import {interpolatePaths} from '@remotion/paths';
import {Easing, Interactive, useCurrentFrame} from 'remotion';

export const MorphingPath = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Svg width={300} height={300} viewBox="0 0 300 300">
      <Interactive.Path
        name="Morphing triangle"
        d={interpolatePaths(
          frame,
          [0, 30, 60],
          [
            'M 40 40 L 260 40 L 150 260 Z',
            'M 40 150 L 150 40 L 260 150 Z',
            'M 40 260 L 150 40 L 260 260 Z',
          ],
          {
            easing: Easing.bezier(0.42, 0, 0.58, 1),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            posterize: 2,
          },
        )}
        fill="#0b84f3"
      />
    </Interactive.Svg>
  );
};
```

Studio can edit the path at the current frame, add or move keyframes, and adjust their easing. Omit `posterize` when the animation should update every frame.

### Reveal a stroke without making the path computed

For a line-drawing animation, keep `d` inline and animate `strokeDashoffset`. Set `pathLength={1}` and `strokeDasharray="1 1"`, then interpolate the offset from `1` (hidden) to `0` (fully drawn). These are unitless values, not percentages. The browser normalizes the dash lengths to the path, so edits to its geometry do not require recalculating its length. See the [SVG pathLength specification](https://www.w3.org/TR/SVG2/paths.html#PathLengthAttribute).

```tsx title="Stroke reveal with editable geometry"
import {Interactive, interpolate, useCurrentFrame} from 'remotion';

export const DrawingPath = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Svg width={300} height={300} viewBox="0 0 300 300">
      <Interactive.Path
        name="Drawing curve"
        d="M 30 230 C 60 40 240 40 270 230"
        fill="none"
        stroke="#0b84f3"
        strokeWidth={6}
        strokeLinecap="butt"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={interpolate(frame, [0, 30], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}
      />
    </Interactive.Svg>
  );
};
```

Use this pattern instead of `evolvePath()` for interactive paths. `evolvePath()` returns computed dash properties; it does not modify `d`. Extracting `d` into a shared variable or spreading the returned object into the element prevents Studio from editing those values directly. Keeping `d` inline preserves canvas geometry editing. The dash props currently have no built-in Studio controls, so the reveal timing is edited in code.

This technique reveals the stroke, not the fill. Use separate `Interactive.Path` elements for subpaths that should draw independently. Round or square line caps can leave a dot visible at the hidden endpoint; the example uses butt caps.

## Use `scale`, `translate`, `rotate` CSS properties

Avoid the `transform` CSS property.  
If possible, use `scale`, `rotate` and `translate` instead because only they are interactively editable.

## Keep composition metadata inline

When scaffolding a composition, keep `width`, `height`, `fps`, `durationInFrames` and `defaultProps` inline and make no type assertions.

The Props editor can save visual edits back to your code when `defaultProps` is an inline object literal on `<Composition>` or `<Still>`.

```tsx
// 👍 Static values are in <Composition>, dynamic values are in calculateMetadata()
const calculateMetadata = useMemo(async () => {
  const dimensions = await getDimensions(); // just an example
  return {width: dimensions.width, height: dimensions.height};
});

<Composition
  id="my-video"
  component={MyComponent}
  durationInFrames={150}
  fps={30}
  calculateMetadata={calculateMetadata}
  defaultProps={{title: 'Hello', color: '#0b84ff'}}
/>
```

```tsx title="Negative examples"
const defaultProps = {title: 'Hello', color: '#0b84ff'}; // ❌ Don't extract defaultProps, must be inline
const calculateMetadata = useMemo(() => {
  // ❌ Unnecessary because no calculation is being done,
  return {durationInFrames: 150, fps: 30, width: 1920, height: 1080};
});

<Composition
  id="my-video"
  component={MyComponent}
  calculateMetadata={calculateMetadata}
  defaultProps={{
    title: 'Hello',
  } as Props} // ❌ Don't have type assertions, instead type MyComponent correctly
/>
```

Use only `calculateMetadata()` for the part of the metadata that is dynamic.

## Effects should be inline too

The effects array should not be computed.  
The same rules for setting keyframes as `interpolate()` apply too here: All values should also be hardcoded: Input range, output range, easing, extrapolation, `output` property.

```tsx title="Effects"
// 👍 Parameters are inline and the array shape is stable
<CanvasImage
  src={src}
  width={1280}
  height={720}
  effects={[
    radialProgressiveBlur({
      center: [0.5, 0.5],
      width: 1.2,
      height: 0.8,
      start: 0.2,
      disabled: true,
      rotation: interpolate(frame, [0, 120], [0, 180]),
    }),
  ]}
/>

const center = [0.5, 0.5] as const;
const rotation = frame * 1.5;

<CanvasImage
  src={src}
  width={1280}
  height={720}
  // ❌ Conditional effect is not animateable
  effects={enabled ? [
    radialProgressiveBlur({
      // ❌ Not inline
      center,
      rotation,
    }),
  ] : []}
/>
```

Render separate elements if one version should have effects and another should not.

## Making your own component interactive

When using `Interactive.withSchema()`, include `Interactive.baseSchema` in the schema so standard timeline controls such as trimming and visibility remain available.

To make a custom userland component interactive, use:
[Make a component interactive](https://www.remotion.dev/docs/studio/make-component-interactive.md)

## Video editing

If a Remotion component mainly consists of video and audio clips, see [Video editing](../remotion-markup/video-editing.md) for best practices on how to structure Remotion markup so the clips are interactively editable in the timeline.
