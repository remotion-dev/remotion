# Native capture comparison

This is a standalone replay harness for PR #11861. It verifies every encoded frame before accepting an export time. It does not change installed packages or the checkout under measurement.

`results.json` records measurements from an Apple M2 Max, Electron 44.3.0 / Chromium 152.0.7977.78, ANGLE Metal, React 19.2.3, and public Mediabunny 1.56.1. Measured source: `f096ab1826cff02082e39c6f207964d0c84da419`; original serial renderer: `c320056a980972de109ef27a40bede9660a46931`.

Every full-length export is 1920×1080, 30 fps, 1,800 frames, H.264 MP4, very-high bitrate, muted audio, default hardware acceleration preference, and medium page responsiveness. The two videos have different URLs and separate inputs: one fills the output, the other occupies 960×540 at (960, 0). The generated files have identical bytes and independent source markers. GOP length is 60 with two B frames.

## Results

Four-path comparison, one discarded full-length warmup per variant and four measured rounds. Cyclic order places each variant in every position once; each export uses a fresh hidden renderer window.

| Path | Mean export time |
| --- | ---: |
| Original serial capture | 21.336 s |
| Persistent main-thread layout canvas, serial submission | 21.185 s |
| Persistent main-thread layout canvas, overlapped submission | 21.037 s |
| Worker capture and overlapped submission | 13.372 s |

The worker is 36.4% faster than the persistent main-thread canvas with submission overlap in this cohort. Removing the extra copy or changing submission scheduling alone does not explain the measured benefit on this host.

A separate comparison isolates thread placement more closely: both variants use `transferControlToOffscreen()`, `captureElementImage()`, the same reset/draw/VideoFrame sequence, and the PR's submission overlap. Dimensions are changed only when needed in both variants. One discarded warmup per variant and four alternating measured pairs:

| Placement | Mean export time |
| --- | ---: |
| Main thread | 22.988 s |
| Worker | 14.895 s |

All 30 full-length exports across the two cohorts, including warmups, pass frame count, timestamps, composition marker, and both source-video markers: **54,000 verified output frames**. Worker runs use the worker for every frame, have at most two pending capture requests, and terminate the capture worker. Source hashes and every individual timing are in `results.json`.

The renderer's `phases` are included for inspection. Worker capture and submission phases overlap, so their sums are not CPU time and must not be added together. These measurements isolate scheduling and placement at the API boundary; they are not GPU traces.

The original launch flags are preserved: ANGLE Metal and the two CanvasDrawElement feature switches. Background throttling is disabled on each hidden window. Frame-rate limiting and GPU vsync are **not** disabled. This differs from the maintainer's headless Chrome comparison on an M4, so these results do not contradict that host's small incremental worker gain or establish a universal speedup.

An initial thread-placement setup reset the main-thread canvas dimensions on every frame. That setup was stopped and excluded; the comparison above preserves the worker's conditional-resize behavior.

## Replay

Requires Git, Bun, Node.js, Python, FFmpeg with libx264, and macOS with Metal for this exact Electron configuration. Create an isolated dependency directory rather than changing the Remotion workspace's dependencies:

```sh
# Run from the current Remotion checkout.
git worktree add --detach /tmp/remotion-capture-source f096ab1826cff02082e39c6f207964d0c84da419
mkdir -p /tmp/remotion-capture-replay
cp packages/web-renderer/benchmarks/html-in-canvas-capture/{browser.tsx,build.ts,run.cjs,generate-fixtures.py} /tmp/remotion-capture-replay/
cd /tmp/remotion-capture-replay
bun init -y
bun add react@19.2.3 react-dom@19.2.3 mediabunny@1.56.1 @mediabunny/aac-encoder@1.56.1 @mediabunny/mp3-encoder@1.56.1 @mediabunny/flac-encoder@1.56.1 electron@44.3.0
python3 generate-fixtures.py
REPO_ROOT=/tmp/remotion-capture-source NODE_ENV=production bun build.ts
ROUNDS=4 FRAMES=1800 node run.cjs
```

Times exclude building, window creation, frame verification, and disk saving. They include source loading, worker startup, render setup, capture, encoding, and finalization. Fixture bytes can differ between FFmpeg builds; compare the fixture hashes before comparing a run to the recorded measurements.

To run the thread-placement comparison, use the same harness and assets:

```sh
REPO_ROOT=/tmp/remotion-capture-source MODES=main-snapshot,worker NODE_ENV=production bun build.ts
MODES=main-snapshot,worker ROUNDS=4 FRAMES=1800 node run.cjs
```

`comparison.json` is updated after every verified export. It is marked `complete` only after the entire run finishes. Warmups have `round: -1` and must be excluded from statistics.
