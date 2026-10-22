# Disco light show re-recording

`DiscoLightShowRerecording` is under **DiscoLightShow → Recordings** in Studio.
It retains the full landscape camera recording at 1920 × 1080, on a 30 fps timeline.
The source is variable frame rate; placement is based on elapsed time.

## Sources

- Camera: `/Users/jonathanburger/Downloads/IMG_8034.MOV` (1:17:17.618).
- Original project: `/Users/jonathanburger/birthday-bash`.
- Original composition: `DmxAll`, registered in `remotion/Root.tsx`.
- Program audio: `public/dmx-all.wav`, the continuous master used by
  `remotion/src/DmxAll.tsx`. Its per-track audio is disabled in this composition;
  the alternate karaoke master has zero gain by default.
- Audio-only export: `dmx-all-clean.m4a`, stereo 44.1 kHz AAC at 256 kbps,
  exported from that original program master without changing its timing.
- Both imported assets are hosted on R2; their URLs are in `assets.ts`.
  The user's original files remain outside this repository.

## Sync

The camera captured two short starts of “Love Vibration” before the continuous
take. Each needs a separate source offset. Camera sound is muted throughout;
setup pauses and the final camera tail are silent.

| Audio section     | Timeline start (frames) | Audio source start (frames) | Duration (frames) | Timeline minus source (seconds) |
| ----------------- | ----------------------- | --------------------------- | ----------------- | ------------------------------- |
| Rehearsal start 1 | 399                     | 4438                        | 1257              | -134.633333                     |
| Rehearsal start 2 | 2195                    | 4405                        | 2385              | -73.666667                      |
| Continuous take   | 4789                    | 4405                        | 133887            | 12.8                            |

All numbers are at 30 fps. The continuous take begins at source 2:26.833;
the preceding “Arctic” track was not part of this continuous take.
Short fades suppress clicks at the two rehearsal stops. The recording is not
time-stretched.

Audio correlation was measured from band-passed 2 kHz mono analysis copies.
The continuous take was checked across 47 windows; 46 had correlation above 0.08.
Their median offset was 12.785 seconds, with observed peaks from 12.7555 to
12.8235 seconds. A 12.8-second frame-aligned offset keeps this spread within
about 45 ms. Repeated musical phrases were disambiguated by the neighboring
windows and the source timeline visible in the recording.

Detailed analysis and the audio export are saved outside the repository in
`/Users/jonathanburger/Movies/disco-light-show-rerecording/`.
