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

Use `Easing.bezier()` to customize timing, including jumpy or overshooting motion.
Use `Easing.spring()` if you want spring animations.

Structure your markup according to [Remotion Interactivity Best Practices](../remotion-interactivity/SKILL.md)

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
  scale: interpolate(frame, [0, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.spring({damping: 200}),
    output: 'perceptual-scale' // For `scale` animations, use "output: 'perceptual-scale'"
  }),
  translate: interpolate(frame, [0, 100], ["0px 0px", "100px 100px"], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.spring({damping: 200}),
  }),
  rotate: interpolate(frame, [0, 100], ["20deg", "90deg"], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.spring({damping: 200}),
  }),
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
Add images using the `<CanvasImage>` component.
Use `staticFile()` for files in `public/` or pass a remote URL directly:

```tsx
import { Audio, Video } from "@remotion/media";
import { staticFile, CanvasImage } from "remotion";

export const MyComposition = () => {
  return (
    <>
      <Video src={staticFile("video.mp4")} style={{ opacity: 0.5 }} />
      <Audio src={staticFile("audio.mp3")} />
      <CanvasImage src={staticFile("logo.png")} style={{ width: 100, height: 100 }} />
      <Video src="https://remotion.media/video.mp4" />
    </>
  );
};
```

To delay content wrap it in `<Sequence>` and use `from`.
To limit the duration of an element, use `durationInFrames` of `<Sequence>`.
`<Sequence>` by default is an absolute fill covering the scene.  
For inline content, use `layout="none"`.

```tsx
const Main = () => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill>
        <Sequence name="Title" from={30} durationInFrames={60} layout="none">
          <Title />
        </Sequence>
        <Sequence name="Subtitle" from={60} durationInFrames={60} layout="none">
          <Subtitle />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export const Title = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Label"
      style={{
        opacity: interpolate(frame, [0, 60], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        fontSize: 88
      }}
    >
      Title
    </Interactive.Div>
  );
};

export const Subtitle = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Label"
      style={{
        opacity: interpolate(frame, [0, 60], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        fontSize: 32
      }}
    >
      Title
    </Interactive.Div>
  );
};
```

## Maps

See [Remotion Maps](remotion-maps/SKILL.md) for choosing a map technique.

## Text highlights and annotations

See [text-highlights.md](text-highlights.md) for text highlights (highlight markers), circles, underlines, strike-throughs, crossed-off text, boxes, and brackets.

## Voiceover

See [voiceover.md](voiceover.md) for adding AI-generated voiceover to Remotion compositions using ElevenLabs TTS.

## Trimming

See [trimming.md](trimming.md) for trimming patterns - cutting the beginning or end of animations.

## Embedding Videos

See [embedding-videos.md](embedding-videos.md) for advanced knowledge about embedding videos - trimming, volume, speed, looping, pitch.

## Video editing

See [video-editing.md](video-editing.md) for structuring editable video timelines in Remotion Studio.

## Embedding Audio

See [audio.md](audio.md) for advanced audio features like trimming, volume, speed, pitch.

## Transitions

See [transitions.md](transitions.md) for scene transition patterns.

## Visual and pixel effects

When creating a visual effect, consider whether it is feasible using CSS and HTML, or whether a shader is needed. Order or preference:

1. Normal Remotion/HTML/CSS/SVG/filter/blend/mask animation
2. An effect applied to the element directly (`<Video>`, `<Img>`), or by wrapping the content in [`<HtmlInCanvas>`](html-in-canvas.md), which also accepts `effects`:
  - A listed effect via [effects.md](effects.md)
  - A custom `createEffect()` via [effects.md](effects.md) when no preset is available.

## 3D content

See [3d.md](3d.md) for 3D content in Remotion using Three.js and React Three Fiber.

## Sound effects

When needing to use sound effects, load the [./sfx.md](./sfx.md) file for more information.

## Audio visualization

When needing to visualize audio (spectrum bars, waveforms, bass-reactive effects), load the [./audio-visualization.md](./audio-visualization.md) file for more information.

## Maps

For static maps, animated routes and markers, geographic explainers, Mapbox, MapLibre, MapTiler, GeoJSON, or 3D geographic flyovers, load [Remotion Maps](../remotion-maps/SKILL.md).

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

This will start a long-running process and print the server URL for the preview.  
If server is already started, it will print the URL.
You can visit a specific composition by navigating to `/[composition-id]`, for example `http://localhost:3000/MapAnimation`.

## Optional: one-frame render check

You can render a single frame with the CLI to sanity-check layout, colors, or timing.  
Skip it for trivial edits, pure refactors, or when you already have enough confidence from Studio or prior renders.

```bash
npx remotion still [composition-id] --scale=0.25 --frame=30
```

At 30 fps, `--frame=30` is the one-second mark (`--frame` is zero-based).
