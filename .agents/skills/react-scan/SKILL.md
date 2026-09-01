---
name: react-scan
description: Capture and analyze Remotion Studio React render profiles with the internal React Scan Lite collector. Use when diagnosing unnecessary re-renders, slow commits, frame-reactive component trees, or when comparing render performance before and after a change.
---

# React Scan

Use targeted captures to optimize measured Studio interactions. Do not infer a
performance problem from source alone when the workflow can be reproduced.

## Record a capture

Start from the repository root:

```sh
bun run react-scan:capture -- --label <short-kebab-case-description>
```

Wait for Studio to finish building and settle. Perform one named interaction
three times, then stop the command with Ctrl+C. Keep captures short so startup,
HMR, and unrelated interactions do not dominate the data.

The command writes an ignored directory under `out/react-scan/` containing:

- `metadata.json`: capture context, git state, browser, and tested URL.
- `summary.json`: ranked component costs, render causes, slow commits, and
  profiling-hook status.
- `events.ndjson`: raw React Scan Lite events for deeper inspection.

`out/react-scan/latest.json` points to the newest capture.

React Scan replaces the React DevTools profiling-hook channel while active. Do
not record with the React DevTools Timeline Profiler at the same time.

## Analyze the evidence

Read `metadata.json` and `summary.json` first. Confirm the capture contains
commit events and inspect `profilingHooksStatuses`; do not interpret a missing
profiling channel as an idle application.

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

Report both capture directories, the measured before/after change, and the
focused tests used to protect behavior.
