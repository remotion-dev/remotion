---
name: studio-diagnostics
description: Diagnose Remotion Studio playback stalls using buffering traces, resource counters, and WebMCP. Use when asked which layer caused buffering, to reveal a buffering handle, or to investigate audio iterator or Mediabunny sink activity.
---

# Studio playback diagnostics

Use the running Studio for the current worktree. To launch one, follow
[studio](../studio/SKILL.md). Confirm the composition and reproduction range before
recording. Do not modify the composition just to obtain a trace.

## Capture through WebMCP

1. Call `set_buffering_tracing` with `{"enabled": true}` before reproducing.
   Alternatively, enable **Settings → Studio → Debug → Show diagnostics**,
   `Config.setShowDiagnostics(true)`, or `--show-diagnostics`. The floating panel
   enables tracing while mounted. Drag its header to move it; arrow keys also work
   when the header has keyboard focus.
2. Pause playback and call `clear_buffering_events` with `{}`. This removes
   completed history, preserving any active episode. Read `get_diagnostics` for a
   counter baseline. Optionally call `reset_buffering_handles_created` with `{}`
   to reset that creation count without changing active handles or other counters.
3. Use `select_composition`, `seek_to_frame`, `play`, and `pause` to reproduce the
   reported range. Start early enough to include premounting and loading.
4. Call `get_buffering_events` with `{"limit": 20}` and `get_diagnostics` with `{}`.
   Inspect the recorded frames, durations, handle stacks, media sources, and owner
   locations. `owners` runs from the nearest layer through its ancestors.
5. Call `reveal_buffering_handle` with the returned `eventId` and `handleId`.
   This pauses, switches to the recorded composition, seeks to the event's start
   frame, and selects the owner in the timeline and Inspector. Check `get_selection`
   and `get_playback_state` to confirm. The panel's **Reveal** button does the same.
6. When finished, call `set_buffering_tracing` with `{"enabled": false}`. Tracing
   remains enabled if the panel is still open. Report the composition, frame,
   source location, media URL, duration, and evidence for the cause.

See the [WebMCP tool schemas](../../../packages/docs/docs/ai/webmcp.mdx) for exact
inputs, outputs, and availability. These tools work in regular, detached, deployed,
and Browser Studio. Reveal requires a selectable composition timeline; it reports
an error if a record, composition, or matching layer no longer exists.

## Interpret the evidence

- `audioIteratorsCreated` is cumulative; it is not the number of live iterators.
- `mediabunnySinksOpen` is the current number of registered sinks whose inputs have
  not been disposed. It is not a cumulative count.
- `bufferingHandlesCreated` counts calls that create playback blocks. A block can
  be cleared immediately and never enter buffering. Reset only affects this count.
- `bufferingStatesTriggered` counts transitions into the internal buffering state.
  Overlapping handles form one episode. A handle added and removed within the
  same React batch does not trigger an episode. Short episodes may not display
  the loading indicator, whose default delay is 300 ms.
- `activeAtStart: true` identifies handles present when the episode began. Other
  handles joined an already-buffering episode; they may prolong it or be a result
  of resynchronization. A recorded handle is evidence of a playback block, not by
  itself proof of the root cause.
- Event `frame` is the composition frame at buffering entry. Handle `frame` and
  `releasedFrame` describe creation and release. Times use `performance.now()`
  milliseconds. `endedAt: null` means ongoing; `endReason: 'unmounted'` means the
  buffering provider disappeared, not that media finished loading.

Capture starts when enabled, not retroactively. Handles created earlier are
included in `omittedHandles` if still blocking at event start. Detailed history
keeps at most 100 events and 50 handles per event; the panel shows the latest 20.
Check `droppedEvents` and `omittedHandles` before treating a trace as complete.
History and counters reset on page reload. Clearing history preserves active
records and does not reset counters. IDs are not reused when history is cleared.

Use `afterId` only to request newer episodes. To inspect updates or releases in an
existing episode, omit it. Source stacks remain available after layers unmount;
Reveal matches a current layer by identity or captured source information and may
fall back to an ancestor. Check the returned selection rather than assuming the
original layer survived edits or HMR.

## Find the cause and verify a fix

Read the first blocking handles' source and owning JSX, then trace media waits to
the underlying fetch, decoding, seeking, or synchronization path. Follow
[fix-root-cause](../fix-root-cause/SKILL.md). Distinguish an initial decoder wait
from audio handles subsequently created to resynchronize playback.

Inspect the relevant Sequence's `premountFor`, its actual mount frame, and source
media properties. Premounting mounts early; it does not guarantee all upcoming
frames are decoded. The preview queue in
[canvas-ahead-of-time.ts](../../../packages/media/src/canvas-ahead-of-time.ts)
holds three ahead-of-time slots; current/peeked frames and browser decoder buffers
are separate. Do not interpret this as decoding a full second during premount.

For suspected media bottlenecks, verify resolution, codec, file size, bitrate,
and decode timing. Confirm an alternative file contains the same capture before
proposing a replacement. Do not suppress buffering or silently substitute a
different video to hide a stall.

Reproduce the same range after a change and compare event count/durations,
resource counters, and visible output. For React render regressions use
[react-scan](../react-scan/SKILL.md). Keep traces bounded and local; summarize
relevant handles instead of returning every raw stack. Detailed stack capture is
opt-in; leave it off outside diagnostics work.

Implementation references:
[trace store](../../../packages/core/src/playback-diagnostics.ts),
[buffer transitions](../../../packages/core/src/buffering.tsx),
[handle creation](../../../packages/core/src/use-buffer-state.ts), and
[reveal and serialization](../../../packages/studio/src/components/buffering-diagnostics.ts).
