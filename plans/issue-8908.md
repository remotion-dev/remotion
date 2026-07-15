# Issue #8908: Remotion Elements preview assets

Issue: [remotion-dev/remotion#8908](https://github.com/remotion-dev/remotion/issues/8908)

## Goal

Generate full-quality image and video previews for every Remotion Element and upload them to Cloudflare R2 behind `https://remotion.media/`.

This issue only establishes the asset pipeline and produces the assets. Displaying them in an Elements gallery is separate work. Existing Element detail pages keep their live `@remotion/player` preview.

## Decisions

- Generate one PNG poster and one muted MP4 for every Element.
- Render at the Element's native preview resolution without downscaling.
- Render the full configured Element duration.
- Use an opaque neutral preview canvas for both PNG and MP4 assets.
- Encode videos as H.264 MP4 with no audio.
- Upload assets to Cloudflare R2 instead of committing binaries.
- Use stable filenames that are overwritten when an Element changes.
- Require an explicit upload flag so local preview generation cannot overwrite production assets accidentally.

Expected initial output dimensions and durations:

| Element            |  Resolution |  Duration |
| ------------------ | ----------: | --------: |
| Paper Texture      | 1920 × 1080 | 4 seconds |
| Rotating Starburst | 1920 × 1080 | 8 seconds |
| Lower Third        |  1280 × 738 | 4 seconds |
| Number Counter     |   880 × 440 | 4 seconds |
| Circle Marker      |  1140 × 460 | 4 seconds |
| Crossed Off        |  1140 × 460 | 4 seconds |
| Strike Through     |  1140 × 460 | 4 seconds |
| Text Marker        |  1140 × 460 | 4 seconds |

## 1. Add canonical Element definitions and utilities

Create:

- `packages/docs/src/components/Elements/element-definitions.ts`
- `packages/docs/src/components/Elements/element-utils.ts`

Each definition should contain normalized, required values for:

- Component
- Slug and category
- Display name and description
- Composition width and height
- Element width and height as `number | null`
- Preview padding
- FPS and duration in frames
- Explicit poster frame
- Contributors

Avoid optional internal fields. Store default values explicitly in the definitions so rendering and detail pages cannot apply different defaults.

Update the Element MDX pages to pass their canonical definition to `ElementPage` instead of repeating render metadata:

- `packages/docs/elements/backgrounds/paper-texture/index.mdx`
- `packages/docs/elements/backgrounds/rotating-starburst/index.mdx`
- `packages/docs/elements/overlays/lower-third/index.mdx`
- `packages/docs/elements/data/number-counter/index.mdx`

Update:

- `packages/docs/src/components/Elements/ElementPage.tsx`

`ElementPage` should accept an Element definition while continuing to receive the source code injected by the existing remark plugin.

Export the definitions as a single keyed object from `element-definitions.ts`, and keep helpers for deriving composition IDs and public preview URLs in `element-utils.ts`.

## 2. Share the preview composition

Create:

- `packages/docs/src/components/Elements/ElementPreviewComposition.tsx`

Move the wrapping behavior currently created inside `ElementPage.tsx` into this shared component. It must preserve:

- Full-composition Elements
- Fixed-size Elements
- Centering and `previewPadding`
- Existing dimensions in the live detail-page Player
- The surrounding `<Sequence>` behavior

Add an asset-rendering wrapper that places the shared preview composition on a fixed neutral background. The neutral color must be a literal render-safe color rather than a Docusaurus CSS variable.

The live detail-page Player should remain visually and behaviorally unchanged.

## 3. Register Element compositions

Update:

- `packages/docs/src/remotion/Root.tsx`

Register one `<Composition>` for every definition inside a dedicated Remotion folder:

```tsx
<Folder name="elements">
  {/* Generated Element compositions */}
</Folder>
```

Use serializable slugs as composition props rather than passing React component functions through `defaultProps`. Composition IDs remain globally unique even when they are grouped in a `<Folder>`, so use stable IDs such as:

- `element-backgrounds-paper-texture`
- `element-backgrounds-rotating-starburst`
- `element-overlays-lower-third`
- `element-data-number-counter`

Each composition should use the Element's native preview width, height, FPS, and full duration.

## 4. Add the render and upload script

Create:

- `packages/docs/render-element-previews.ts`

Add to `packages/docs/package.json`:

```json
"render-element-previews": "bun run render-element-previews.ts"
```

The script should:

1. Bundle `packages/docs/src/remotion/entry.ts`.
2. Discover compositions whose IDs start with `element-`.
3. Validate every expected definition has a composition.
4. Render a PNG with `renderStill()` at the entry's explicit poster frame.
5. Render the full timeline with `renderMedia()`.
6. Encode MP4 using H.264, `yuv420p`, a reasonable CRF such as 23, and audio disabled.
7. Write local outputs to a temporary or ignored preview directory.
8. Leave local files available for inspection in render-only mode.
9. Upload only when an explicit `--upload` flag is present.
10. Verify uploaded object sizes and public HTTP responses.

The default command must be render-only:

```bash
cd packages/docs
bun run render-element-previews
```

Production upload should load credentials from the main worktree without printing them:

```bash
bun --env-file=<main-worktree>/packages/remotion-media/.env \
  run render-element-previews --upload
```

Use Bun's S3-compatible client with the existing Remotion R2 endpoint and bucket configuration.

## 5. R2 paths

Use stable keys derived from the Element slug:

```text
elements/<slug>/preview.png
elements/<slug>/preview.mp4
```

Initial public URLs include:

```text
https://remotion.media/elements/backgrounds/paper-texture/preview.png
https://remotion.media/elements/backgrounds/paper-texture/preview.mp4
https://remotion.media/elements/backgrounds/rotating-starburst/preview.png
https://remotion.media/elements/backgrounds/rotating-starburst/preview.mp4
https://remotion.media/elements/overlays/lower-third/preview.png
https://remotion.media/elements/overlays/lower-third/preview.mp4
https://remotion.media/elements/data/number-counter/preview.png
https://remotion.media/elements/data/number-counter/preview.mp4
```

Set the correct `image/png` and `video/mp4` content types during upload.

Stable overwritten URLs can temporarily return cached content. Use short cache revalidation metadata where supported and document that future consumers may need a version query parameter if CDN invalidation is insufficient.

## 6. Update contributor guidance

Update:

- `packages/docs/elements-template/index.mdx`
- `packages/docs/elements/submit-an-element.mdx`

Document that a new Element must:

- Have a definition entry
- Define its preview dimensions and timing
- Select an intentional poster frame
- Pass local preview rendering
- Have both assets inspected before upload

Production upload remains a maintainer action because it requires R2 credentials.

## 7. Tests

Extend:

- `packages/docs/src/test/elements.test.ts`

Verify:

- Every production Element has exactly one definition.
- Registry slugs match Element directory paths.
- Composition IDs are unique.
- Width, height, FPS, and duration are positive integers.
- Fixed Element dimensions are either both numbers or both `null`.
- Poster frames are integers within the Element timeline.
- Preview dimensions are even and compatible with H.264 `yuv420p`.
- Expected R2 URLs are derived deterministically.
- Every definition resolves to an Element composition during rendering.
- All Element compositions are registered inside the `elements` `<Folder>`.

Tests must not require R2 credentials or perform uploads.

## Validation

Run focused checks:

```bash
cd packages/docs
bun test src/test/elements.test.ts
bun run render-element-previews
```

Inspect every PNG and play every MP4 locally. Check that:

- The poster shows the Element in a representative state.
- Entrances are not accidentally captured while invisible.
- Videos loop acceptably.
- Transparent Elements are legible on the neutral canvas.
- Output resolution and duration match the definition.
- MP4 files contain no audio stream.

Then run package checks:

```bash
bunx turbo run lint test --filter=docs
```

Before committing, follow the repository checks:

```bash
bun run build
bun run stylecheck
```

Finally upload the assets and verify each public URL with an HTTP HEAD request and a browser playback check.

## Acceptance criteria

- Every Remotion Element is registered as a composition inside the `elements` `<Folder>`.
- Every Remotion Element has a representative PNG and full-duration MP4.
- Assets render at native preview resolution.
- The PNG and MP4 use the same neutral canvas and composition geometry as the live preview.
- Videos use H.264 MP4 and contain no audio.
- No generated binary is committed to Git.
- Uploading requires an explicit flag and valid R2 credentials.
- All expected `remotion.media` URLs return successful responses.
- Adding an Element without definition and preview metadata fails tests.
- Existing Element detail-page previews and install behavior remain unchanged.
- No gallery or category-page UI is added as part of this issue.
