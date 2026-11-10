---
name: import-canvas-capture
description: Import a recorded Remotion Canvas Capture into a project without Studio interactions using canvas-capture import. Use when adding a capture file as an editable composition with cursor keyframes.
---

# Import Canvas Capture

## Workflow

1. Locate the recorded capture file and the target Remotion project. The original
   recording must contain embedded `REMOTION_CAPTURE_DATA` metadata; a converted
   video that has lost this metadata cannot be imported.
2. The command finds the
   [root file](https://www.remotion.dev/docs/terminology/root-file) and derives the
   composition ID from the recording's filename. Use `--root-file` or `--composition`
   to override these defaults.
3. From the target project's root, run:

   ```sh
   bunx remotion canvas-capture import /absolute/path/capture.webm \
     --composition MyCapture
   ```

   When developing this command in the monorepo, build the CLI first with
   `bun run build`, then invoke the local CLI from the target project's root:

   ```sh
   node /absolute/path/to/remotion/packages/cli/remotion-cli.js \
     canvas-capture import /absolute/path/capture.webm \
     --composition MyCapture
   ```

4. Review the reported source files and public asset. The importer generates a
   component beside the root file, registers it, copies the video to the
   public directory, and installs missing `@remotion/media` and
   `@remotion/mac-cursors` dependencies at the project's Remotion version. Studio
   does not need to be running. Existing Studio sessions pick up source changes
   through their file watchers; this operation does not enter Studio's undo stack.
5. Report the composition ID and changed files to the user.

## Options and conflicts

- Defaults match Studio's capture import: 1920×1080, 60 fps, and duration rounded
  up from the recording. Pass `--width`, `--height`, or `--fps` to override them.
  Recorded video dimensions remain independent from composition dimensions.
- `--public-dir` overrides the configured public directory. `--package-manager`
  selects the dependency installer.
- Imports proceed immediately. `--dry-run` parses the recording and generates source changes without installing
  dependencies or writing project files. The programmatic result includes the
  proposed source changes.
- The root file is resolved relative to the project root; the CLI capture
  path is resolved relative to the current working directory.
- Existing component files and conflicting public assets are rejected. If the
  recording is already in the public directory, pass that file as the input to
  reuse it. Otherwise rename the input or select another composition ID; do not
  overwrite an existing asset or component to bypass an error.

## Programmatic access

Use `CliInternals.importCanvasCapture` from `@remotion/cli`. It is internal and
unstable. Its inputs are `captureFile`, `rootFile`, `compositionId`,
`remotionRoot`, `publicDir`, `fps`, `width`, `height`, `packageManager`, `logLevel`,
and `dryRun`. Supply `null` for default directory, dimensions, frame rate, and
package manager. File paths are resolved relative to `remotionRoot`.

The result contains the composition ID, source and asset paths, composition
metadata, and codemod changes. Pass `dryRun: true` to inspect changes in memory.
