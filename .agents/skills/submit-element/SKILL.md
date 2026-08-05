---
name: submit-element
description: Finalize a developed Remotion Element, add it to the docs gallery, and prepare either a direct member submission or an externally reviewable contribution.
---

# Submit a Remotion Element

The source of truth for design and quality criteria is the [Element Guidelines](../../../packages/docs/elements/guidelines.mdx). Read them completely before making changes. If this skill and the guidelines diverge on acceptance criteria, follow the guidelines.

This skill owns the contributor submission workflow. It starts with an Element created by the [`scaffold-element` skill](../scaffold-element/SKILL.md). Repository writers upload reviewed previews directly. Other contributors commit temporary review assets that a maintainer later processes with the [`accept-element` skill](../accept-element/SKILL.md).

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

## 2. Select the submission path

Determine the authenticated GitHub account's permission on the canonical repository. Do not infer membership from Git remotes, branch names, or commit email.

```bash
login=$(gh api user --jq '.login' 2>/dev/null || true)
permission=$(
  if [ -n "$login" ]; then
    gh api "repos/remotion-dev/remotion/collaborators/$login/permission" \
      --jq '.permission' 2>/dev/null || true
  fi
)
printf 'GitHub user: %s\nRepository permission: %s\n' \
  "${login:-unknown}" "${permission:-unknown}"
```

Use the **direct member path** only when `permission` is `write`, `maintain`, or `admin`. Before continuing on that path, verify without printing their values that Bun can read both `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`:

```bash
bun -e 'process.exit(Bun.env.AWS_ACCESS_KEY_ID && Bun.env.AWS_SECRET_ACCESS_KEY ? 0 : 1)'
```

If a repository writer is missing either credential, stop and report that direct preview upload credentials are required. Do not silently commit temporary assets for them.

Use the **external contribution path** when the permission is `read`, `triage`, `none`, unknown, or the GitHub lookup fails. This path does not require upload credentials.

## 3. Perform the submission review

Review the finished source, MDX page, and central definition against the Element Guidelines and the technical requirements in the [`scaffold-element` skill](../scaffold-element/SKILL.md). Resolve placeholder content and finalize the description, display name, contributors, dimensions, duration, `installationMode`, declared dependencies, preview padding, and poster frame.

Keep the local review URLs in place while rendering and reviewing:

- `posterUrl: '/elements/<category>-<slug>-preview.png'`
- `videoUrl: '/elements/<category>-<slug>-preview.mp4'`
- `image: /elements/<category>-<slug>-preview.png` in the page frontmatter

Preview assets are composited onto the standard background and use MP4 for broad browser, social-card, and embed compatibility, even when the Element itself supports transparency.

When the Element has Studio-editable controls, also review it using the [interactivity best practices skill](../interactivity-best-practices/SKILL.md).

If the Element imports a package that is not available to `packages/docs`, add it to `packages/docs/package.json`, run `bun install`, and include `bun.lock`.

## 4. Add it to the gallery

- Confirm that the entry in `packages/docs/src/components/Elements/element-definitions.ts` places the Element in the generated overview and category library.
- Add `'<category>/<slug>/index'` to the matching category in `packages/docs/elements-sidebars.ts`.

Preserve the ordering used by the sidebar. Do not add a manual link to the category index: the visual and raw Markdown libraries are generated from the central definitions. If the task explicitly introduces a new category, create an index that renders the filtered `ElementLibrary` and add its sidebar group as part of this step.

Before considering gallery registration complete, verify that the Element appears on the overview page, its category page, and the generated raw Markdown routes.

Do not edit `packages/docs/src/remotion/Root.tsx`; Element compositions are derived from the central definitions.

## 5. Render and inspect the previews

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

Stop and wait for the developer to explicitly confirm that both previews look correct. Do not upload or copy the assets until that approval is received.

## 6A. Direct member path: Upload the render

Do not copy the previews into `packages/docs/static/elements` and do not add them to Git. Upload the exact reviewed render:

```bash
cd packages/docs
bun run upload-element-preview \
  --element=<category>/<slug> \
  --source=render
cd ../..
```

The uploader validates the local URLs, signatures, combined size, uploaded sizes, public HTTP responses, and content types. Do not continue unless both uploads are verified.

Then:

1. Replace the local `posterUrl` and `videoUrl` in `packages/docs/src/components/Elements/element-definitions.ts` with the printed `https://remotion.media` URLs.
2. Replace the local `image` URL in `packages/docs/elements/<category>/<slug>/index.mdx` with the public poster URL.
3. Confirm that no matching files exist under `packages/docs/static/elements`.

If the Element changes visually after this upload, restore the local URLs, render and review it again, rerun the direct upload, and only then restore the public URLs.

## 6B. External contribution path: Add review assets

Do not upload to R2 or replace the local URLs. Copy the exact reviewed files to their flat review paths:

```bash
mkdir -p packages/docs/static/elements
cp packages/docs/.element-previews/<category>/<slug>/preview.png \
  packages/docs/static/elements/<category>-<slug>-preview.png
cp packages/docs/.element-previews/<category>/<slug>/preview.mp4 \
  packages/docs/static/elements/<category>-<slug>-preview.mp4
```

The PNG and MP4 must total no more than 10 MiB. Do not add the ignored `.element-previews` directory. The two files under `packages/docs/static/elements` are intentionally tracked and must be included in the pull request so the contributor and reviewers do not get 404 responses.

The [`accept-element` skill](../accept-element/SKILL.md) uploads the approved assets and replaces the local URLs after review.

## 7. Format and test

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

For direct member submissions, the focused test validates the exact public URLs and the absence of local review assets. For external contributions, it validates the local URLs, flat review assets, file signatures, and combined contribution size.

## 8. Run final repository checks

```bash
bun run build
bun run stylecheck
git diff --check
git status --short
```

Before finishing, verify that the page is listed in the generated overview and category library, the generated raw Markdown, and the sidebar; all checks pass; and only intended files are part of the change.

For the direct member path, report the two verified public preview URLs and confirm that no preview assets are tracked. For the external path, report the two tracked review assets and keep “Allow edits from maintainers” enabled if a pull request is opened. In both cases, stop after preparing the contribution for review.
