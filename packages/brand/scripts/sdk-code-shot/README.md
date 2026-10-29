# SDK code shot

A real Monaco editor using the `vibe-dark` theme from `template-vibe-code`.
The import list comes from the template's preview runtime, keyframe model, and
editor actions, and only uses public exports from `@remotion/sdk` and
`@remotion/codemods`.

From `packages/brand`:

```sh
bun scripts/sdk-code-shot/server.ts
bun scripts/sdk-code-shot/capture.ts /tmp/sdk-monaco-source.png
```

The editable page is served at `http://127.0.0.1:3040`. The capture uses the
default bundled Remotion browser at 1180×1180 CSS pixels and 3× density, waiting
for Monaco's syntax highlighting and fonts before saving the 3540×3540 image.

Edit `imports.ts.txt` to change the APIs shown. Upload the new source image to
R2 and update `src/HomepageAssets/ExploreRemotion/SDK.tsx`, then render
`ExploreRemotionSDK` to produce the tilted homepage and docs image.
