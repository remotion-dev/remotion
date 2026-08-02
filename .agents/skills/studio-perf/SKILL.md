---
name: studio-perf
description: Diagnose and optimize React render performance in Remotion Studio. Use when Studio components render on every playhead frame, when auditing `useTimelinePosition()` subscriptions, when `React.memo` does not prevent renders, or when moving frame reads to imperative Studio state safely.
---

# Studio Performance

Minimize the React subtree subscribed to the playhead. Preserve reactive frame
subscriptions only where rendered output or effects must change as time changes.

## Diagnose the render source

1. Use the React Profiler to identify the exact component instance and owner path.
   Shared visual components may also be rendered in inspectors.
2. Check changing props, consumed contexts, and hooks. `React.memo` cannot block
   context updates and uses shallow prop comparison by default.
3. Search Studio subscriptions with:

```bash
rg -n "useTimelinePosition\\(\\)" packages/studio/src
```

4. Trace whether the frame affects rendered output continuously or is only read
   when an interaction or unrelated state change occurs.

## Choose reactive or imperative frame access

Keep `Internals.Timeline.useTimelinePosition()` when the component must react to
every frame. Examples include:

- playhead and outline positions;
- frame-dependent labels, values, selection eligibility, or disabled states;
- frame persistence, FPS measurement, or playback scrolling;
- current-keyframe and previous/next-keyframe controls.

Use `getCurrentFrame()` from `components/Timeline/imperative-state` when the
current frame is only needed at the moment of an action:

- pointer-down or drag initialization;
- keyboard, clipboard, delete, double-click, or drop handlers;
- memoized temporary data that already recalculates when its real source state
  changes, such as drag overrides.

Call `getCurrentFrame()` inside the callback or memo calculation. Do not snapshot
it at component render time.

### Temporary drag-keyframe pattern

Avoid subscribing an expanded timeline tree solely to provide a frame to a
temporary drag keyframe:

```tsx
const timelinePosition = Internals.Timeline.useTimelinePosition();

const items = useMemo(
	() => buildItems({timelinePosition}),
	[otherDependencies, timelinePosition],
);
```

Prefer:

```tsx
const items = useMemo(
	() => buildItems({timelinePosition: getCurrentFrame()}),
	[otherDependencies],
);
```

This is correct only when `otherDependencies` change whenever the temporary data
must be regenerated. Drag-override getter identities satisfy this when override
state changes.

### Event-time pattern

Avoid a subscription plus a ref when only an event handler consumes the value:

```tsx
const timelinePosition = Internals.Timeline.useTimelinePosition();
const timelinePositionRef = useRef(timelinePosition);
timelinePositionRef.current = timelinePosition;
```

Prefer reading at action time:

```tsx
const onAction = useCallback(() => {
	performAction({frame: getCurrentFrame()});
}, [performAction]);
```

## Preserve correctness

- Do not use imperative reads to hide a genuinely reactive UI dependency.
- If the UI must show current eligibility but the expensive subtree does not,
  extract a small reactive component rather than making the value stale.
- Verify composition-relative versus absolute frame semantics and apply sequence
  display offsets exactly as before.
- If memoization still fails, check reference props such as `nodePathInfo` and use
  a stable upstream identity rather than adding comparators everywhere.

## Validate

1. Confirm the component no longer renders during ordinary playback in the React
   Profiler.
2. Test the interaction at multiple frames, including sequence offsets.
3. Run focused tests, the affected package's `make` and `lint`, then repository
   `bun run build` and `bun run stylecheck` before publishing a PR.
