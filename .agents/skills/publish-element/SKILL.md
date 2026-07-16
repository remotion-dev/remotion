---
name: publish-element
description: Finalize a developed Remotion Element, add it to the docs gallery, render its previews, and run repository checks.
---

# Publish a Remotion Element

The source of truth is the [Element contributor guide](../../../packages/docs/elements/submit-an-element.mdx). Read it completely before making changes and follow it for all acceptance criteria. If this skill and the guide diverge, follow the guide.

This skill starts with an Element scaffold created by the [`new-element` skill](../new-element/SKILL.md). It does not create the initial development scaffold.

## 1. Confirm the Element is ready

Confirm these files and the matching entry in `packages/docs/src/components/Elements/element-definitions.ts` already exist:

- `packages/docs/elements/<category>/<slug>/index.mdx`
- `packages/docs/elements/<category>/<slug>/<slug>.tsx`

Do not launch the Studio from this skill. Ask the developer to confirm that they developed and reviewed `element-<category>-<slug>` in the docs Remotion Studio. If more visual development is needed, give them these commands and stop the publishing workflow:

```bash
bun run build
cd packages/docs
bun run remotion
```

## 2. Perform the publication review

Review the finished source, MDX page, and central definition against the contributor guide. Resolve placeholder content and finalize the description, display name, contributors, dimensions, duration, preview padding, and poster frame.

When the Element has Studio-editable controls, also review it using the [interactivity best practices skill](../interactivity-best-practices/SKILL.md).

If the Element imports a package that is not available to `packages/docs`, add it to `packages/docs/package.json`, run `bun install`, and include `bun.lock`.

## 3. Add it to the gallery

- Add the Element page to `packages/docs/elements/<category>/index.mdx`.
- Add `'<category>/<slug>/index'` to the matching category in `packages/docs/elements-sidebars.ts`.

Preserve the ordering used by the category page and sidebar. If the task explicitly introduces a new category, create its category index and sidebar group as part of this step.

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

Perform the preview verification required by the contributor guide:

```bash
bun run render-element-previews
```

Inspect `.element-previews/<category>/<slug>/preview.png` and `preview.mp4`, and give those paths to the developer for review. This command renders every Element and clears the previous preview output. Do not commit the ignored output or pass `--upload` unless uploading was explicitly requested and maintainer R2 credentials are available.

Return to the repository root:

```bash
cd ../..
```

## 6. Run final repository checks

```bash
bun run build
bun run build-docs
bun run stylecheck
git diff --check
git status --short
```

Before finishing, verify that the page is listed in its category and sidebar, all checks pass, and only intended files are part of the change. Report the commands run, their results, and the preview files inspected.
