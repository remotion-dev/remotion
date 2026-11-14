# Editable video timelines

Structure the timeline around the things the user edits together: a captioned
shot, a set of cutaways, or an independently timed music segment. Write every
independently editable clip as its own JSX node with inline names and props.
Use the [timeline structure guide](../remotion-interactivity/timeline-structure.md)
for choosing tracks, timing groups, and connected compositions.

## Choose the cut behavior

Use a named `Track` for non-overlapping clips with independent start times. Keep
`from`, `trimBefore`, `durationInFrames`, and `playbackRate` on each clip. Moving
or resizing one clip then leaves the other start times unchanged.

Use `TransitionSeries` when consecutive clips should remain adjacent. Put
`durationInFrames` on each `TransitionSeries.Sequence`; the series calculates
start times and repositions later clips after a duration change. It also handles
overlapping transitions. Preserve these specialized boundaries when refactoring.

Get `fps` from `useVideoConfig()` for seconds-to-frames expressions, and keep
them on the JSX node, such as `trimBefore={4 * fps}`. Literal frame counts are
appropriate when the edit is already specified in frames.

## Keep synchronized layers on one clock

Put a source's video and full inline transcript in a component created with
`Interactive.create()`. Keep source-synchronized overlays in that component too.
Apply `trimBefore`, `durationInFrames`, and `playbackRate` to the shared timing
boundary once. For an independently placed group, also set its `from`.

Moving, trimming, retiming, or deleting the group in Studio affects all its layers.
For consecutive shots, reuse the source component inside the existing
`TransitionSeries.Sequence`:

```tsx
import {Video} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {Interactive, staticFile, useVideoConfig} from 'remotion';
import {BasicCaptions} from './basic-captions.element';

const InterviewSourceInner = () => {
  return (
    <>
      <Video name="Interview footage" src={staticFile('interview.mp4')} />
      <BasicCaptions
        name="Interview captions"
        width={900}
        style={{position: 'absolute', bottom: 80, translate: '510px 0px'}}
        captions={[
          {
            text: 'Hello',
            startMs: 4500,
            endMs: 4900,
            timestampMs: 4700,
            confidence: null,
          },
          {
            text: ' world',
            startMs: 4900,
            endMs: 5400,
            timestampMs: 5150,
            confidence: null,
          },
          {
            text: 'Next',
            startMs: 10500,
            endMs: 11000,
            timestampMs: 10750,
            confidence: null,
          },
        ]}
      />
    </>
  );
};

export const InterviewSource = Interactive.create({
  Component: InterviewSourceInner,
  layout: 'absolute-fill',
});

export const Interview = () => {
  const {fps} = useVideoConfig();
  return (
    <TransitionSeries name="Interview shots">
      <TransitionSeries.Sequence
        name="Opening"
        trimBefore={4 * fps}
        durationInFrames={3 * fps}
      >
        <InterviewSource />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence
        name="Next shot"
        trimBefore={10 * fps}
        durationInFrames={2 * fps}
      >
        <InterviewSource />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

Both cuts use one inline transcript, with timestamps relative to the original
media file. Splitting a clip reuses the source component instead of duplicating
its transcript, and the captions remain editable in Studio. See
[displaying captions](../remotion-captions/display-captions.md#one-component-per-captioned-source)
for the caption component and setup.

## Place overlays at the scope they span

Keep a source-synchronized HUD inside its shot. Put a sticker that continues
across several cuts in the enclosing scene, so the end of the first cut does
not unmount it. Use that scene's frame coordinates for its timing.

Within a shot or scene, put successive cutaways on a named `Cutaways` track.
Keep simultaneous visuals on separate tracks. If cutaways cover a speaking
video, retain the underlying speech or deliberately separate its audio; removing
an obscured video can also remove the voice.

Group a sticker or other visual with its accompanying sound when they should
move or be deleted together. Keep their local offsets inside the group. Give
both the visual and sound their intended durations so the group neither cuts
off a sound tail nor extends the visual to cover that tail.

## Put music segments on a shared track

Music clips with gaps or adjacent boundaries can share one named track. They
remain separately editable, including their source trims and volume envelopes:

See the [complete timeline example](../remotion-interactivity/timeline-structure.md)
for a music track alongside scene tracks.

Check natural audio durations as well as explicit bounds before putting sounds
on a track. An item may end exactly where the next begins, but overlapping tails
need separate tracks. Do not shorten sounds just to make them fit.

## Preserve the edit when restructuring

Keep source trims, cut lengths, playback rates, caption arrays, volume envelopes,
and stacking order unchanged unless the user requested an edit. Moving content
under a new timing boundary can change the frame returned by `useCurrentFrame()`;
preserve the source clock or adjust local offsets deliberately.

Verify the full composition and any connected views, rather than judging the
result only from a standalone scene. Check visual output and audio around cuts,
overlay boundaries, and sound tails. Grouping the timeline should preserve the
existing edit while making its controls easier to use.
