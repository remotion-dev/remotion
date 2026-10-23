# Disco light show selects

Standalone clips live in Studio under **DiscoLightShow → Selects**. Their components
are in this directory, and their media is hosted on `remotion.media` under
`jonnys-videos/disco-light-show/selects/`. Filenames include a SHA-256 prefix to
keep updated assets from sharing a cached URL.
The party clips keep their original audio. Their source times refer to `IMG_7933.MOV`.
The Superfreak and Evacuate clips use the re-recording and its synchronized
clean show audio instead.

| Composition               | Source range    | Duration  | Frame size         | Framing                                                                   |
| ------------------------- | --------------- | --------- | ------------------ | ------------------------------------------------------------------------- |
| `GreenStrobe`             | 26:14–26:20     | 6 seconds | 540 × 960, 30 fps  | Approved vertical crop, with the upper background softened.               |
| `ThreePersonChoreography` | 29:19.5–29:24.5 | 5 seconds | 1132 × 440, 30 fps | Approved 4° clockwise rotation and torso crop, for use as a small insert. |

## Superfreak

Four clips are grouped under **Selects → Superfreak**, with their components in
`superfreak/`. All are 1920 × 1080 at 30 fps, reuse the hosted recording and clean
master, and mute the camera audio.

| Composition             | Camera range        | Video / audio trim (frames) | Duration   |
| ----------------------- | ------------------- | --------------------------- | ---------- |
| `SuperfreakOpening`     | 38:03.467–38:20.467 | 68504 / 68120               | 17 seconds |
| `SuperfreakOrangeBreak` | 38:32.467–38:42.467 | 69374 / 68990               | 10 seconds |
| `SuperfreakChorus`      | 38:49.967–39:02.967 | 69899 / 69515               | 13 seconds |
| `SuperfreakRiff`        | 39:45.267–40:01.267 | 71558 / 71174               | 16 seconds |

`SuperfreakRiff` is a 16-second landscape select from the re-recording, retaining
the 1920 × 1080 framing and muted camera sound. It starts 107.8 seconds into the song,
just before the later instrumental break around 108.3 seconds.

- Camera range (`IMG_8034.MOV`): 39:45.267–40:01.267, frames 71558–72038 (end exclusive).
- Clean audio range (`DmxAll`): 39:32.467–39:48.467, frames 71174–71654 (end exclusive).
- The 384-frame / 12.8-second synchronization offset matches the full re-recording.
- It reuses the hosted assets in `../recordings/assets.ts`; no duplicate media is needed.

## Evacuate the Dancefloor

Six compositions are grouped chronologically under **Selects → EvacuateTheDancefloor**, with their
source components in `evacuate/`. All keep the 384-frame / 12.8-second clean-audio
offset and mute the camera sound. They reuse the hosted recording directly.

| Composition             | Camera range  | Video / audio trim (frames) | Duration     | Framing                                                                                |
| ----------------------- | ------------- | --------------------------- | ------------ | -------------------------------------------------------------------------------------- |
| `EvacuateOpeningHook`   | 30:48–31:04   | 55440 / 55056               | 16 seconds   | Full 1920 × 1080, opening vocal hook and green lighting.                               |
| `EvacuateDrop`          | 31:34–31:50   | 56820 / 56436               | 16 seconds   | Full 1920 × 1080, build into the first drop.                                           |
| `EvacuateHypnotized`    | 32:15–32:26.5 | 58050 / 57666               | 11.5 seconds | Full 1920 × 1080, second verse ending after “everybody step aside.”                    |
| `EvacuateLightsCloseup` | 32:42–32:52   | 58860 / 58476               | 10 seconds   | 960 × 540 crop at source x=200, y=500, highlighting the flood, moving head, and mixer. |
| `EvacuateNeonExit`      | 33:49–34:01   | 60870 / 60486               | 12 seconds   | Full 1920 × 1080, neon exit sign into the strobe pattern.                              |
| `EvacuateGreenOutro`    | 34:10–34:26   | 61500 / 61116               | 16 seconds   | Full 1920 × 1080, instrumental outro and bright green light pulses.                    |

Hosted media:

- [Green strobe](https://remotion.media/jonnys-videos/disco-light-show/selects/green-strobe-a4a0a9ab771c.mp4)
- [Three-person choreography](https://remotion.media/jonnys-videos/disco-light-show/selects/three-person-choreography-5s-568702c0016b.mp4)

The green-strobe source crop is x=90, y=180, width=506, height=900. The hosted
file preserves the reviewed clip exactly. Any new framing should be checked again
for visible audience faces.

## Privacy check

The exact hosted party clips were checked frame by frame: all 150 choreography
frames keep faces outside the crop, and all 180 green-strobe frames retain the
softened background with no recognizable audience faces. Automated face detection
also returned no faces in either clip. Changing either crop requires another check.

The Superfreak and Evacuate selects show the DJ in the re-recording room; faces
on the projected music videos are part of those videos, not audience members.
A review of 452 sampled frames across the full re-recording (15-second intervals,
plus one-second samples through the new selects) found no other people in the room.

## Hosted asset verification

All four imported media files are hosted on R2. The recording and clean master
are shared across compositions; no copies of these media files belong in Git.
Public files were verified against the local SHA-256 hashes before repository
copies were removed. Original source files and review exports remain outside the
repository.

| Asset                         |         Bytes | SHA-256                                                            |
| ----------------------------- | ------------: | ------------------------------------------------------------------ |
| Green strobe                  |     2,072,112 | `a4a0a9ab771ca9dff7610be79fd878127fa2675a1795fc330f099386a7fbbfc5` |
| Choreography, first 5 seconds |     2,301,831 | `568702c0016b291e76a06ec4254f45a4bc1a21c124559038d0bcef5b7d204a69` |
| Re-recording                  | 6,961,071,740 | `1a879dc654c91e14e5723f85b57ebbd783b63802c15b400115c9405b49036421` |
| Clean show audio              |   153,069,876 | `3e8951a3f0efee9410954f475ccc30cc29be4a32aa74f43458f564c15ca03244` |
