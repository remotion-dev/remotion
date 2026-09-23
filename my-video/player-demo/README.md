# player-demo

A small standalone web page that embeds the `ShowcaseReel` composition with `@remotion/player`. It shows the two Player-package components that can't appear in a rendered video:

- **`<Player>`**, with `controls`, `loop`, `initialFrame={45}` (it opens on the title instead of the blank first frame) and `showPlaybackRateControl`. A readout under it uses the `PlayerRef` API. It subscribes with `addEventListener()` to `frameupdate`, `seeked`, `play`, `pause` and `ratechange`, and calls `getCurrentFrame()`.
- **`<Thumbnail>`**, a row of four tiles showing frames 45, 100, 160 and 220 (the Title, Shapes, Captions and Route scenes). Clicking a tile calls `playerRef.current.seekTo(frame)`.

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
- **Console:** the only message is the Player's license notice, a `console.warn` ("Some companies are required to obtain a license…"). Passing the `acknowledgeRemotionLicense` prop to `<Player>` silences it. That's for the project owner to decide, so the demo doesn't pass it.
- **`react-dom-client.d.ts`:** the root `tsconfig.json` also type-checks this folder, and the project has no `@types/react-dom` dependency. This file types the single `createRoot()` call so `npm run lint` passes in a standalone checkout. If `@types/react-dom` is added, delete this file.
