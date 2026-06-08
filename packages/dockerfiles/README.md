Sample Dockerfiles for different operating systems that show how to install Remotion including the browser.

Uses `npx remotion browser ensure` to install the browser, which requires some shared libraries.

## Running the tests

```bash
./run.sh
```

This will:

1. Build the browser-test bundle from `packages/example` (using `src/browser-test-entry.ts`)
2. Build Docker images for each platform (ubuntu24, ubuntu22, debian, nix)
3. Each Docker build runs `remotion compositions` and renders **two** compositions: `browser-test` and `html-in-canvas`
4. Extract the rendered videos to `out/` directory

Output videos (per platform — `<platform>.mp4` and `<platform>-html-in-canvas.mp4`):

- `out/ubuntu24.mp4`, `out/ubuntu24-html-in-canvas.mp4`
- `out/ubuntu22.mp4`, `out/ubuntu22-html-in-canvas.mp4`
- `out/debian.mp4`, `out/debian-html-in-canvas.mp4`
- `out/nix.mp4`, `out/nix-html-in-canvas.mp4`

## browser-test composition

Located in `packages/example/src/BrowserTest/index.tsx`, it tests:

- GPU/WebGL rendering (Three.js)
- Video playback with different codecs (H.264, H.265)
- WebGL availability

## html-in-canvas composition

Located in `packages/example/src/HtmlInCanvas/index.tsx`, it tests the experimental [WICG html-in-canvas](https://github.com/WICG/html-in-canvas) `CanvasRenderingContext2D.drawElementImage()` API. If the API is unavailable in the bundled Chrome (for example without `chrome://flags/#canvas-draw-element` enabled), the composition fails the render with an error.

The bundle is built from `packages/example` and copied into each Docker container during build.

## Issue #8198 selectComposition repro

`issue-8198-node-24-select-composition` is a standalone Docker repro for a
reported `selectComposition()` stall on Ubuntu 22.04 with Node 24.16.0 and
Remotion 4.0.447. It intentionally lets `selectComposition()` download Chrome
Headless Shell during the run, matching the reported failure path.

```bash
cd packages/dockerfiles/issue-8198-node-24-select-composition
./run.sh
```

To compare against Node 24.15.0:

```bash
NODE_VERSION=24.15.0 ./run.sh
```

To test another Remotion version with the same Node version:

```bash
REMOTION_VERSION=4.0.474 ./run.sh
```

Remotion 4.0.447 reproduces the stall on Node 24.16.0 after the Chrome
Headless Shell download completes. Remotion 4.0.474 resolves successfully,
which verifies the vendored `yauzl` / `fd-slicer` lifecycle patch.
