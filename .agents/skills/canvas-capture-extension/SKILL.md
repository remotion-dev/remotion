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

   The script builds with Bun and installs the four unpacked-extension files in
   `/Users/jonathanburger/Applications/Remotion Canvas Capture Extension`.

3. Confirm that the installed directory contains `manifest.json`,
   `background.js`, `content.js`, and `receiver.js`.

## Reload in Chrome

- Open `chrome://extensions` manually in Chrome or Chrome Canary.
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

- Keep loading future builds from the durable directory, never from a
  worktree-local `dist` directory.
- Enable `chrome://flags/#canvas-draw-element` and restart Chrome when the
  experimental HTML-in-canvas API is unavailable.

Do not edit Chrome's `Preferences` or `Secure Preferences` files to move or
reload the extension, and do not automate the Chrome UI. Let the user use
Chrome's extensions page so its integrity metadata stays valid.
