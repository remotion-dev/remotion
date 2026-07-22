---
name: pr
description: Open a pull request for the current feature
---

Ensure we are not on the main branch, make a branch if necessary.  
Check whether a PR already exists for the current branch with `gh pr status` or `gh pr view`.

If a PR already exists and there are no follow-up changes, report it and stop. If there are completed follow-up changes, continue with the formatting, verification, and commit steps below. Do not amend, rebase, force-push, or otherwise rewrite existing history unless the user explicitly asks for it.

Run Oxfmt on the files or package directories affected by the current change. Pass their actual paths; do not assume that the repository root has a `src` directory. Include relevant root-level files, and do not format unrelated packages or the whole repository.

For example:

```
bunx oxfmt <changed-file-or-package-directory>... --write
```

If none of the changed files are supported by Oxfmt, skip this step. Inspect any formatter changes before committing.

Then run

```
bun run build
bun run stylecheck

```

to ensure we compile and CI linting/formatting passes.

Commit the changes once. The title of the PR must be according to the [`pr-name`](../pr-name/SKILL.md) skill.

If a PR already exists, keep the new commit local unless the user explicitly asks to push or otherwise update the remote pull request. Report the local commit and stop without creating another PR.

Push the changes to the remote branch once, using `git push -u origin HEAD`.

Never force push. Do not use `git push --force`, `git push -f`, or `git push --force-with-lease`. If a normal push is rejected, stop and report the rejection to the user instead of rewriting remote history.

Use the `gh` CLI to create a pull request and use the same format as above for the title.

When creating the PR, do not pass the PR body inline through a shell command (for example, avoid `--body "..."` or heredocs in `bash`). Instead:

1. Write the PR body to a temporary Markdown file in the system temp directory (for example `/tmp/remotion-pr-body.md`, or a unique file created under `/tmp`).
   - If the current work was started from, fixes, or is otherwise tied to a GitHub issue, include a closing keyword in the PR body such as `Closes #1234` or `Closes https://github.com/owner/repo/issues/1234`. Preserve the issue number or URL from the user's original request if they provided one.
2. Create the PR with `gh pr create --title "<title>" --body-file <path-to-temp-md-file>`.

Example:

```bash
gh pr create --title '`@remotion/package`: Add feature' --body-file /tmp/remotion-pr-body.md
```

## Link directly changed website pages

After creating the PR, check whether it directly adds or modifies a primary page in `packages/docs`. Determine each page's public path from the page source, using `packages/docs/docusaurus.config.ts` as the route source. Do not infer paths for deleted pages or changes that only affect shared components, styles, data, or configuration.

After creating the PR, poll its comments for up to 60 seconds for the Vercel comment, sleeping 5 seconds between checks. Take the `Preview` link from the `remotion` project row and append each page path to it; ignore the `bugs` project row. If that preview link is unavailable and the deployment link only points to the Vercel dashboard, use `vercel inspect <deployment-url>` only when the Vercel CLI is installed and authenticated. Otherwise, do not modify the PR body and report that the preview URL could not be resolved.

Only wait for the Vercel comment. Do not wait for the deployment to finish, create a Vercel heartbeat, or probe the preview page.

Append the deep links to a `## Preview` section in the PR body. Fetch the current body into a temporary Markdown file and update it with `gh pr edit <pr> --body-file <path-to-temp-md-file>`; never pass the replacement body inline.

If either the page path or the preview URL cannot be determined confidently, leave the created PR unchanged and report that preview links were not added.
