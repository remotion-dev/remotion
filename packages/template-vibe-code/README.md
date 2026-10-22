# Vibe Code – a browser-based motion graphics editor

A Remotion template that turns the browser into a motion graphics editor: write React code, watch it compile instantly, and edit the result on the canvas, in the timeline and in the inspector — no backend, no bundler process.

- **Live compilation** – the project is compiled in a Web Worker with [`@remotion/browser-bundler`](https://www.remotion.dev/docs/browser-bundler) and hot-swapped with Fast Refresh, so component state survives edits.
- **Canvas** – [`@remotion/sdk`](https://www.remotion.dev/docs/sdk) renders the composition with selection outlines. Click a layer on the canvas or in the timeline to select it, drag it to move it (it snaps to the edges and center of the composition, Shift locks the axis, ⌘ disables snapping) or nudge it with the arrow keys. Switch to “Interact” mode to use the composition’s own buttons and inputs.
- **Timeline** – every mounted sequence shows up as a track. Drag a track bar to change its `from`, drag its edges to trim `durationInFrames`, or drag a track label to reorder selected sibling layers together. Split, duplicate, wrap and delete layers. In/out points, zoomable ruler, scrubbing.
- **Keyframes** – props animated with `interpolate()` get a keyframe row under their track. Drag keyframes to retime them, click to select them (Shift and ⌘ extend the selection), double-click to jump to them, press ⌫ to delete them. In the inspector, a diamond next to each animatable prop adds or removes a keyframe at the playhead and the arrows jump to the neighboring keyframes.
- **Easing** – click the line between two keyframes to edit the easing of that segment: pick a preset (ease in/out, hold, springs), tweak the bezier handles or the spring parameters with live preview, or right-click the line for a preset. The same inspector edits the `interpolate()` options of the prop: extrapolation, `output` mode and `posterize`. ⌫ resets a selected easing to linear.
- **Inspector** – edits props of the selected element directly in the source using [`@remotion/codemods`](https://www.remotion.dev/docs/codemods): position, scale, rotation, opacity, colors, typography, text content, timing and more. Animated props show their value at the playhead; editing one writes a keyframe there. Values computed in code are shown as such. Composition metadata (size, fps, duration) and `defaultProps` are editable too.
- **Code editor** – Monaco with multiple files, tabs, compiler diagnostics and “Reveal in code” from any layer.
- **Render** – export MP4/WebM videos and PNG/JPEG stills in the browser with [`@remotion/web-renderer`](https://www.remotion.dev/docs/web-renderer).
- **Studio-like shortcuts** – Space, ←/→, J/K/L, I/O/X, ⌘Z, ⌘D, ⌘⇧D, ⌫ and more. Press `?` for the full list.
- **Save to disk** – in development, ⌘S writes the project back to `src/remotion`, so `npx remotion studio` and `npx remotion render` work on the same files.

## Getting started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The composition that is loaded into the editor lives in `src/remotion`. It is a regular Remotion project:

```bash
npx remotion studio      # open the same project in Remotion Studio
npx remotion render      # render it with the CLI
```

## How it works

```
┌─────────────────────────── Next.js app (production React) ───────────────────────────┐
│ Code editor · Timeline · Inspector · Transport · Renders                            │
│                                                                                     │
│   files ──▶ @remotion/browser-bundler (Web Worker, Rspack WASM) ──▶ bundle          │
│   codemods (@remotion/codemods) rewrite the files when you edit visually            │
│                                       │ applyBundle()                               │
│ ┌─────────────────────────────────────▼────── iframe (development React) ─────────┐ │
│ │ @remotion/browser-bundler/runtime  ──▶  <Canvas> from @remotion/sdk          │ │
│ │ Fast Refresh · CanvasController (timeline / selection / hover) · web-renderer  │ │
│ └───────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

- `src/app` – the Next.js App Router page and the dev-only `/api/project` route that saves files to disk.
- `src/editor` – the editor UI. `state/` holds the reducer (files, history, layout, playback settings), `hooks/` connect the preview iframe, the compiler and the player, `model/` contains the pure logic (composition parsing, layer ↔ source resolution, schemas) and `components/` the panels.
- `src/preview` – the code that runs inside the preview iframe. It is bundled separately by `scripts/build-preview.mjs` (esbuild) because Fast Refresh needs a development build of React, which Next.js does not ship to the browser. `bridge.ts` defines the API the editor uses to talk to the iframe. The same script copies the compiler worker and WebAssembly files to `public/compiler`.
- `src/remotion` – the Remotion project.

### Why an iframe?

Fast Refresh requires the React Refresh runtime to be installed before React DOM loads, and it only works with development builds of React. Isolating the preview in an iframe with its own React keeps the editor fast and the preview hot-reloadable.

### Cross-origin isolation

The browser bundler compiles with WebAssembly and shared memory, which requires the page to be [cross-origin isolated](https://web.dev/articles/coop-coep). `next.config.mjs` sets the `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers. Every cross-origin resource you load (fonts, images, scripts) needs to either support CORS or send a `Cross-Origin-Resource-Policy` header.

### How layers are linked to code

The browser bundler records where every JSX element was written, and the Canvas exposes that location for each mounted sequence through [`getCanvasSequenceSourceLocation()`](https://www.remotion.dev/docs/sdk/get-canvas-sequence-source-location). The editor looks the location up in the compiled files with `getNodes()` and registers the resulting node paths with [`controller.setSequenceNodePaths()`](https://www.remotion.dev/docs/sdk/create-canvas-controller#setsequencenodepaths), so selection, the timeline and the inspector all refer to the same source node — also for elements rendered in a `.map()` loop. Elements created by dependencies have no source location and are shown but not editable.

### Live previews

Dragging a value in the inspector or a track in the timeline does not rewrite the source on every pointer move. The editor previews the value on the canvas with [`controller.overrides`](https://www.remotion.dev/docs/sdk/create-canvas-controller#overrides) and writes it with a codemod once the gesture ends. The preview stays in place until the recompiled project is running, so the canvas never flashes the old value.

Moving an outline on the canvas works the same way, but the Canvas owns the gesture: it previews `style.translate` while dragging and reports the final values through the [`onSequencePropsChange`](https://www.remotion.dev/docs/sdk/canvas#onsequencepropschange) prop. Before a move starts, the Canvas asks the editor through [`getSequencePropStatuses`](https://www.remotion.dev/docs/sdk/canvas#getsequencepropstatuses) how the position is written: a position animated with `interpolate()` gets a keyframe at the playhead via `updateNodeKeyframes()`, and a position computed in code cannot be moved.

The callback reports static and keyframed changes together. The editor applies `updateMultipleNodeProps()` and `updateNodeKeyframes()` to the same project before committing the resulting files in one undoable step. One undo or redo restores or reapplies the entire mixed selection. The previews are released once the new bundle runs.

### Keyframes

The keyframe rows of the timeline read the `interpolate()` calls of each layer with `getNodeProps()` and place them on the composition timeline with [`getCanvasKeyframes()`](https://www.remotion.dev/docs/sdk/get-canvas-keyframes), which accounts for nested sequences and playback rates. Dragging a keyframe runs [`startCanvasKeyframeDrag()`](https://www.remotion.dev/docs/sdk/start-canvas-keyframe-drag) from `@remotion/sdk`: it previews the moved keyframes through `controller.overrides`, keeps them inside the composition, and reports the move when the pointer is released. The diamond buttons of the inspector are described by [`getCanvasKeyframeToggle()`](https://www.remotion.dev/docs/sdk/get-canvas-keyframe-toggle). Every keyframe edit is a `CanvasKeyframeChange`, which the editor passes to `updateNodeKeyframes()`.

The lines between keyframes come from [`getCanvasKeyframeEasingSegments()`](https://www.remotion.dev/docs/sdk/get-canvas-keyframe-easing-segments), which skips props whose easing cannot be edited, such as booleans. Picking a preset or dragging a parameter in the easing inspector builds a change with [`getCanvasKeyframeEasingChange()`](https://www.remotion.dev/docs/sdk/get-canvas-keyframe-easing-change) and the interpolation section uses [`getCanvasKeyframeSettings()`](https://www.remotion.dev/docs/sdk/get-canvas-keyframe-settings) and [`getCanvasKeyframeSettingsChange()`](https://www.remotion.dev/docs/sdk/get-canvas-keyframe-settings-change). Before a change is written, [`getCanvasKeyframeChangeOverride()`](https://www.remotion.dev/docs/sdk/get-canvas-keyframe-change-override) turns it into an override so the canvas shows the new curve immediately.

## Commands

**Start the editor**

```bash
npm run dev
```

**Rebuild the preview iframe bundle** (also runs as part of `dev` and `build`)

```bash
npm run build-preview
```

**Render a video with the CLI**

```bash
npx remotion render
```

**Upgrade Remotion**

```bash
npx remotion upgrade
```

## Deploying

`npm run build` creates a production build. Saving to disk is disabled outside of development — the editor still works as an in-memory playground.

The compiler's Web Worker and WebAssembly binary are copied to `public/compiler` by `scripts/build-preview.mjs` and loaded from there (see `workerUrl` in `src/editor/hooks/use-compiler.ts`), so they do not go through the Next.js bundler and both Turbopack and webpack work. Turbopack still emits a second copy of them into `.next/static/media` because `@remotion/browser-bundler` references them as a fallback; `scripts/prune-compiler-duplicates.mjs` removes those 32 MB after `next build`.

### Static export

Set `STATIC_EXPORT_BASE_PATH` to export the editor as static files into `out/`, for example to host it on a static file server or under a path of an existing site:

```bash
STATIC_EXPORT_BASE_PATH=/ npm run build          # served at the root
STATIC_EXPORT_BASE_PATH=/editor npm run build    # served under /editor
```

The starter project is embedded at build time and edits stay in memory. Only the `*.static.tsx` route files in `src/app` are part of the export, so the page and the `/api/project` route that read the project from disk are left out. Serve the files with the `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers described below; `next.config.mjs` cannot set headers for a static export. This is how [remotion.dev/experimental_sdk](https://www.remotion.dev/experimental_sdk) is deployed.

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
