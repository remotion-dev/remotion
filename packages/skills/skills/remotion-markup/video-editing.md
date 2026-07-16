Remotion can be used for bare-bones video editing in the Studio. Choose the source structure based on the editing behavior you want:

- Use independently positioned clips when moving or resizing one clip should not affect any other clip.
- Use ripple editing when changing one clip's duration should reposition every clip after it.

Keep every editable clip as its own authored JSX node. Do not generate editable clips with `.map()` or another programmatic loop.

## Independently positioned clips

Place every `<Video>` directly in the composition and hardcode its timing props. `from={0}` may be omitted:

```tsx
<Video src="https://remotion.media/video.mp4" trimBefore={0} durationInFrames={78} />
<Video src="https://remotion.media/video.webm" trimBefore={12} from={78} durationInFrames={66} />
<Video src="https://remotion.media/video.mp4" trimBefore={72} from={144} durationInFrames={90} />
<Video src="https://remotion.media/video.webm" trimBefore={58} from={234} durationInFrames={72} />
<Video src="https://remotion.media/video.mp4" trimBefore={180} from={306} durationInFrames={60} />
```

- `from` is the clip's absolute start frame in its parent timeline.
- `durationInFrames` is how many frames the clip remains visible.
- `trimBefore` is how many source frames are skipped before playback begins.
- Each `<Video>` must be a separate JSX node. Add a descriptive `name` when useful in the Studio timeline.
- `from`, `durationInFrames`, and `trimBefore` must be hardcoded frame values. Do not compute them.
- Import `<Video>` from `@remotion/media`.

Moving or resizing one of these clips does not reposition later clips. Gaps and overlaps are therefore allowed.

## Ripple editing with `TransitionSeries`

“Ripple editing” is the standard video-editing term for changing one clip and automatically shifting everything after it.
In Remotion, a `<TransitionSeries>` provides this sequential, cascading timing model while also allowing transitions between clips.

Read [transitions.md](transitions.md) for transition types, timing options, installation instructions, and composition-duration calculation.

Keep the markup like this:

```tsx
<TransitionSeries name="Video timeline">
  <TransitionSeries.Sequence name="Clip 1" durationInFrames={39}>
    <Video
      src="https://remotion.media/video.mp4"
      trimBefore={0}
    />
  </TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="Clip 2" durationInFrames={45}>
    <Video
      src="https://remotion.media/video.webm"
      trimBefore={8}
    />
  </TransitionSeries.Sequence>
  <TransitionSeries.Sequence name="Clip 3" durationInFrames={43}>
    <Video
      src="https://remotion.media/video.mp4"
      trimBefore={60}
    />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

- The `<TransitionSeries.Sequence>` is the editable clip row in the Studio timeline.
- Dragging its right edge changes `durationInFrames` and repositions every later sequence.
- Do not set `from` on `<TransitionSeries.Sequence>`; the series calculates each start frame.
- Hardcode all numeric values.
- Do not programmatically create multiple `<TransitionSeries.Sequence>` (no `.map`). Each instance must be hard-coded.
- Import `<Video>` from `@remotion/media`. Import `<TransitionSeries>` from `@remotion/transitions`. If needing to install: `npx remotion add @remotion/media @remotion/transitions`
