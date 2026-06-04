---
name: pr
description: Open a pull request for the current feature
---

Ensure we are not on the main branch, make a branch if necessary.  
For all packages affected, run Oxfmt to format the code:

```
bunx oxfmt src --write
```

Then run

```
bun run build
bun run stylecheck

```

to ensure we compile and CI linting/formatting passes.

Commit the changes. The title of the PR must be according to the [`pr-name`](../pr-name/SKILL.md) skill.

Push the changes to the remote branch.  
Use the `gh` CLI to create a pull request and use the same format as above for the title.

When creating the PR, do not pass the PR body inline through a shell command (for example, avoid `--body "..."` or heredocs in `bash`). Instead:

1. Write the PR body to a temporary Markdown file in the system temp directory (for example `/tmp/remotion-pr-body.md`, or a unique file created under `/tmp`).
2. Create the PR with `gh pr create --title "<title>" --body-file <path-to-temp-md-file>`.

Example:

```bash
gh pr create --title '`@remotion/package`: Add feature' --body-file /tmp/remotion-pr-body.md
```
