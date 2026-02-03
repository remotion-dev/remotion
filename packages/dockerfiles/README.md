Sample Dockerfiles for different operating systems that show how to install Remotion including the browser.

Uses `npx remotion browser ensure` to install the browser, which requires some shared libraries.

## Running the tests

```bash
./run.sh
```

This will:
1. Build the browser-test bundle from `packages/example` (using `src/browser-test-entry.ts`)
2. Build Docker images for each platform (ubuntu24, ubuntu22, debian, nix)
3. Each Docker build runs `npx remotion compositions` and `npx remotion render`
4. Extract the rendered videos to `out/` directory

Output videos:
- `out/ubuntu24.mp4`
- `out/ubuntu22.mp4`
- `out/debian.mp4`
- `out/nix.mp4`

## browser-test composition

Located in `packages/example/src/BrowserTest/index.tsx`, it tests:
- GPU/WebGL rendering (Three.js)
- Video playback with different codecs (H.264, H.265)
- WebGL availability

The bundle is built from `packages/example` and copied into each Docker container during build.
