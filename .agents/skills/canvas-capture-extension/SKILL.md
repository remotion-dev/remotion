---
name: canvas-capture-extension
description: Rebuild, install, and reload the private Remotion Canvas Capture unpacked Chrome extension. Use when the extension needs to be restored after a Codex worktree was deleted, rebuilt after source changes, moved to its durable install directory, or reloaded in Chrome or Chrome Canary.
---

# Canvas Capture Extension

Build the extension from `packages/canvas-capture-extension`, but always install
the unpacked copy outside the checkout so deleting a worktree cannot break it.

## Rebuild and install

1. Locate a Remotion checkout containing
   `packages/canvas-capture-extension/package.json`. Prefer the current checkout;
   otherwise use `/Users/jonathanburger/remotion`.
2. Run:

   ```bash
   .agents/skills/canvas-capture-extension/scripts/rebuild-extension.sh \
     --repo <remotion-checkout>
   ```

   The script builds with Bun and installs the complete WXT bundle in
   `/Users/jonathanburger/Applications/Remotion Canvas Capture Extension`.
   Building does not require an installed browser. To use the extension, choose
   Chrome 157.0.8080.0 or newer with Canvas Draw Element enabled.

3. Confirm that the installed directory contains `manifest.json`,
   `background.js`, `capture.js`, `drag-image.js`, `shot-tools.js`, `logo.svg`,
   and the generated extension icons.

## Develop with React and Vite

1. Close any running Recorder Chrome instance that uses the dedicated Canvas
   Capture profile.
2. From `packages/canvas-capture-extension`, run `bun run dev`.
3. WXT writes the development bundle to the durable directory
   `/Users/jonathanburger/Applications/Remotion Canvas Capture Extension Dev`,
   launches Chrome for Testing with the Canvas Draw Element feature
   enabled, and loads the extension automatically.
4. Click the extension icon to show the in-page controls. Source and manifest
   changes cause WXT to rebuild and reload the affected extension contexts.

Use the separate development directory only for `bun run dev`. Continue using
the production install directory above for manually loaded builds.

The Remotion pages receive recordings through `externally_connectable`
messaging; the extension does not inject a receiver content script. To test a
local destination, set `CANVAS_CAPTURE_HANDOFF_ORIGIN` (for example
`http://localhost:3000`) when running `bun run dev`. Production builds always
use `https://www.remotion.dev`.

To select another Chrome 157.0.8080.0 or newer browser, set
`CANVAS_CAPTURE_BROWSER_EXECUTABLE` to its executable path when running
`bun run dev`. Development uses the version-neutral
`~/Library/Application Support/Remotion Canvas Capture` profile.

## Reload in Chrome

- Launch Chrome 157.0.8080.0 or newer with the
  dedicated Canvas Capture profile, then open `chrome://extensions`.
- Enable **Developer mode** on `chrome://extensions`.
- If **Remotion Canvas Capture** already points to the durable directory, click
  **Reload**.
- If Chrome shows the deleted worktree path, remove that broken entry, choose
  **Load unpacked**, and select:

  ```text
  /Users/jonathanburger/Applications/Remotion Canvas Capture Extension
  ```

  This one-time move changes the extension ID because Chrome derives unpacked
  extension identity from its absolute path.

- Keep loading future production builds from the durable install directory,
  never from a worktree-local `dist` directory. WXT-managed development builds
  use the separate durable development directory documented above.
- Enable `chrome://flags/#canvas-draw-element` and restart Chrome when the
  experimental HTML-in-canvas API is unavailable. Alternatively, launch with
  `--enable-features=CanvasDrawElement`; either method is sufficient. Do not add
  `--enable-blink-features=CanvasDrawElement`, which triggers Chrome's
  unsupported-command-line warning.

Do not edit Chrome's `Preferences` or `Secure Preferences` files to move or
reload the extension. Use Chrome's extensions page so its integrity metadata
stays valid. Browser UI automation is allowed for loading, reloading, and
activating Canvas Capture; do not require the user to perform those clicks.

## Prepare a shot

Open the requested webpage in the compatible recording browser and activate
Canvas Capture through its toolbar icon or the Extensions menu. This exposes
the `setup_shot`, `get_shot`, and `save_recording` WebMCP tools in that tab.

Prepare the page and viewport, call `setup_shot`, and inspect a still preview
with `get_shot`. Leave the browser open with the shot ready for the user to
record. Start and stop recording manually so the user controls cursor movement.
