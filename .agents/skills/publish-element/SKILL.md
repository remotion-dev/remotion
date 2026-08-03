---
name: publish-element
description: Finalize a developed Remotion Element, add it to the docs gallery, render its previews, and run repository checks.
---

# Publish a Remotion Element

The source of truth for design and quality criteria is the [Element Guidelines](https://github.com/remotion-dev/remotion/blob/main/packages/docs/elements/guidelines.mdx). Read them completely before making changes. If this skill and the guidelines diverge on acceptance criteria, follow the guidelines.

This skill owns the technical publication workflow. It starts with an Element scaffold created by the [`scaffold-element` skill](../scaffold-element/SKILL.md) and does not create the initial development scaffold.

## 1. Confirm the Element is ready

Confirm these files and the matching entry in `packages/docs/src/components/Elements/element-definitions.ts` already exist:

- `packages/docs/elements/<category>/<slug>/index.mdx`
- `packages/docs/elements/<category>/<slug>/<slug>.tsx`

Do not launch the Studio from this skill. Before continuing, require the developer to explicitly confirm that they visually reviewed `element-<category>-<slug>` in the docs Remotion Studio and that it looks correct. Do not infer approval from completed tests or from the agent's own inspection. If the developer has not approved it or more visual development is needed, give them these commands and stop the publishing workflow:

```bash
bun run build
cd packages/docs
bun run remotion
```

## 2. Perform the publication review

Review the finished source, MDX page, and central definition against the Element Guidelines. Resolve placeholder content and finalize the description, display name, contributors, dimensions, duration, `installationMode`, declared dependencies, preview padding, poster frame, and `preview` object. Confirm that `durationInFrames` is appropriate for both the preview and either the generated `<Sequence>` or component-owned Sequence installed into Studio. Use `installationMode: 'wrapped'` by default. Before approving `'component-owned-sequence'`, verify that the component owns the intended interactive Sequence, forwards `from`, `durationInFrames`, `name`, and `style`, defines its rendered dimensions, and remains movable and trimmable without an outer Sequence. Confirm that every external source import except `react`, `react-dom`, and `remotion` appears in `dependencies`. Remotion packages must use `version: null`; every non-Remotion package must use an exact semantic version, not a range or tag. Confirm that `posterUrl` and `videoUrl` use flat `https://remotion.media/elements/<category>-<slug>-preview.png` and `.mp4` paths. Preview assets are composited onto the standard background and use MP4 for broad browser, social-card, and embed compatibility, even when the Element itself supports transparency. These explicit URLs are the publishing source of truth.

Re-check the technical implementation requirements from the [`scaffold-element` skill](../scaffold-element/SKILL.md): The reusable implementation must remain in one self-contained TSX file, fill its configured bounds without a preview-only wrapper `<Sequence>` or source padding, and leave outer placement to either the generated wrapper or its component-owned Sequence. Animated entrances must have exits with inline, hardcoded frame ranges on useful named `Interactive.*` elements. Inner control names must not repeat the Element display name.

When the Element has Studio-editable controls, also review it using the [interactivity best practices skill](../interactivity-best-practices/SKILL.md).

If the Element imports a package that is not available to `packages/docs`, add it to `packages/docs/package.json`, run `bun install`, and include `bun.lock`.

## 3. Add it to the gallery

- Confirm that the entry in `packages/docs/src/components/Elements/element-definitions.ts` places the Element in the generated overview and category library.
- Add `'<category>/<slug>/index'` to the matching category in `packages/docs/elements-sidebars.ts`.

Preserve the ordering used by the sidebar. Do not add a manual link to the category index: the visual and raw Markdown libraries are generated from the central definitions. If the task explicitly introduces a new category, create an index that renders the filtered `ElementLibrary` and add its sidebar group as part of this step.

Before considering gallery registration complete, verify that the Element appears on the overview page, its category page, and the generated raw Markdown routes.

Do not edit `packages/docs/src/remotion/Root.tsx`; Element compositions are derived from the central definitions.

## 4. Format and test

Format the changed TypeScript and TSX files only. For the usual files:

```bash
bunx oxfmt \
  packages/docs/elements/<category>/<slug>/<slug>.tsx \
  packages/docs/src/components/Elements/element-definitions.ts \
  packages/docs/elements-sidebars.ts \
  --write

cd packages/docs
bun test src/test/elements.test.ts
```

## 5. Render and inspect the previews

Perform the preview verification required by the Element Guidelines. Render only the new Element, using its `posterFrame` from `element-definitions.ts`:

```bash
cd packages/docs
mkdir -p .element-previews/<category>/<slug>
bunx remotion still \
  src/remotion/entry.ts \
  element-<category>-<slug> \
  .element-previews/<category>/<slug>/preview.png \
  --frame=<poster-frame> --gl=angle --overwrite
bunx remotion render \
  src/remotion/entry.ts \
  element-<category>-<slug> \
  .element-previews/<category>/<slug>/preview.mp4 \
  --codec=h264 --crf=23 --image-format=png --pixel-format=yuv420p \
  --gl=angle --muted --overwrite
cd ../..
```

Do not run `render-element-previews` without an Element filter, because that renders every Element and clears the complete preview output. If uploading is explicitly requested later, use:

```bash
cd packages/docs
bun run render-element-previews --element=<category>/<slug> --upload
cd ../..
```

The filtered command clears and regenerates only that Element's nested local review output, then uses its explicit metadata URLs for the public locations and R2 keys.

Inspect `packages/docs/.element-previews/<category>/<slug>/preview.png` and `preview.mp4`, then give both paths to the developer for visual review. Stop and wait for the developer to explicitly confirm that both previews look correct. Do not run the final repository checks or finish the publishing workflow until that approval is received.

Do not commit the ignored output or upload previews unless uploading was explicitly requested and maintainer R2 credentials are available.

## 6. Run final repository checks

```bash
bun run build
bun run stylecheck
git diff --check
git status --short
```

Before finishing, verify that the page is listed in the generated overview and category library, the generated raw Markdown, and the sidebar; all checks pass; and only intended files are part of the change. Report the commands run, their results, and the preview files inspected.
