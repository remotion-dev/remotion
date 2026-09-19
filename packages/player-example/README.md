# @remotion/player-example

## Usage

This is the internal Player testbed. Run `bun run dev` and choose an example.

## Browser-compiled Canvas

The `/browser-bundler` example compiles a conventional virtual project with
`createBrowserBundler({enableFastRefresh: true})`. The host owns the source editor,
compiler queue, progress, and diagnostics. Every successfully compiled bundle is
applied in order, even when newer edits are waiting.

The same-origin preview iframe has a separate, prebundled **development** React,
React DOM, Remotion, and Player. Its bootstrap installs React Refresh before loading
React DOM, so Fast Refresh also works when the Next.js host is a production build.
The iframe calls `createBrowserBundleRuntime().applyBundle()` and keeps both its
composition registration tree and `@remotion/canvas` instance mounted. The Canvas
controller exposes the timeline layers mounted at the current frame and owns the
selection UI next to the preview. Registered metadata is resolved reactively;
compatible edits preserve video state, the paused frame, playback, and layer panel.
Hook-signature changes are left to React Refresh to reset.

`createBrowserCompositionObserver()` from `@remotion/browser-bundler/runtime`
isolates registration and metadata from the Player UI. Its controller accepts
`update({root, compositionId, inputProps})`,
reports resolved compositions through `onChange` and failures through `onError`,
and owns cleanup through `dispose()`. Root changes, prop changes, and registration
updates resolve metadata without rebuilding the registration tree.

Run `bun run make` to generate the ignored `public/browser-bundler-preview.js`
artifact. The `dev`, `build-site`, and `testnextjs` scripts do this automatically.
From the repository root, `bunx turbo make --filter="@remotion/player-example"`
also builds the workspace dependencies. `bun run testbrowserbundler` exercises the
live-editing workflow against a production Next.js host on port 3137.

The iframe is renderer isolation, **not a security sandbox**. Only run trusted
source. The iframe bridge and preview UI belong to this example; consumers of the
headless bundler/runtime can build their own UI without depending on Studio.
