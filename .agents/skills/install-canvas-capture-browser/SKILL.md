---
name: install-canvas-capture-browser
description: Install and verify the pinned Chrome for Testing build used by the private Remotion Canvas Capture extension on Apple Silicon macOS. Use when setting up Canvas Capture, when Recorder Chrome is missing or has the wrong version, or when the canvas-capture-extension installer reports that Chrome for Testing 150.0.7842.0 (r1631007) is unavailable.
---

# Install Canvas Capture Browser

Install the exact Chrome for Testing build known to support Canvas Draw Element
and proprietary H.264 codecs. Keep it pinned because other Chrome builds may
remove or change the experimental API.

## Install

1. Run the bundled installer:

   ```bash
   .agents/skills/install-canvas-capture-browser/scripts/install-browser.sh
   ```

   The script only supports Apple Silicon macOS. It downloads revision
   `r1631007`, verifies the archive checksum and version `150.0.7842.0`, and
   installs the app at `/Users/jonathanburger/Applications/Recorder Chrome.app`.
   It exits successfully without downloading when the correct version is
   already installed. It does not overwrite an incompatible existing app.

2. Confirm the script reports the expected installed path and version.

3. Launch it for Canvas Capture with:

   ```bash
   '/Users/jonathanburger/Applications/Recorder Chrome.app/Contents/MacOS/Google Chrome for Testing' \
     --user-data-dir='/Users/jonathanburger/Library/Application Support/Chrome for Testing Canvas Capture r1631007' \
     --enable-features=CanvasDrawElement \
     --enable-blink-features=CanvasDrawElement \
     --disable-component-update \
     --no-first-run \
     --no-default-browser-check
   ```

Use this browser only with trusted websites because the pinned build does not
receive security updates.
