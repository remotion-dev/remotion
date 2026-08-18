---
name: accept-element-contribution
description: Publish an approved Remotion Element contribution by uploading its committed preview assets and replacing local preview URLs. Use only when given a pull request number or URL.
---

# Accept an Element Contribution

Use this skill only after a maintainer has approved the pull request. The caller must provide the pull request number or URL.

1. Check out the pull request branch.
2. Identify the submitted Element slug and confirm its PNG and MP4 preview assets are committed under `packages/docs/static/elements`.
3. Upload the approved assets:

```bash
cd packages/docs
bun run upload-element-preview \
  --element=<category>/<slug> \
  --source=submission
```

4. Replace the local `image`, `posterUrl`, and `videoUrl` paths with the printed `remotion.media` URLs. Delete the committed preview assets.
5. Commit and push the published state to the same pull request branch.
