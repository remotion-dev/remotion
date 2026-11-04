# Animating the lights

Open **DiscoLightShow → AnimatingTheLights → AnimateTheLights** in Studio.
The 1080 × 1920, 30 fps draft lasts 1,947 frames (64.9 seconds).

The narration follows the current `../script-lights-draft.md`, including its
loop-back ending. Generated with ElevenLabs v4, Derek – Fun & Energetic
(`Q0Et7LOU7VpeoeCRQAVS`), first take from flow
`3OSn8zFOqJQ2uiuNbWS8`, generation `K0REcNWqTNptDinnoEA3`.

`LightsCaptions.tsx` contains editable, word-timed captions. Timings were
transcribed from this exact take, then matched to all 187 script tokens so
names such as ENTTEC, DMX, QLC+, and Web Serial retain the supplied spelling.
Narration and captions share one sequence; all footage is muted.
The music track reuses Master's “Kein Kokain” instrumental at the same 7%
volume and source offset, with a short fade in and a fade out at the end.

The visual track contains only the clean solo footage, looping continuously
through the narration. Its square corners and 2px blue outline match the
TextBehindVideo stack. The existing dark paper background remains underneath.
There are no added titles, logos, diagrams, code cards, or recorder graphics.

The friends-dancing shots and the original clip’s opening with background
guests are excluded. The solo excerpt shows only the presenter and equipment.

## Assets added

- Solo footage: `solo-dmx-light-show-8c06c9856456.mp4`
  - Trim: 2.25–6.00 seconds of the existing light-show recording, audio removed.
  - SHA-256: `8c06c9856456ed94764f64ee98ef857b6566329c0a69d6c1448d17955b399284`

- Narration: `elevenlabs-lights-web-serial-57e3c1ea2341.mp3`
  - SHA-256: `57e3c1ea23418aa1401097f0d085f356dde50be4ba4b2170da678ebb45a22611`

All are hosted at `https://remotion.media/jonnys-videos/disco-light-show/` and
verified against the source bytes. No new long video recording was uploaded.

## Protocol wording

The narration and captions use **Web Serial**, matching
`navigator.serial.requestPort()` in `birthday-bash/src/enttec.ts`.
