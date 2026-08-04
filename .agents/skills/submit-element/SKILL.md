---
name: submit-element
description: Finalize a developed Remotion Element, add it to the docs gallery, commit reviewable preview assets, and prepare it for a pull request.
---

# Submit a Remotion Element

The source of truth for design and quality criteria is the [Element Guidelines](../../../packages/docs/elements/guidelines.mdx). Read them completely before making changes. If this skill and the guidelines diverge on acceptance criteria, follow the guidelines.

This skill owns the contributor submission workflow. It starts with an Element created by the [`scaffold-element` skill](../scaffold-element/SKILL.md). Maintainers use the [`accept-element` skill](../accept-element/SKILL.md) after approving the contribution.

## 1. Confirm the Element is ready

Confirm these files and the matching entry in `packages/docs/src/components/Elements/element-definitions.ts` already exist:

- `packages/docs/elements/<category>/<slug>/index.mdx`
- `packages/docs/elements/<category>/<slug>/<slug>.tsx`

Do not launch the Studio from this skill. Before continuing, require the developer to explicitly confirm that they visually reviewed `element-<category>-<slug>` in the docs Remotion Studio and that it looks correct. Do not infer approval from completed tests or from the agent's own inspection. If the developer has not approved it or more visual development is needed, give them these commands and stop the submission workflow:

```bash
bun run build
cd packages/docs
bun run remotion
```

## 2. Perform the submission review

Review the finished source, MDX page, and central definition against the Element Guidelines and the technical requirements in the [`scaffold-element` skill](../scaffold-element/SKILL.md). Resolve placeholder content and finalize the description, display name, contributors, dimensions, duration, `installationMode`, declared dependencies, preview padding, and poster frame.

The contribution must use review URLs until a maintainer accepts it:

- `posterUrl: '/elements/<category>-<slug>-preview.png'`
- `videoUrl: '/elements/<category>-<slug>-preview.mp4'`
- `image: /elements/<category>-<slug>-preview.png` in the page frontmatter

Do not use `https://remotion.media` URLs and do not upload to R2. The local URLs allow the contributor and reviewers to see the committed assets in the pull request deployment. The [`accept-element` skill](../accept-element/SKILL.md) replaces them after uploading the approved assets.

Preview assets are composited onto the standard background and use MP4 for broad browser, social-card, and embed compatibility, even when the Element itself supports transparency.

When the Element has Studio-editable controls, also review it using the [interactivity best practices skill](../interactivity-best-practices/SKILL.md).

If the Element imports a package that is not available to `packages/docs`, add it to `packages/docs/package.json`, run `bun install`, and include `bun.lock`.

## 3. Add it to the gallery

- Confirm that the entry in `packages/docs/src/components/Elements/element-definitions.ts` places the Element in the generated overview and category library.
- Add `'<category>/<slug>/index'` to the matching category in `packages/docs/elements-sidebars.ts`.

Preserve the ordering used by the sidebar. Do not add a manual link to the category index: the visual and raw Markdown libraries are generated from the central definitions. If the task explicitly introduces a new category, create an index that renders the filtered `ElementLibrary` and add its sidebar group as part of this step.

Before considering gallery registration complete, verify that the Element appears on the overview page, its category page, and the generated raw Markdown routes.

Do not edit `packages/docs/src/remotion/Root.tsx`; Element compositions are derived from the central definitions.

## 4. Render and inspect the previews

Render only the submitted Element:

```bash
cd packages/docs
bun run render-element-previews --element=<category>/<slug>
cd ../..
```

Do not run `render-element-previews` without an Element filter, because that renders every Element and clears the complete preview output.

Inspect these files and give both paths to the developer for visual review:

- `packages/docs/.element-previews/<category>/<slug>/preview.png`
- `packages/docs/.element-previews/<category>/<slug>/preview.mp4`

Stop and wait for the developer to explicitly confirm that both previews look correct. Do not copy the assets or finish the submission workflow until that approval is received.

## 5. Add the approved previews to the contribution

Copy the exact reviewed files to their flat review paths:

```bash
mkdir -p packages/docs/static/elements
cp packages/docs/.element-previews/<category>/<slug>/preview.png \
  packages/docs/static/elements/<category>-<slug>-preview.png
cp packages/docs/.element-previews/<category>/<slug>/preview.mp4 \
  packages/docs/static/elements/<category>-<slug>-preview.mp4
```

The PNG and MP4 must total no more than 10 MiB. Do not add the ignored `.element-previews` directory. The two files under `packages/docs/static/elements` are intentionally tracked and must be included in the pull request so external contributors and reviewers do not get 404 responses.

Do not upload the assets or replace the local URLs. That belongs to the maintainer acceptance workflow.

## 6. Format and test

Format the changed TypeScript and TSX files only. For the usual files:

```bash
bunx oxfmt \
  packages/docs/elements/<category>/<slug>/<slug>.tsx \
  packages/docs/src/components/Elements/element-definitions.ts \
  packages/docs/elements-sidebars.ts \
  --write

cd packages/docs
bun test src/test/elements.test.ts
cd ../..
```

The focused test validates that the local URLs match the committed flat assets and that their combined size is within the contribution limit.

## 7. Run final repository checks

```bash
bun run build
bun run stylecheck
git diff --check
git status --short
```

Before finishing, verify that the page is listed in the generated overview and category library, the generated raw Markdown, and the sidebar; all checks pass; and only intended files are part of the change. Report the commands run, their results, and the two tracked preview files. If a pull request is opened, keep “Allow edits from maintainers” enabled so the maintainer can complete the [`accept-element` workflow](../accept-element/SKILL.md) without rewriting the branch.
