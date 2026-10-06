---
name: install-canvas-capture-browser
description: Install and verify Chrome for Testing with major version 157 or newer for the private Remotion Canvas Capture extension on Apple Silicon macOS. Use when setting up Canvas Capture or when no compatible Chrome browser is installed.
---

# Install Canvas Capture Browser

Canvas Capture requires Chrome with major version 157 or newer with Canvas Draw Element enabled.
Use an existing compatible Chrome browser, or install Chrome for Testing with
the bundled script. The extension also checks the required HTML-in-canvas API
and video encoding configuration before allowing recording.

## Install

1. Run the bundled installer:

   ```bash
   .agents/skills/install-canvas-capture-browser/scripts/install-browser.sh
   ```

   The script only supports Apple Silicon macOS. It selects the first compatible
   Stable, Beta, Dev, or Canary release from Google's Chrome for Testing metadata,
   verifies that the downloaded app matches that release, and
   installs the app at `/Users/jonathanburger/Applications/Recorder Chrome.app`.
   It exits successfully without downloading when the major version is 157 or newer and the browser is
   already installed. It does not overwrite an incompatible existing app.

2. Confirm the script reports the expected installed path and a major version of at least 157.

3. Launch it for Canvas Capture with:

   ```bash
   '/Users/jonathanburger/Applications/Recorder Chrome.app/Contents/MacOS/Google Chrome for Testing' \
     --user-data-dir='/Users/jonathanburger/Library/Application Support/Remotion Canvas Capture' \
     --enable-features=CanvasDrawElement \
     --enable-blink-features=CanvasDrawElement \
     --no-first-run \
     --no-default-browser-check
   ```
