---
name: remotion-markup
description: Best practices for writing Remotion React Markup
metadata:
  tags: remotion, react, markup
---

This is guidance for writing Remotion React Markup.
If this is not relevant, load [Remotion Best Practices](../remotion-best-practices/SKILL.md) instead.

## General rules

Animate properties using `useCurrentFrame()` and `interpolate()`.

Use `interpolate()` over `spring()`.

Use `Easing.bezier()` to customize timing, including jumpy or overshooting motion.
Use `Easing.spring()` if you want spring animations

HTML Elements which make sense to be made interactive in the Studio should use `Interactive`: `<div>` -> `<Interactive.Div>`.  
Set a descriptive `name` prop such as `name="Hero title"` for `Interactive`, `Solid`, `Sequence`.

```tsx
import { useCurrentFrame, Easing, interpolate, Interactive } from "remotion";

export const FadeIn = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Title"
      style={{
        opacity: interpolate(frame, [0, 60], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      Hello World!
    </Interactive.Div>
  );
};
```

Keep the `interpolate()` call inline in the `style` prop.
Prefer `scale`, `translate`, `rotate` CSS properties over `transform`.

```tsx
// 👍 Inline editable keyframes and transform shorthands
style={{
  scale: interpolate(frame, [0, 100], [0, 1]),
  translate: interpolate(frame, [0, 100], ["0px 0px", "100px 100px"]),
  rotate: interpolate(frame, [0, 100], ["20deg", "90deg"]),
}}

// 👎 Hidden values and transform strings become harder to edit in Studio
const scale = interpolate(frame, [0, 100], [0, 1]);

style={{
  transform: `scale(${scale})`,
}}
```

CSS transitions or animations are FORBIDDEN - they will not render correctly.  
Tailwind animation class names are FORBIDDEN - they will not render correctly.

Place assets in the `public/` folder at your project root.

Use `staticFile()` to reference files from the `public/` folder.

Add video and audio using `@remotion/media`.  
Add images using the `<Img>` component.
Use `staticFile()` for files in `public/` or pass a remote URL directly:

```tsx
import { Audio, Video } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return (
    <>
      <Video src={staticFile("video.mp4")} style={{ opacity: 0.5 }} />
      <Audio src={staticFile("audio.mp3")} />
      <Img src={staticFile("logo.png")} style={{ width: 100, height: 100 }} />
      <Video src="https://remotion.media/video.mp4" />
    </>
  );
};
```

To delay content wrap it in `<Sequence>` and use `from`.
To limit the duration of an element, use `durationInFrames` of `<Sequence>`.
`<Sequence>` by default is an absolute fill convering the scene.  
For inline content, use `layout="none"`.

```tsx
const Main = () => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence name="Background">
        <Background />
      </Sequence>
      <Sequence name="Title" from={30} durationInFrames={60} layout="none">
        <Title />
      </Sequence>
      <Sequence name="Subtitle" from={60} durationInFrames={60} layout="none">
        <Subtitle />
      </Sequence>
    </AbsoluteFill>
  );
}

export const Title = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        opacity: interpolate(frame, [0, 60], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      Title
    </div>
  );
};

export const Subtitle = () => {
  return <div>Subtitle</div>;
};
```

## Maps

See [map.md](map.md) for choosing between simple static maps, Mapbox maps, and MapLibre maps.

## Voiceover

See [voiceover.md](voiceover.md) for adding AI-generated voiceover to Remotion compositions using ElevenLabs TTS.

## Trimming

See [trimming.md](trimming.md) for trimming patterns - cutting the beginning or end of animations.

## Embedding Videos

See [embedding-videos.md](embedding-videos.md) for advanced knowledge about embedding videos - trimming, volume, speed, looping, pitch.

## Embedding Audio

See [audio.md](audio.md) for advanced audio features like trimming, volume, speed, pitch.

## Transitions

See [transitions.md](transitions.md) for scene transition patterns.

## Visual and pixel effects

When creating a visual effect, prefer: 1. normal Remotion/HTML/CSS/SVG/filter/blend/mask animation, 2. a listed effect via [effects.md](effects.md), including on HTML rendered through `<HtmlInCanvas>`, 3. a custom `createEffect()` via [effects.md](effects.md) when the user asks for a reusable/project-specific effect, 4. custom `<HtmlInCanvas onPaint>` via [html-in-canvas.md](html-in-canvas.md) only if no effect fits.

For light leak overlays, see [light-leaks.md](light-leaks.md). Docs: https://www.remotion.dev/docs/effects

Available effects: `brightness()`, `contrast()`, `colorKey()`, `duotone()`, `grayscale()`, `hue()`, `invert()`, `saturation()`, `tint()`, `linearGradient()`, `linearGradientTint()`, `thermalVision()`, `blur()`, `linearProgressiveBlur()`, `radialProgressiveBlur()`, `zoomBlur()`, `dropShadow()`, `glow()`, `lightTrail()`, `evolve()`, `venetianBlinds()`, `mirror()`, `scale()`, `uvTranslate()`, `xyTranslate()`, `barrelDistortion()`, `chromaticAberration()`, `fisheye()`, `cornerPin()`, `wave()`, `burlap()`, `emboss()`, `dotGrid()`, `halftone()`, `noise()`, `noiseDisplacement()`, `paper()`, `roughenEdges()`, `pattern()`, `pixelate()`, `pixelDissolve()`, `scanlines()`, `speckle()`, `shine()`, `shrinkwrap()`, `vignette()`, `contourLines()`, `checkerboard()`, `halftoneLinearGradient()`, `gridlines()`, `whiteNoise()`, `tvSignalOff()`, `lines()`, `rings()`, `waves()`, `zigzag()`, `lightLeak()`, `starburst()`.

## 3D content

See [3d.md](3d.md) for 3D content in Remotion using Three.js and React Three Fiber.

## Sound effects

When needing to use sound effects, load the [./sfx.md](./sfx.md) file for more information.

## Audio visualization

When needing to visualize audio (spectrum bars, waveforms, bass-reactive effects), load the [./audio-visualization.md](./audio-visualization.md) file for more information.

## Captions

When dealing with captions or subtitles, load the [Remotion Captions](../remotion-captions/SKILL.md) skill for more information.

## Google Fonts

Is the recommended way to load fonts in Remotion. See [google-fonts.md](google-fonts.md) for how to load Google Fonts.

## Local fonts

See [local-fonts.md](local-fonts.md) for how to load local fonts.

## GIFs

See [gifs.md](gifs.md) for how to display GIFs synchronized with Remotion's timeline.

## Advanced Images

See [images.md](images.md) for sizing and positioning images, dynamic image paths, and getting image dimensions.

## Lottie animations

See [lottie.md](lottie.md) for embedding Lottie animations in Remotion.

## Advanced timing

See [timing.md](timing.md) for advanced timing with `interpolate` and Bézier easing, and springs.

## Parameterized videos

See [parameters.md](parameters.md) for making a composition parametrizable by adding a Zod schema.

## Measuring DOM nodes

See [measuring-dom-nodes.md](measuring-dom-nodes.md) for measuring DOM element dimensions in Remotion.

## Measuring text

See [measuring-text.md](measuring-text.md) for measuring text dimensions, fitting text to containers, and checking overflow.

## Using FFmpeg

For some video operations, such as trimming videos or detecting silence, FFmpeg should be used. Load the [./ffmpeg.md](./ffmpeg.md) file for more information.

## Silence detection

When needing to detect and trim silent segments from video or audio files, load the [./silence-detection.md](./silence-detection.md) file.

## Dynamic duration, dimensions and data

See [calculate-metadata.md](calculate-metadata.md) for dynamically set composition duration, dimensions, and props.

## Advanced compositions

See [compositions.md](compositions.md) for how to define stills, folders, default props and for how to nest compositions.

## Advanced sequencing

See [sequencing.md](sequencing.md) for more sequencing patterns - delay, trim, limit duration of items.

## Install modules

Use `npx remotion add` to add new packages with the right version:

```
npx remotion add @remotion/media
```

This goes for `@remotion/*` packages, `mediabunny`, `@mediabunny/*`, and `zod`.

## Previewing markup

Only do this if you think the user wants to see the preview.

```bash
npx remotion studio --no-open
```

This will start a long-running process and print the server URL for the preview.  
If already started, the URL will be printed.

## Optional: one-frame render check

You can render a single frame with the CLI to sanity-check layout, colors, or timing.  
Skip it for trivial edits, pure refactors, or when you already have enough confidence from Studio or prior renders.

```bash
npx remotion still [composition-id] --scale=0.25 --frame=30
```

At 30 fps, `--frame=30` is the one-second mark (`--frame` is zero-based).
