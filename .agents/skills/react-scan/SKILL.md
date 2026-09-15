---
name: react-scan
description: Capture and analyze Remotion Studio React render profiles through development-only WebMCP tools. Use when diagnosing unnecessary re-renders, slow commits, frame-reactive component trees, or when comparing render performance before and after a change.
---

# React Scan

Use targeted captures to optimize measured Studio interactions. Do not infer a
performance problem from source alone when the workflow can be reproduced.

## Record a capture

Start from the repository root:

```sh
bun run react-scan:capture
```

Wait for Studio to finish building, open the printed Studio URL with the browser,
and let the page settle. The React Scan WebMCP tools are only registered in this
development capture mode.

Call `start_react_scan_recording`, then use browser-use to perform one named
interaction three times. Call `stop_react_scan_recording` immediately
afterwards. Keep the recording short so startup, HMR, and unrelated interactions
do not dominate the data. Call `get_react_scan_recording` to return the raw
events and an agent-oriented summary.

After retrieving the recording, stop Studio with Ctrl+C. Recordings only live in
the WebMCP result; React Scan does not send them to a separate HTTP collector.

React Scan replaces the React DevTools profiling-hook channel while active. Do
not record with the React DevTools Timeline Profiler at the same time.

## Analyze the evidence

Read the `summary` returned by `get_react_scan_recording` first. Confirm the
capture contains commit events and inspect `profilingHooksStatuses`; do not
interpret a missing profiling channel as an idle application.

Prioritize components with high total self duration, repeated expensive
renders, or a clear user-visible slow commit. Inclusive duration contains child
work and can double-count a subtree, so use it to locate an expensive boundary,
then use self duration and the raw tree to identify the actual work.

Use render causes as evidence, not automatic prescriptions:

- High `parentRenderCount` with no relevant prop, state, context, or hook change
  suggests a stable memoization boundary.
- Repeated changed props suggest checking referential stability at the source
  location before adding memoization.
- Hook, state, or context changes require following the owning update; wrapping
  the component in `memo()` will not block them.
- Source locations identify JSX call sites. Search for the component definition
  before editing.

For timeline-position findings, also read `../studio-perf/SKILL.md` before
changing subscriptions or memoization boundaries.

## Verify an optimization

Preserve the baseline capture. After changing code, record the same interaction
the same number of times with the same viewport and compare a new capture.
Require an improvement in the relevant commit/component metrics without a
regression in behavior. Do not optimize every re-render: cheap necessary renders
are often preferable to added memoization complexity.

Report the measured before/after change and the focused tests used to protect
behavior.
