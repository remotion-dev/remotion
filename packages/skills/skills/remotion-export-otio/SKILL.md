---
name: remotion-export-otio
description: Export a Remotion composition as an OpenTimelineIO (.otio) timeline for DaVinci Resolve or Premiere Pro
version: 4.0.506
---

Use this skill when the user wants to hand a Remotion video over to a video editor, for example:

- "Export this composition as OTIO"
- "I want to finish this edit in DaVinci Resolve"
- "Give me a timeline I can import into Premiere"
- "Turn this rough cut into something my editor can open"

Prefer OpenTimelineIO (`.otio`). It is a documented JSON format and is imported by DaVinci Resolve and, via converters, by other editors. Only produce EDL, FCPXML or Premiere XML if the user explicitly asks for those.

## What can and cannot be exported

A Remotion composition is React code, not a timeline data structure. There is no deterministic mapping from code to a timeline, so an export is a **rough cut**, not a lossless conversion.

Can become clips:

- `<Video>` and `<Audio>` from `@remotion/media`
- `<OffthreadVideo>`, `<Video>` and `<Audio>` from `remotion`
- `<Img>` from `remotion`, if the user wants the still images on the timeline too

Cannot become clips, and become gaps or are dropped:

- Text, shapes, `<AbsoluteFill>`s, animations, `interpolate()`, `spring()`
- Effects from `@remotion/effects`, transitions from `@remotion/transitions`
- `playbackRate`, `volume` curves, `style` transforms
- Anything drawn on a `<canvas>` or by `@remotion/three`, `@remotion/lottie`, `@remotion/skia`

If the user needs those parts, tell them to render them to a video file with `npx remotion render` and place that file on the timeline instead.

## Step 1: Read the timeline out of the code

1. Find the `<Composition>` and note its `fps`, `durationInFrames`, `width` and `height`. If it has `calculateMetadata`, read what that function returns, and use the input props that are actually being used.
2. Walk the component tree and collect every media element with a real `src`.
3. For each media element, compute its **absolute start frame** by adding up the `from` prop of every `<Sequence>` it is nested in. `<Series>` and `<TransitionSeries>` place their children back to back, so accumulate their `durationInFrames`.
4. Note `durationInFrames` of the closest wrapping `<Sequence>`, or the remaining composition duration if there is none.
5. Note `trimBefore` and `trimAfter`, which are in frames and describe which part of the source file is used.

Do not guess. If placement depends on props, conditionals or data that is fetched at runtime, ask the user which case to export, or export the default case and say so.

## Step 2: Convert frames to OTIO time

Every time value is a `RationalTime` with `rate` set to the composition `fps` and `value` set to a frame count:

```json
{ "OTIO_SCHEMA": "RationalTime.1", "value": 90, "rate": 30 }
```

For each clip:

- `source_range.start_time` is the in-point **inside the source file**, which is `trimBefore` (or `0`).
- `source_range.duration` is how many frames the clip occupies on the timeline.
- The position on the timeline is **not** stored on the clip. Children of a track are laid end to end, so insert a `Gap.1` before a clip that does not start where the previous one ended.

If the source file has a different frame rate than the composition, the frame numbers still describe the same points in time, and Resolve conforms the media on import.

## Step 3: Resolve media paths

- `staticFile("video.mp4")` refers to `public/video.mp4` in the project. Turn it into an absolute `file://` URL, for example `file:///Users/me/my-video/public/video.mp4`, so that Resolve links the media without asking.
- A remote URL cannot be linked by Resolve. Download it into `public/` first, or keep the URL as `target_url` and tell the user they have to relink.
- Fill in `available_range` with the full length of the source file. Get it with `npx remotion ffprobe public/video.mp4`. Resolve imports the timeline without it, but the FCP XML converter used for Premiere fails on a media reference that has no `available_range`, so only leave it out if the file is not reachable. Never invent a duration.

## Step 4: Write the `.otio` file

Write one video track and one audio track unless the composition clearly needs more, for example when clips overlap in time. Overlapping clips must go on separate tracks, because a track is a sequence, not a layer.

```json
{
  "OTIO_SCHEMA": "Timeline.1",
  "name": "MyComposition",
  "global_start_time": {
    "OTIO_SCHEMA": "RationalTime.1",
    "value": 0,
    "rate": 30
  },
  "tracks": {
    "OTIO_SCHEMA": "Stack.1",
    "name": "tracks",
    "children": [
      {
        "OTIO_SCHEMA": "Track.1",
        "name": "V1",
        "kind": "Video",
        "children": [
          {
            "OTIO_SCHEMA": "Gap.1",
            "name": "Intro animation",
            "source_range": {
              "OTIO_SCHEMA": "TimeRange.1",
              "start_time": {
                "OTIO_SCHEMA": "RationalTime.1",
                "value": 0,
                "rate": 30
              },
              "duration": {
                "OTIO_SCHEMA": "RationalTime.1",
                "value": 30,
                "rate": 30
              }
            }
          },
          {
            "OTIO_SCHEMA": "Clip.1",
            "name": "interview.mp4",
            "source_range": {
              "OTIO_SCHEMA": "TimeRange.1",
              "start_time": {
                "OTIO_SCHEMA": "RationalTime.1",
                "value": 60,
                "rate": 30
              },
              "duration": {
                "OTIO_SCHEMA": "RationalTime.1",
                "value": 150,
                "rate": 30
              }
            },
            "media_reference": {
              "OTIO_SCHEMA": "ExternalReference.1",
              "target_url": "file:///Users/me/my-video/public/interview.mp4",
              "available_range": {
                "OTIO_SCHEMA": "TimeRange.1",
                "start_time": {
                  "OTIO_SCHEMA": "RationalTime.1",
                  "value": 0,
                  "rate": 30
                },
                "duration": {
                  "OTIO_SCHEMA": "RationalTime.1",
                  "value": 900,
                  "rate": 30
                }
              }
            }
          }
        ]
      },
      {
        "OTIO_SCHEMA": "Track.1",
        "name": "A1",
        "kind": "Audio",
        "children": [
          {
            "OTIO_SCHEMA": "Clip.1",
            "name": "music.mp3",
            "source_range": {
              "OTIO_SCHEMA": "TimeRange.1",
              "start_time": {
                "OTIO_SCHEMA": "RationalTime.1",
                "value": 0,
                "rate": 30
              },
              "duration": {
                "OTIO_SCHEMA": "RationalTime.1",
                "value": 180,
                "rate": 30
              }
            },
            "media_reference": {
              "OTIO_SCHEMA": "ExternalReference.1",
              "target_url": "file:///Users/me/my-video/public/music.mp3",
              "available_range": {
                "OTIO_SCHEMA": "TimeRange.1",
                "start_time": {
                  "OTIO_SCHEMA": "RationalTime.1",
                  "value": 0,
                  "rate": 30
                },
                "duration": {
                  "OTIO_SCHEMA": "RationalTime.1",
                  "value": 3600,
                  "rate": 30
                }
              }
            }
          }
        ]
      }
    ]
  }
}
```

The example maps to this composition at 30fps:

```tsx
<Sequence from={30} durationInFrames={150}>
  <Video src={staticFile("interview.mp4")} trimBefore={60} />
</Sequence>
<Audio src={staticFile("music.mp3")} />
```

Write the file next to the project, for example `out/MyComposition.otio`, and validate that it is parseable JSON before reporting success.

## Step 5: Report back

Always tell the user:

1. Where the `.otio` file was written.
2. Which elements became clips.
3. Which elements were skipped, and why, so nobody assumes the export is complete.

Then give the import steps:

```
1. Open DaVinci Resolve
2. File → Import → Timeline… and select the .otio file
   (or right-click in the Media Pool → Timelines → Import → AAF, EDL, XML)
3. Relink media if Resolve cannot find the files
```

OTIO import requires DaVinci Resolve 17 or later.

Premiere Pro does not read `.otio` directly. Convert the timeline to FCP7 XML, which Premiere imports:

```bash
pip install OpenTimelineIO otio-fcp-adapter
otioconvert -i timeline.otio -o timeline.xml -O fcp_xml
```

## Do not

- Do not invent media files, durations or paths that are not in the composition.
- Do not claim frame accuracy for a composition whose timing depends on runtime data.
- Do not model effects, transitions or animations as OTIO effects. Leave them out and mention them.
- Do not build a multi-track structure when a single video track and a single audio track represent the edit.
