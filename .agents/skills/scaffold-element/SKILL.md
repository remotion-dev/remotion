---
name: scaffold-element
description: Scaffold a new Remotion Element with a correctly configured preview composition for development in the docs Remotion Studio.
---

# Scaffold a Remotion Element

The source of truth for design and quality criteria is the [Element Guidelines](../../../packages/docs/elements/guidelines.mdx). Read them completely before making changes. If this skill and the guidelines diverge on acceptance criteria, follow the guidelines.

This skill owns the technical scaffolding workflow. Use the [`publish-element` skill](../publish-element/SKILL.md) when the Element is ready for the gallery.

## 1. Plan the preview

Choose an existing category and a kebab-case slug. Before creating files, determine the initial preview metadata needed for development:

- Composition width, height, fps, and preview duration
- Installed Element duration
- Element width and height
- Installation mode
- External source dependencies
- Preview padding, which affects only the docs preview and not the Element bounds
- A provisional poster frame
- Explicit poster and video URLs using the flat asset convention:
  - `https://remotion.media/elements/<category>-<slug>-preview.png`
  - `https://remotion.media/elements/<category>-<slug>-preview.mp4`

Preview videos are always opaque MP4 files for broad browser, social-card, and embed compatibility. Elements that are transparent in a composition are composited onto the standard preview background for these assets.

Inspect `packages/docs/elements-template/` and at least one existing Element in the same category. Do not create a new category unless the task explicitly requires one.

## 2. Scaffold the files

From the repository root, replace the placeholders and run:

```bash
cp -R packages/docs/elements-template \
  packages/docs/elements/<category>/<slug>
mv packages/docs/elements/<category>/<slug>/element.tsx \
  packages/docs/elements/<category>/<slug>/<slug>.tsx
```

Adapt the copied `index.mdx` to the production pattern: import `elementDefinitions`, use its `'<category>/<slug>'` entry, and set `sourceFile="./<slug>.tsx"`.

Implement only enough of the component in the generated `<slug>.tsx` file to provide a visible starting point in the intended bounds. Follow the Element Guidelines for the component itself. When using Studio-editable controls, also follow the [interactivity best practices skill](../interactivity-best-practices/SKILL.md).

## 3. Register the development composition

Import and register the component in `packages/docs/src/components/Elements/element-definitions.ts` using the planned preview metadata. Set `installationMode` explicitly and use the same `durationInFrames` for the preview and installed Element. Add the explicit `preview` object next to the render metadata, including `posterUrl` and `videoUrl`. The URLs in this object are the source of truth for publishing; do not add a helper that derives production URLs from the Element slug.

Do not edit `packages/docs/src/remotion/Root.tsx`. It automatically creates a composition for every central definition using the same sizing and wrapper used by published Elements.

If the component imports a package that is not available to `packages/docs`, add it to `packages/docs/package.json`, run `bun install`, and include `bun.lock`.

## 4. Check the scaffold

Format the changed TypeScript and TSX files, then run the focused test:

```bash
bunx oxfmt \
  packages/docs/elements/<category>/<slug>/<slug>.tsx \
  packages/docs/src/components/Elements/element-definitions.ts \
  --write

cd packages/docs
bun test src/test/elements.test.ts
cd ../..
```

Do not add the category-index or sidebar entries and do not render final preview assets yet. Those belong to the publishing workflow.

## 5. Hand off development

Do not launch the Studio from this skill. Tell the developer to run:

```bash
bun run build
cd packages/docs
bun run remotion
```

Then tell them to open the `elements` folder and select `element-<category>-<slug>`. Development should start in that composition so the Element is always evaluated with its configured dimensions, duration, padding, and preview background.

Report the created files, composition ID, focused test result, and that the next step after development is the [`publish-element` skill](../publish-element/SKILL.md).
