# Disco setup scene review

Open `Setup-Key-Scenes` in Remotion Studio for an 18-shot review (4:44) in setup order.
`Setup-Long-Take` and `Setup-Short-Take` retain the complete source timelines with
named chapters. Click a clip or chapter in the timeline to navigate. The scene timings are
visually verified action windows (roughly 2–3-second precision), ready for
frame-level refinement. Each scene
has editable source-in time, duration, title, notes, active step, and transcript.
Timecodes on the video always refer to the original recording.

## Recommended picks

| Scene                                | Source   | Source in–out   | Notes                                                                                                             |
| ------------------------------------ | -------- | --------------- | ----------------------------------------------------------------------------------------------------------------- |
| Get the laptop out                   | short    | 00:31.0–00:41.0 | Short take · laptop comes onto the table and opens.                                                               |
| Attach the USB-C adapter             | short    | 00:41.0–00:50.0 | Clear product close-up, then the adapter goes into the laptop.                                                    |
| ENTTEC USB to DMX                    | short    | 00:51.0–00:56.0 | The interface is shown to camera; its name is spoken.                                                             |
| Connect the ENTTEC interface         | short    | 01:06.0–01:22.0 | USB-B into the ENTTEC, then USB-A into the laptop adapter.                                                        |
| Attach the 3-to-5-pin converter      | short    | 01:46.0–01:59.0 | Clear 3-pin / 5-pin adapter close-up, then attachment to the ENTTEC interface.                                    |
| Join the DMX cable connectors        | long     | 02:51.6–03:04.0 | The clean repeat after the explicit “do not use that take” comment.                                               |
| Connect the first moving head        | long     | 03:07.0–03:24.0 | Close view of the first fixture and its DMX connection.                                                           |
| Power the first device               | long     | 03:25.0–03:41.0 | Connect mains power and switch the first light on.                                                                |
| Add the second moving head           | long     | 04:12.0–04:33.0 | Remove the one-light terminator and bring in the second moving head.                                              |
| Connect the second moving head       | long     | 05:09.0–05:34.0 | Continue the DMX chain and power the second fixture.                                                              |
| Add the LED bar                      | long     | 05:50.0–06:08.0 | The long LED bar arrives at the front of the table; cable work continues afterward.                               |
| Connect the LED bar                  | long     | 07:18.0–07:42.0 | Rear-panel cabling is visible here. The bar lights up later during troubleshooting.                               |
| Add the LED panel                    | long     | 08:12.0–08:27.0 | The rectangular panel joins the rig; this is the placement shot.                                                  |
| Connect the LED panel                | long     | 08:48.0–09:04.0 | Hands connect the rear panel; there is more cable rework later.                                                   |
| Add the laser fixture                | long     | 09:35.0–10:06.0 | The fixture with the yellow label joins the other lights.                                                         |
| Add a DMX terminator — clear example | long     | 03:44.8–04:01.0 | ONE-LIGHT DEMO · recorded earlier, before the chain expands. See IMG_0774 for the later installed-state close-up. |
| Terminator installed on LED bar      | IMG_0774 | 00:00.0–00:06.3 | Installed state in DMX OUT; not the insertion itself.                                                             |
| The assembled rig                    | long     | 19:32.0–19:45.0 | Final wide view. IMG_0774 separately shows the installed terminator.                                              |

## Editing notes

- The short take has the cleanest laptop, USB-C, ENTTEC, and 3/5-pin close-ups.
- The long take contains the complete multi-fixture setup: two moving heads,
  LED bar, LED panel, and laser.
- Omit the rejected connector attempt at 2:33–2:49 in the long take; the clean
  repeat begins at 2:51.6. Earlier at 1:53.5, the narration flags a wrong-order take.
- At 6:56–7:15, the narration explicitly suggests speeding up the daisy chaining.
  The review keeps natural speed so connection actions can be inspected.
- **The clear terminator example (long 3:44.8–4:01) happens on the one-light chain.**
  It is removed when a second light is added. The final terminator insertion into
  the fully assembled chain was not confidently identified. The newly reviewed
  **IMG_0774 (0:00–0:06.3) shows the terminator installed in the LED bar’s DMX OUT**.
  The edit now includes this installed-state close-up after the earlier insertion demonstration.

## Transcript

`transcripts/` contains curated source-relative Remotion Caption JSON for both
recordings and transcription notes. These are approximate working captions,
not verified verbatim subtitles. Sparse audio produced hallucinations over
handling noise; those were excluded. Technical names were normalized. The raw
machine output is retained locally in `~/Movies/Disco-Setup-Review/transcripts/`.

## Local media

The review uses 720p H.264 copies for responsive seeking. The original graded
4K files remain in `~/Movies/ProRes-Rec709-2026-10-31/` without modification.
Local preview assets are hard-linked without duplication into ignored `public/setup-review/`:

```sh
bun src/disco-light-show/setup-review/link-local-media.mjs
bunx remotion studio --no-open
```

Run these commands from `packages/jonnys-videos`. Optionally pass a different
folder to the linking script. The default is `~/Movies/Disco-Setup-Review/`.
Preview media is local-only; no uploads or final video render were created.
`Setup-Closeups` is a separate reel of selected hardware details, addressing,
and laptop/control-response cutaways from the other recordings.

Validation: package TypeScript, targeted ESLint/formatting, composition discovery,
and timeline continuity checks passed. Review timings preserve source time;
all playback timelines are contiguous. See [CLOSEUPS.md](CLOSEUPS.md) for the
additional close-up reel and per-source suggestions.
