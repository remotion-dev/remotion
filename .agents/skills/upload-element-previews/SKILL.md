---
name: upload-element-previews
description: Upload a Remotion Element's preview assets to remotion.media and replace local preview URLs. Use when given an Element slug, or when exactly one Element's preview assets are present in the current worktree.
---

# Upload Element Previews

1. Identify the Element slug. Ask if it is ambiguous.
2. Choose the source:
   - Use `render` for fresh files in `.element-previews`.
   - Use `submission` for committed files in `static/elements`.
3. Upload the previews:

```bash
cd packages/docs
bun run upload-element-preview \
  --element=<category>/<slug> \
  --source=<render|submission>
```

To refresh an already-published preview, add `--overwrite`. The uploader accepts it only when the Element definition already uses the exact expected `https://remotion.media/elements/...` PNG and MP4 URLs.

4. For a new preview, replace `image`, `posterUrl`, and `videoUrl` with the printed `remotion.media` URLs. An overwritten preview keeps its existing URLs.
5. If using `submission`, delete the local review assets. If using `render`, leave `.element-previews` uncommitted.
6. Commit and push when the work belongs on a branch.
