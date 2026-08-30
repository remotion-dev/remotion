# Audit: `playing` vs `imperativePlaying`

## Invariant

`imperativePlaying` means “play has been requested and not paused, **right now**” — including inside the same click and the next rAF, before `setPlaying` commits. `<Freeze>` replaces it with `{ current: false }` so descendant `tag.play()` refuses while the parent timeline is still playing.

`playing` is the React snapshot ([state as a snapshot](https://react.dev/learn/state-as-a-snapshot)). `setPlaying` applies after the event handler ([batching](https://react.dev/learn/queueing-a-series-of-state-updates)).

## Why a context ref, not a hook-local ref

`usePlayerMethods()` is called in many components (`usePlayback`, `PlayPause`, seek bar, keyboard, timeline drag, …). They all read/write **one** `imperativePlaying` on timeline / imperative context. A per-hook `useRef` would not be shared; `PlayPause.play()` would flip instance A and `usePlayback`’s `isPlaying()` would still see instance B as false.

## Writes (always paired today)

`use-player-methods` `play` / `pause` / `pauseAndReturnToPlayStart`: `imperativePlaying.current = …` then `setPlaying(…)`.

Created in `TimelineContext` (Studio) and `Player.tsx` / `Thumbnail.tsx` (embed).

## Reads

| Site                        | What it uses                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `use-player-methods`        | play bail, pause, toggle, `isPlaying()`, step frame                                                       |
| `use-playback` rAF          | `isPlaying()` (the shared ref) to stop the clock before the next commit; effect start/stop uses `playing` |
| `use-media-tag`             | `imperativePlaying.current` before `.play()`                                                              |
| `<Freeze>`                  | shadows both `playing: false` and `{ current: false }`                                                    |
| `usePlayingState()`         | `[playing, setPlaying, imperativePlaying]` — third slot                                                   |
| WebMcp `get_playback_state` | `imperativePlaying.current` at tool-call time                                                             |

## React docs

Refs are an escape hatch for values that must be readable outside the render snapshot (rAF, other hook instances, same-click). That matches this ref. Exporting it on context and `usePlayingState()` makes it a second public SoT, not just a mirror.

`flushSync` would commit `playing` in the click. It does not update the `playing` binding inside the already-running `play()` callback, and it does not replace a shared ref across hook instances.
