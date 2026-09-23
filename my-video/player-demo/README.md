# player-demo

A small standalone web page that embeds the `ShowcaseReel` composition with `@remotion/player`. It shows the two Player-package components that can't appear in a rendered video:

- **`<Player>`**, with `controls`, `initialFrame={45}` (it opens on the title instead of the blank first frame), `showPlaybackRateControl` and a poster (`renderPoster`). Checkboxes under it switch `loop`, `showPosterWhenUnplayed`, `showPosterWhenPaused` and `showPosterWhenEnded`, and radio buttons pick `posterFillMode`.
- **The `PlayerRef` API.** A row of buttons calls every method that changes something: `play()`, `pause()`, `toggle()`, `pauseAndReturnToPlayStart()`, `seekTo()`, `mute()`, `unmute()`, `setVolume()`, and `requestFullscreen()` followed by `exitFullscreen()` 3 seconds later. The readout subscribes with `addEventListener()` to all 14 events and logs them, and after each one it prints what the getters return: `getCurrentFrame()`, `isPlaying()`, `isMuted()`, `getVolume()`, `getScale()`, `isFullscreen()` and `getContainerNode()`'s size. An event of the same type as the newest log entry replaces it, so `timeupdate` doesn't push everything else out while playing.
- **`<Thumbnail>`**, a row of four tiles showing frames 45, 100, 160 and 220 (the Title, Shapes, Captions and Route scenes). Clicking a tile sets the Player's `inFrame`/`outFrame` to that scene's frames (60n to 60n + 74) and calls `playerRef.current.seekTo(frame)`. A button clears the range.

## Build and open

Run these from `my-video/`, after `npm i`:

```console
node player-demo/build.mjs           # bundle into player-demo/dist/
node player-demo/build.mjs --serve   # bundle, then serve dist/ at http://localhost:4000/
```

`build.mjs` uses the `esbuild` already in `node_modules`, which comes in as a dependency of `@remotion/bundler`, so it adds no new packages. It writes `dist/index.html`, `dist/main.js` and a source map, and copies `sample-clip.webm` from `public/`. `dist/` is gitignored.

The bundle is a classic script, not an ES module, so you can also open `player-demo/dist/index.html` straight from disk. Another static server works only if it answers HTTP Range requests: `CaptionsScene` plays a video, and a `<video>` can't seek without them. `python3 -m http.server` and esbuild's own server don't; `--serve` uses a small Node server that does.

## Why this isn't a composition

`<Player>` and `<Thumbnail>` are meant to be embedded in an ordinary React app. They can't be nested inside a composition. `<Thumbnail>` sets the global `window.remotion_isPlayer = true` in a layout effect and never resets it, and the render that contains it depends on that flag being `false` (see "WebCodecs, media decoding and the Node-side APIs" in `../AGENTS.md`). So the demo is a separate page. It imports the reel's component straight from `../src/showcase/ShowcaseReel`.

Both components take a component directly, not a `<Composition>`, and they never run `calculateMetadata()`. `main.tsx` therefore repeats the reel's settings from `src/Root.tsx`: 1280×720, 30 fps and 315 frames, the value `calculateShowcaseReelMetadata()` computes. Update it if the reel's timing changes.

## Notes

- **Why `ShowcaseReel`:** all of its scenes are plain React, SVG and `@remotion/*` code with no CSS imports or fonts, so a stock esbuild bundles them. Its one `staticFile()` asset, `CaptionsScene`'s `sample-clip.webm`, is copied into `dist/`, and `index.html` sets `window.remotion_staticBase = "."` so that `staticFile()` returns a relative URL. `ExtendedReel` and `FullReel` weren't tried. They rely on setup that Remotion's own bundler and server provide: the skia alias and `LoadSkia()`, and files in `public/` served for `staticFile()`.
- **Player behavior found while wiring the props,** checked in headless Chromium against the installed 4.0.527:
  - With `posterFillMode="player-size"`, `renderPoster()` gets the `style` prop's `width` and `height`, not measured pixels. This page sets `width: "100%"` and no height, so the poster receives `"100%"` and `undefined`, although `RenderPoster` types both as numbers. With `"composition-size"` it gets 1280 and 720.
  - `showPosterWhenEnded` checks for the reel's last frame (314), not `outFrame`. So it needs `loop` off and `moveToBeginningWhenEnded={false}` (which `main.tsx` passes), and it never shows when a scene's range ends.
  - With `loop` off, playback stops at `outFrame` and fires `ended`. `play()` only rewinds from frame 314, so from `outFrame` it ends again after one frame.
  - `seekTo(314)` with `loop` off fires `ended` before it moves the playhead, so a listener that reads `getCurrentFrame()` there gets the old frame.
  - `getVolume()` returns 0 while muted. The reel has no audio (`CaptionsScene`'s video is muted), so the volume buttons change only the Player's state and its volume control.
  - `error` fires only when the component throws during rendering, which `ShowcaseReel` doesn't. `waiting` and `resume` fire when the Player buffers, which `CaptionsScene`'s video can cause on a slow connection; served locally it didn't.
- **Console:** the only message is the Player's license notice, a `console.warn` ("Some companies are required to obtain a license…"). Passing the `acknowledgeRemotionLicense` prop to `<Player>` silences it. That's for the project owner to decide, so the demo doesn't pass it.
- **`react-dom-client.d.ts`:** the root `tsconfig.json` also type-checks this folder, and the project has no `@types/react-dom` dependency. This file types the single `createRoot()` call so `npm run lint` passes in a standalone checkout. If `@types/react-dom` is added, delete this file.
