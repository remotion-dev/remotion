---
name: product-recording
description: Prepare Remotion Studio for a user-recorded product demo with Canvas Capture, then import the downloaded take into packages/brand as an editable composition. Use for recording Studio interactions, timeline demos, and product shots.
---

# Product recording

Prepare the browser and shot, let the user perform and record the interaction,
then bring the original capture into `packages/brand`. This is an internal
Remotion workflow; keep this skill in `.agents/skills`.

## Prepare Studio and Chrome

1. Use [canvas-capture-extension](../canvas-capture-extension/SKILL.md) to build
   and install the extension in its durable directory. Reload the installed
   extension through `chrome://extensions` after rebuilding; a successful build
   alone does not refresh Chrome's loaded extension.
2. Use an existing compatible Chrome with Canvas Draw Element enabled.
   Preserve unrelated browser tabs and unfinished recordings.
3. Find the requested composition's registration and owning package. Follow
   [studio](../studio/SKILL.md) for dependency/build preparation and server
   startup, but start in the owning package and open the recording in compatible
   **Chrome**. Use `bunx remotion studio --no-open` and the exact URL printed by
   that invocation, including when it reports an existing server. Do not assume
   port 3000 belongs to this checkout.
4. Open the composition with `studioPixelRatio=4` in the query string, preserving
   any other URL parameters. For example, if Studio reports port 3001:

   ```text
   http://localhost:3001/RollerSkiRoughCut?studioPixelRatio=4
   ```

   The parameter increases Studio's canvas backing resolution for sharp
   timeline captures. It does not set the extension's output resolution.
   `RollerSkiRoughCut` lives in `packages/jonnys-videos`; locate other requested
   compositions rather than assuming they live in `packages/example`.
5. Verify the requested composition and current timeline are visible. Activate
   Canvas Capture through its toolbar icon or Extensions menu.

## Prepare an optional shot and hand off

- Arrange the viewport, timeline height/zoom, playhead, and sidebars as needed
  for the requested demonstration. Do this before framing the shot.
- Use the extension's `setup_shot` and `get_shot` WebMCP tools when available.
  They are exposed after activating the extension. Choose the viewport, one
  visible element, or a rectangle; inspect a still with `get_shot` and
  `preview: true`. The crop stays fixed in viewport CSS pixels, so reframe after
  changing the window or layout.
- If those tools are unavailable, use the extension's **Entire page** or
  **Select area** controls and visually verify the selection. Output zoom and
  dimensions are separate from `studioPixelRatio`; set them for the intended
  shot and check the displayed dimensions.
- Before handing off, note existing capture files and their modification times
  in the user's Downloads folder so the new take can be identified later.
- Leave the shot ready without starting recording. Tell the user to click
  **Record**, perform their interaction, stop, and choose **Download recording**.
  The user controls the cursor and recording start/stop. Pause here until they
  have recorded; do not substitute an older download or claim an import is done.

## Import the downloaded take

1. After the user finishes, identify the new, fully downloaded capture in
   `~/Downloads` by filename and modification time relative to the handoff.
   Exclude incomplete `.crdownload` files. If several takes are plausible, ask
   which one to use.
2. Keep the original MP4 or WebM with embedded `REMOTION_CAPTURE_DATA` metadata.
   Do not transcode it before import; the metadata carries editable cursor data.
3. Use [import-canvas-capture](../import-canvas-capture/SKILL.md), targeting
   `packages/brand` and its composition registration file (currently
   `src/Root.tsx`). Choose an unused, descriptive composition ID. From
   `packages/brand`, the local built CLI can be invoked as:

   ```bash
   node ../cli/remotion-cli.js experimental-codemod add-canvas-capture \
     /absolute/path/to/downloaded-capture.mp4 \
     --composition-file src/Root.tsx --id TimelineRecording
   ```

   Follow that skill's dimension, dependency, and conflict guidance. Inspect
   the capture dimensions and pass `--width` and `--height` to match them when
   importing the full shot: the default 1920×1080 composition can crop a larger
   recording because the generated component retains native video dimensions.
   Preserve the download and existing compositions/assets.
4. Review the generated component, registration, copied public asset, and any
   dependency changes. Run the relevant brand validation before offloading.

## Offload the recording

Finish with [offload-r2](../offload-r2/SKILL.md): upload the imported recording
to `remotion.media`, verify that the public object's SHA-256 matches the local
file, and replace the composition's local asset reference with the hosted URL.
Remove the repository-local media copy only after verification; preserve the
original download. Follow that skill's focused validation, then report the
composition ID, hosted URL, and changed files. Distinguish a browser ready for
recording from a completed, imported, and offloaded take.
