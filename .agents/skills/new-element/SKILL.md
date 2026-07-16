---
name: new-element
description: Scaffold a new Remotion Element with a correctly configured preview composition for development in the docs Remotion Studio.
---

# Start a new Remotion Element

The source of truth is the [Element contributor guide](../../../packages/docs/elements/submit-an-element.mdx). Read it completely before making changes and follow it for all design and implementation decisions. If this skill and the guide diverge, follow the guide.

This skill prepares a development scaffold. Use the [`publish-element` skill](../publish-element/SKILL.md) when the Element is ready for the gallery.

## 1. Plan the preview

Choose an existing category and a kebab-case slug. Before creating files, determine the initial preview metadata needed for development:

- Composition width, height, fps, and duration
- Fixed Element width and height, or `null` for both
- Preview padding
- A provisional poster frame

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

Implement only enough of the component to provide a visible starting point in the intended bounds. Follow the contributor guide for the component itself. When using Studio-editable controls, also follow the [interactivity best practices skill](../interactivity-best-practices/SKILL.md).

## 3. Register the development composition

Import and register the component in `packages/docs/src/components/Elements/element-definitions.ts` using the planned preview metadata.

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
