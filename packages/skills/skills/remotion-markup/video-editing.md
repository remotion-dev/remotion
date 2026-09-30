# Editable video timelines

The Studio edits the JSX source node that created a timeline item. Every clip
that should be trimmed, moved, renamed, reordered, duplicated or deleted on its
own therefore needs its own authored JSX node, with its editable timing props
written directly on that node.

This source structure is intentional repetition: It gives every runtime clip a
separate source-editing target. A `.map()` or another programmatic loop instead
creates multiple runtime clips from one JSX node. Use that only when the
instances are intentionally controlled as one template and do not need
independent editing.

Choose the timeline structure based on the editing behavior:

- Use independently positioned clips when moving or resizing one clip should
  not affect any other clip.
- Use `<Series>` for consecutive clips when changing one clip's duration should
  reposition every later clip.
- Use `<TransitionSeries>` when consecutive clips also need transitions or
  overlays.

## Independently positioned clips

Place every `<Video>` directly in the composition and hardcode its timing
props. `from={0}` may be omitted:

```tsx
<Video
  name="Opening"
  src="https://remotion.media/video.mp4"
  trimBefore={0}
  durationInFrames={78}
/>
<Video
  name="Interview"
  src="https://remotion.media/video.webm"
  trimBefore={12}
  from={78}
  durationInFrames={66}
/>
<Video
  name="Closing"
  src="https://remotion.media/video.mp4"
  trimBefore={72}
  from={144}
  durationInFrames={90}
/>
```

- `from` is the clip's absolute start frame in its parent timeline.
- `durationInFrames` is how many source frames are shown, starting at `trimBefore`. At the default `playbackRate`, this is how long the clip remains visible.
- `trimBefore` is how many source frames are skipped before playback begins.
- Keep `name`, `from`, `durationInFrames` and `trimBefore` inline on each clip.
- Import `<Video>` from `@remotion/media`.

Moving or resizing one of these clips does not reposition later clips. Gaps and
overlaps are therefore allowed.

## Consecutive clips with `Series`

Use `<Series>` when the clips should remain adjacent and do not need
transitions:

```tsx
<Series>
  <Series.Sequence name="Opening" durationInFrames={78}>
    <Video
      src="https://remotion.media/video.mp4"
      trimBefore={0}
    />
  </Series.Sequence>
  <Series.Sequence name="Interview" durationInFrames={66}>
    <Video
      src="https://remotion.media/video.webm"
      trimBefore={12}
    />
  </Series.Sequence>
  <Series.Sequence name="Closing" durationInFrames={90}>
    <Video
      src="https://remotion.media/video.mp4"
      trimBefore={72}
    />
  </Series.Sequence>
</Series>
```

The `<Series.Sequence>` is the editable clip row. Changing its
`durationInFrames` repositions every later sequence. Do not set `from` on a
`<Series.Sequence>`; the series calculates each start frame.

Keep every sequence as a separate JSX node with a hardcoded `name` and
`durationInFrames`. The child may also be a custom clip or scene component:

```tsx
<Series.Sequence name="Product demo" durationInFrames={150}>
  <ProductDemo />
</Series.Sequence>
```

## Consecutive clips with transitions

Use `<TransitionSeries>` when the timeline needs transitions or overlays.
Preserve the same one-source-node-per-clip structure:

```tsx
<TransitionSeries name="Video timeline">
  <TransitionSeries.Sequence name="Opening" durationInFrames={78}>
    <Video
      src="https://remotion.media/video.mp4"
      trimBefore={0}
    />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({durationInFrames: 12})}
  />
  <TransitionSeries.Sequence name="Interview" durationInFrames={66}>
    <Video
      src="https://remotion.media/video.webm"
      trimBefore={12}
    />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

The `<TransitionSeries.Sequence>` is the editable clip row. Do not set `from`
on it; the series calculates the start frame and accounts for transition
overlaps.

Read [transitions.md](transitions.md) for transition types, imports,
installation instructions and composition-duration calculation. Import
`<Video>` from `@remotion/media`, and keep the parent composition's
`durationInFrames` as an inline literal after accounting for all clip durations
and transition overlaps.
