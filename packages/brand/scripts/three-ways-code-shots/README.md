# Three ways code screenshots

The right pane in `ThreeWaysSplitView` uses lossless 1920 × 3240 PNGs, captured
at 640 × 1080 CSS pixels and 3× density. This matches one third of the
1920 × 1080 composition. The left pane shows agent prompts, and the middle pane shows Studio captures.
Each screenshot is an independent editable timeline item. The images share an
editable angled container using `EXPLORE_CAMERA_ANGLE`, matching the repeated
3D angle in `StudioUpdate`. Monaco is inset 32 CSS pixels from the left, with
a three-character minimum line-number gutter.

Start the capture page from `packages/brand`, then run the capture command in
another terminal:

```sh
bun scripts/three-ways-code-shots/server.ts
bun scripts/three-ways-code-shots/capture.ts /tmp/three-ways-code
```

The shared `../capture-code.ts` pipeline uses Remotion's bundled browser,
waits for Monaco and fonts, and saves PNGs at 3× density. Both this capture and
the SDK capture use the same Code Hike `dark-plus` tokens and editor styling.

| Screenshot | Source                                                              | Local frames |
| ---------- | ------------------------------------------------------------------- | ------------ |
| content    | `packages/example/src/rotating-starburst.element.tsx`               | 0–85         |
| editing    | `packages/jonnys-videos/src/roller-skis-new/scenes/RideMontage.tsx` | 86–124       |
| captions   | The `03 - Captions` element in `AgenticallyProgrammatically.tsx`    | 125–213      |
| exporting  | `packages/template-render-server/server/{index,render-queue}.ts`    | 214–240      |
| settings   | `packages/brand/remotion.config.ts`                                 | 241–402      |

The source files are formatted with their own Prettier configuration and a
44-column print width for the narrow pane. The rendering snippet uses 100 columns and a single-line progress logger, keeping the render options prominent. This display-only simplification leaves the render-server implementation unchanged. Complete syntax nodes are extracted
from the formatted source: the rotating starburst implementation, the ride montage’s trimmed video sequences,
the full `03 - Captions` element, the render-server's `bundle()` call followed by
its consecutive `selectComposition()` and `renderMedia()` calls, and the settings file. Only their common
leading indentation is removed. Monaco soft wrapping is disabled, so visible
line breaks are real Prettier output. Line numbers refer to the formatted copy;
the original project files are not rewritten. The combined rendering example is
displayed as `render.ts` with line numbers starting at 1.

The full captions array continues below the captured viewport instead of
ending after two entries. Syntax-based selection keeps the element intact
when the source grows or moves. The capture reuses the example package's
TypeScript 5 compiler API, since the root TypeScript version is CLI-only.

Upload regenerated images under new versioned keys in
`https://remotion.media/three-ways-code/`, verify their public SHA-256 hashes,
and update the image URLs in `ThreeWaysSplitView.tsx`. Local captures are
temporary; the composition reads the verified hosted assets.

The parent shot trims its source clock at frame 126. Its split-view instance
starts at that same frame, so the screenshot timeline starts at local frame 0.
The standalone `ThreeWaysSplitView` composition uses the same 403-frame timeline.
