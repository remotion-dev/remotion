---
name: pr
description: Open a pull request for the current feature
---

This skill is only for opening the initial pull request from finished local work.

If a PR already exists for the current branch, stop: do not format, commit, push, amend, or rebase unless the user explicitly asks for that Git action. Leave follow-up changes uncommitted by default.

Ensure we are not on the main branch, make a branch if necessary.  
Check whether a PR already exists for the current branch with `gh pr status` or `gh pr view`. If it exists, report it and stop.

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

Commit the changes once. The title of the PR must be according to the [`pr-name`](../pr-name/SKILL.md) skill.

Push the changes to the remote branch once, using `git push -u origin HEAD`.  
Use the `gh` CLI to create a pull request and use the same format as above for the title.

When creating the PR, do not pass the PR body inline through a shell command (for example, avoid `--body "..."` or heredocs in `bash`). Instead:

1. Write the PR body to a temporary Markdown file in the system temp directory (for example `/tmp/remotion-pr-body.md`, or a unique file created under `/tmp`).
2. Create the PR with `gh pr create --title "<title>" --body-file <path-to-temp-md-file>`.

Example:

```bash
gh pr create --title '`@remotion/package`: Add feature' --body-file /tmp/remotion-pr-body.md
```
