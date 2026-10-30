Sample Dockerfiles for different operating systems that show how to install Remotion including the browser.

Uses the local browser downloader to install the browser, which requires some shared libraries.

Linux rendering requires glibc 2.35 or later. Amazon Linux 2023 on ARM64 is supported with glibc 2.34. Amazon Linux 2023 on x64 is unsupported because its glibc is too old.

## Running the tests

```bash
./run.sh
```

This will:

1. Build the browser-test bundle from `packages/example` (using `src/browser-test-entry.ts`)
2. Build Ubuntu 24.04, Ubuntu 22.04, and Debian images for x64 and the host architecture, plus Amazon Linux 2023 explicitly for ARM64. The unsupported Nix recipe is excluded.
3. Each Docker build runs `remotion compositions` and renders **two** compositions: `browser-test` and `html-in-canvas`
4. Extract the rendered videos to `out/` directory

Output videos (per platform — `<platform>.mp4` and `<platform>-html-in-canvas.mp4`):

- `out/ubuntu24.mp4`, `out/ubuntu24-html-in-canvas.mp4`
- `out/ubuntu22.mp4`, `out/ubuntu22-html-in-canvas.mp4`
- `out/debian.mp4`, `out/debian-html-in-canvas.mp4`
- `out/al2023-arm64.mp4`, `out/al2023-arm64-html-in-canvas.mp4`

The explicit x64 Ubuntu and Debian runs add `-x86` to the platform name. The Amazon Linux recipe is `Dockerfile.al2023-arm64`; build it with `--platform=linux/arm64`. It rejects x64 builds.

## browser-test composition

Located in `packages/example/src/BrowserTest/index.tsx`, it tests:

- GPU/WebGL rendering (Three.js)
- Video playback with different codecs (H.264, H.265)
- WebGL availability

## html-in-canvas composition

Located in `packages/example/src/HtmlInCanvas/index.tsx`, it tests the experimental [WICG html-in-canvas](https://github.com/WICG/html-in-canvas) `CanvasRenderingContext2D.drawElementImage()` API. If the API is unavailable in the bundled Chrome (for example without `chrome://flags/#canvas-draw-element` enabled), the composition fails the render with an error.

The bundle is built from `packages/example` and copied into each Docker container during build.
