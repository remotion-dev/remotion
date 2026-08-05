---
name: accept-element
description: Accept an external Remotion Element contribution by verifying its committed previews, uploading them to R2, removing the temporary assets, and preparing the pull request for review.
---

# Accept a Remotion Element

This is a maintainer-only workflow for contributions that used the external path in the [`submit-element` skill](../submit-element/SKILL.md). Do not use it for a repository writer's direct submission, which already has public preview URLs and no committed preview assets. Read the [Element Guidelines](../../../packages/docs/elements/guidelines.mdx), the [`scaffold-element` skill](../scaffold-element/SKILL.md), and the `submit-element` skill completely before making changes.

Run this workflow on the external contributor's pull request branch. Do not force push. For a pull request from a fork, confirm that “Allow edits from maintainers” is enabled. If the branch cannot be updated, upload only after approval and ask the contributor to apply the URL and asset cleanup described below.

## 1. Confirm the contribution is reviewable

Identify the single submitted `<category>/<slug>` and confirm that:

- The implementation, page, central definition, and sidebar registration are in the pull request.
- The page frontmatter and central definition use `/elements/<category>-<slug>-preview.png` and `.mp4` review URLs.
- The matching files are committed at `packages/docs/static/elements/<category>-<slug>-preview.png` and `.mp4`.
- The contributor explicitly reviewed the Element in Studio and approved both committed preview assets.
- The pull request has passed code review against the Element Guidelines.

Do not accept an Element whose metadata already points to a missing `https://remotion.media` asset or whose review assets are available only outside the pull request.

## 2. Verify the committed assets against the final code

Run the focused test, then render the Element again from the final pull request source:

```bash
cd packages/docs
bun test src/test/elements.test.ts
bun run render-element-previews --element=<category>/<slug>
cd ../..
```

Give the maintainer these committed asset paths:

- `packages/docs/static/elements/<category>-<slug>-preview.png`
- `packages/docs/static/elements/<category>-<slug>-preview.mp4`

Also give them the fresh render paths:

- `packages/docs/.element-previews/<category>/<slug>/preview.png`
- `packages/docs/.element-previews/<category>/<slug>/preview.mp4`

Ask the maintainer to visually compare the committed assets with the fresh render and confirm that they represent the same poster frame and animation. Stop and wait for explicit approval of the final source and both committed assets before uploading. Do not infer approval from the agent's own inspection. If the maintainer rejects them, return the contribution to the submission workflow.

## 3. Upload the exact approved files

With maintainer R2 credentials available, run:

```bash
cd packages/docs
bun run upload-element-preview \
  --element=<category>/<slug> \
  --source=submission
cd ../..
```

This command uploads the exact files from `packages/docs/static/elements`; it does not rerender or delete them. The explicit submission source validates that the assets are committed and unmodified, then checks the local paths, signatures, combined size, uploaded sizes, public HTTP responses, and content types. Do not continue unless both uploads are verified.

The command prints the public URLs:

- `https://remotion.media/elements/<category>-<slug>-preview.png`
- `https://remotion.media/elements/<category>-<slug>-preview.mp4`

## 4. Convert the contribution to its published state

Only after the upload succeeds:

1. Replace the local `posterUrl` and `videoUrl` in `packages/docs/src/components/Elements/element-definitions.ts` with the printed `https://remotion.media` URLs.
2. Replace the local `image` URL in `packages/docs/elements/<category>/<slug>/index.mdx` with the public poster URL.
3. Delete the two files from `packages/docs/static/elements`.
4. Remove `packages/docs/static/elements` if it is empty.

Do not change the slug or flat asset names between upload and cleanup.

## 5. Validate and update the pull request

```bash
cd packages/docs
bun test src/test/elements.test.ts
cd ../..
bun run build
bun run stylecheck
git diff --check
git status --short
```

The focused test now validates that the metadata contains the exact public URLs and that no matching local review assets remain.

Inspect the final diff. It should contain the Element source, page, definition, gallery registration, and public URLs, but not the PNG or MP4. Commit the acceptance cleanup normally to the same pull request branch and push without force. Then stop and report that the pull request is ready for review.
