# Remotion Core Logging Mechanics Audit

Scope: `packages/core`, including browser/runtime code in `src/` and the two
package-maintenance scripts at the package root. This is a mechanics audit: it
describes how messages are selected, shaped, emitted, and suppressed. It does
not evaluate the logging architecture or propose a redesign.

## Executive summary

Core has two independent logging paths:

1. `Log` in `src/log.ts` is the low-level, level-aware path. Callers supply the
   current level with each call. It filters synchronously, maps the accepted
   call to a browser console method, and adds renderer-only `Symbol` metadata.
2. Direct `console.*` calls are used for user-facing warnings, media errors,
   retry notices, migration output, and a few debugging/error reports. These do
   not consult the configured log level, do not receive renderer metadata, and
   use local conditions for suppression where applicable.

`playbackLogging()` is not a separate transport. It formats an elapsed-time and
topic prefix, then delegates to `Log.trace()`.

## 1. Level-aware logger

### Level ordering and filtering

`src/log.ts` defines this ordered list:

```text
trace < verbose < info < warn < error
```

`isEqualOrBelowLogLevel(currentLevel, messageLevel)` compares the two array
indexes. A message is emitted when the configured/current level is less than or
equal to the message's level. Therefore:

| Configured level | Emitted `Log` methods                       |
| ---------------- | ------------------------------------------- |
| `trace`          | `trace`, `verbose`, `info`, `warn`, `error` |
| `verbose`        | `verbose`, `info`, `warn`, `error`          |
| `info`           | `info`, `warn`, `error`                     |
| `warn`           | `warn`, `error`                             |
| `error`          | `error`                                     |

`Log.error()` is unconditional rather than calling the comparison helper. This
is mechanically equivalent for the currently valid `LogLevel` values.

There is no runtime validation inside `Log`: callers are expected to supply a
valid `LogLevel` TypeScript value.

### Console method mapping

| `Log` method | Console method  |
| ------------ | --------------- |
| `trace`      | `console.debug` |
| `verbose`    | `console.debug` |
| `info`       | `console.log`   |
| `warn`       | `console.warn`  |
| `error`      | `console.error` |

Arguments otherwise retain their original types and order. The logger does not
stringify errors or objects, add timestamps, capture stacks, batch messages, or
catch console failures.

### Renderer metadata

Before emission, `transformArgs()` can prepend global-registry symbols to the
argument array. This happens only when both are true:

- `getRemotionEnvironment().isRendering` is true.
- `getRemotionEnvironment().isClientSideRendering` is false.

The prepended values are:

```text
Symbol.for("__remotion_level_<message level>")
Symbol.for("__remotion_tag_<tag>")
```

The tag symbol is prepended after the level symbol, so a tagged renderer call
reaches the console in this order:

```text
[tag symbol, level symbol, ...caller arguments]
```

No tag symbol is added when `tag` is `null`. The level symbol is always based on
the method being called, not the configured threshold. Browser Player and
Studio calls receive neither symbol.

Within core's default environment detector, rendering means browser code with
`window.process.env.NODE_ENV === "test"`, or production browser code with
`window.remotion_puppeteerTimeout` defined. Core's detector always reports
`isClientSideRendering: false`; a scoped environment supplied elsewhere can
change that second condition.

### Availability

- The public package exports the `LogLevel` type, but not `Log`.
- `Internals` exposes the existing `Log`, `LogLevelContext`, `useLogLevel`, and
  `playbackLogging` compatibility surfaces for other Remotion packages.
- `prefetch()` accepts an optional public `logLevel`; it defaults to `info`.
- `continueRender()` reads `window.remotion_logLevel`, defaulting to `info`.

## 2. Log-level propagation

`RemotionRootContexts` receives a required `logLevel` and provides this value:

```ts
{logLevel, mountTime: Date.now()}
```

through `LogLevelContext`. The context default outside a provider is
`{logLevel: 'info', mountTime: 0}`. Consequently, `useLogLevel()` does not throw
when there is no provider; it returns `info`. Its explicit `null` error is only
reachable if a provider supplies `null`.

`useMountTime()` similarly returns `0` outside a provider. Its null check is
effectively unreachable with the declared context shape because `mountTime` is
typed as `number`, not `number | null`.

The context value is memoized on `[logLevel]`. Changing the level creates a new
`mountTime`, so playback elapsed-time prefixes restart when the configured log
level changes. Hooks pass the context values into lower-level media helpers and
include them in callbacks and effect dependency lists. Context-preserving
wrappers in `wrap-remotion-context.tsx` copy the complete logging context.

Render setup writes the externally selected level to
`window.remotion_logLevel`; Studio development HTML also initializes that
global. Most React runtime paths do not read the global directly: their level
arrives through `RemotionRootContexts` and `useLogLevel()`.

## 3. Playback logging

`playbackLogging({logLevel, tag, message, mountTime})` builds a visible prefix
and calls:

```ts
Log.trace({logLevel, tag: null}, `[${tags}]`, message);
```

The visible `tags` string contains:

- `<elapsed>ms ` when `mountTime` is truthy, calculated with
  `Date.now() - mountTime` at the time of the call.
- The supplied topic tag.

Because the function passes `tag: null` to `Log.trace`, the topic is only human
readable text. It does not become a renderer `__remotion_tag_*` symbol. Calls
with `mountTime: null` (currently prefetch logging) produce `[prefetch]` without
elapsed time. A `mountTime` of `0` is also treated as absent.

All playback messages are trace-level and therefore silent at the default
`info` level. They use `console.debug` when enabled.

Playback topics and triggers are:

| Topic      | Triggered mechanics                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `video`    | A preview video initializes; includes source, core version, and user agent.                      |
| `play`     | Before calling a media element's `.play()`.                                                      |
| `pause`    | Before pausing because playback stopped, pre/postmounting is active, or the Player is buffering. |
| `seek`     | Before assigning `currentTime`; includes old/new time, source, and reason.                       |
| `buffer`   | Media is marked/unmarked as buffering and its playback block is released.                        |
| `load`     | `.load()` is called to make a media element acquire future data.                                 |
| `buffer`   | Media buffering transitions, playback-block release, and first-frame buffering decisions.        |
| `player`   | The aggregate Player enters or exits its buffer state.                                           |
| `prefetch` | A prefetch finishes or is freed.                                                                 |

The exact topic names come from the call sites. Several different buffering
paths intentionally share the `buffer` topic; aggregate Player buffering uses
the separate `player` topic.

## 4. Other level-aware call sites

| Level     | Tag                | Mechanics                                                                                                                                                                |
| --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `trace`   | `[buffer-state]`   | Logs buffer-handle add (with a newly captured stack) and first removal. Duplicate `unblock()` calls return before logging.                                               |
| `trace`   | `audio`            | Logs creation of a shared `AudioContext`.                                                                                                                                |
| `trace`   | none               | Logs Web Audio amplification start and gain changes.                                                                                                                     |
| `verbose` | none               | Logs one-time-per-source detection of variable-frame-rate media.                                                                                                         |
| `verbose` | `delayRender()`    | During rendering only, logs a cleared delay handle with label, token, and elapsed duration.                                                                              |
| `verbose` | `prefetch`         | Logs the start of a non-rendering prefetch.                                                                                                                              |
| `verbose` | `audio`            | Logs when `AudioContext.getOutputTimestamp()` proves that resume advanced.                                                                                               |
| `verbose` | `audio-scheduling` | Logs scheduled/media time ranges, timing lead or delay, latency, state, original timestamp, and start/schedule action. Uses browser `%c` formatting to color mismatches. |
| `info`    | `<video>`          | After an autoplay failure in Player, explains that video will be muted/retried and points to `onAutoPlayError()`.                                                        |
| `warn`    | none               | Warns once per loaded module when `AudioContext` is unsupported (browser only).                                                                                          |
| `warn`    | none               | Emits three Safari volume/playback-rate warnings once per loaded module.                                                                                                 |
| `warn`    | `audio`            | Reports a rejected `AudioContext.resume()` with the error, then the surrounding code resolves its synchronization wait and swallows the resumed promise rejection.       |

There are no `logger.error()` consumers in current core runtime code;
error-level output currently uses direct `console.error()`.

## 5. Direct console logging

These calls bypass `Log`. They are emitted regardless of configured log level
and never receive renderer level/tag symbols.

### Media loading and playback

| File/path                              | Console call      | Exact emission condition                                                                                                                                     |
| -------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `IFrame.tsx`                           | `error`           | An iframe emits `error` and no `onError` prop was supplied. Supplying `onError` suppresses the console message.                                              |
| `Img.tsx`                              | `warn`            | An image load fails while its error count is within `maxRetries`; includes exponential backoff.                                                              |
| `Img.tsx`                              | `info`            | An image later completes after one or more recorded failures.                                                                                                |
| `Img.tsx`                              | `warn`            | `HTMLImageElement.decode()` rejects before fallback to the `load` event. This can be followed by normal completion.                                          |
| `canvas-image/CanvasImage.tsx`         | `warn`            | Image decoding/loading fails while retry count is within `maxRetries`; includes exponential backoff.                                                         |
| `audio/html5-audio.tsx`                | `log`             | Every native audio error, before deciding whether it is fatal. Prints `MediaError` directly.                                                                 |
| `audio/html5-audio.tsx`                | `warn`            | A non-looping audio tag errors. It is emitted even when `onError` is also called.                                                                            |
| `video/VideoForPreview.tsx`            | `error`           | A preview video error event has a non-null `current.error`; occurs before custom `onError` handling.                                                         |
| `video/VideoForRendering.tsx`          | `error`           | A rendering video error event occurs; prints the current media error.                                                                                        |
| `play-and-handle-not-allowed-error.ts` | `log`             | `.play()` rejects after known pause/abort/source-replacement/unmount cases are filtered out. This happens before custom autoplay handling or mute-and-retry. |
| `warn-about-non-seekable-media.ts`     | `warn` or `error` | A media element has exactly one seekable range of `0..0`. Mode selects warning, error, or thrown exception. Console modes are deduplicated by source.        |

The image retry delay is `1000 * 2 ** (errorCount - 1)` milliseconds. Retry
messages are not deduplicated because each retry attempt is intentionally
reported.

### API usage and compatibility warnings

| File/path                  | Console call       | Suppression and behavior                                                                                                                                                           |
| -------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config/input-props.ts`    | three `warn` calls | Server-side `getInputProps()` call; once per loaded module. Returns `{}`.                                                                                                          |
| `get-static-files.ts`      | `warn`             | Server use and Player use have independent once-per-module flags. Returns `[]`.                                                                                                    |
| `watch-static-file.ts`     | `warn`             | Every call made outside Studio. Returns a no-op cancel handle.                                                                                                                     |
| `static-file.ts`           | `warn`             | Unsafe encoded-character guidance; deduplicated by the complete message string for the module lifetime.                                                                            |
| `use-media-in-timeline.ts` | `warn`             | Media/timeline warning; deduplicated by complete message string for the module lifetime.                                                                                           |
| `prefetch.ts`              | `warn`             | A fetched response lacks a usable media/image content type and no valid override was supplied. The prefetch continues.                                                             |
| `index.ts` `Config` proxy  | nine `warn` calls  | Calling an extracted legacy CLI config method prints a migration block, then calls `process.exit(1)`. Property reads for known config namespaces return the proxy without logging. |

`warnAboutNonSeekableMedia()` only records its source as warned after it emits
or throws. Module-level once maps and booleans persist for the lifetime of that
loaded module instance; they are not persisted across reloads or shared across
separately bundled copies of core.

## 6. Package-maintenance script output

These files run during core packaging/maintenance rather than normal library
runtime:

| File                        | Mechanics                                                                                                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bundle.ts`                 | Throws when invoked without production `NODE_ENV`. Uses `console.error()` and exits when the active Bun version does not satisfy `^1.1.7`; uses `console.log('Done.')` after the bundle checks complete. Other failures throw. |
| `ensure-correct-version.ts` | Logs missing version replacements in each dist file and logs the updated version after processing. It throws if stale-version dist files still exist.                                                                          |

They do not import or use `Log`, and package log-level settings cannot affect
them.

## 7. Mechanical findings

1. **Configured levels govern only `Log` calls.** All direct console emissions
   listed above remain visible at `logLevel="error"` or any other setting.
2. **Renderer metadata exists only on the `Log` path.** Direct console messages
   have no `__remotion_level_*` or `__remotion_tag_*` symbols for a renderer-side
   consumer to classify.
3. **Playback topic tags are visible strings, not metadata tags.** The renderer
   receives a trace-level symbol for them but no topic/tag symbol because
   `playbackLogging()` delegates with `tag: null`.
4. **Changing log level resets elapsed playback timing, but not logging-related
   effects.** `mountTime` is created in the same memo as `logLevel`, while the
   stable logger reads the replacement context without changing identity.
5. **Several handled errors are logged before handling.** Preview video errors,
   non-looping audio errors, and autoplay rejections can still print even when a
   user callback handles the condition. Iframe errors are the exception: its
   direct console error occurs only without an `onError` callback.
6. **Warning deduplication is local and process/module scoped.** There is no
   shared registry. The keys differ by implementation: booleans, full message
   strings, or media source URLs.
7. **`useLogLevel()`'s missing-provider error is not the fallback behavior.**
   With the actual context default, a missing provider silently uses `info`.

## 8. End-to-end examples

### Trace playback in Player or Studio

```text
caller -> logger.playback()
       -> playbackLogging()
       -> computes "[123ms seek]"
       -> Log.trace({logLevel: "trace", tag: null}, prefix, message)
       -> passes threshold
       -> console.debug(prefix, message)
```

### Tagged warning during server rendering

```text
caller -> Log.warn({logLevel: "info", tag: "audio"}, message, error)
       -> passes threshold
       -> transformArgs() prepends level symbol, then tag symbol
       -> console.warn(tagSymbol, levelSymbol, message, error)
```

### Direct image retry warning

```text
image error -> increment per-source attempt count
            -> compute exponential backoff
            -> console.warn(message)
            -> schedule retry
```

No configured threshold, renderer metadata, or central logger participates in
the third flow.
