# `HtmlInCanvas` render stall repro

The `HtmlInCanvasVideoRepro` composition is a five-second, self-contained
reproduction using `https://remotion.media/video.mp4`.

Run:

```sh
./node_modules/.bin/remotionb render src/HtmlInCanvasVideoReproRoot.tsx HtmlInCanvasVideoRepro /tmp/html-in-canvas-video-repro.mp4 --concurrency=1 --allow-html-in-canvas
```

Expected result on Remotion 4.0.499:

- Rendering advances normally through frame 89.
- Rendering remains stuck at frame 90.
- After 28 seconds it fails with:

```text
A delayRender() "waiting for first paint after canvas resize" was called but not cleared after 28000ms.
```

Frame 90 mounts a small effect-backed shape and image over the video while the
whole subtree is inside `HtmlInCanvas`. The repro intentionally does not attempt
to identify the underlying cause or provide a workaround.
