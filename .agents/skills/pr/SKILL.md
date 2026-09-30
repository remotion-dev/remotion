---
name: pr
description: Open a pull request for the current feature
---

Ensure we are not on the main branch; make a branch if necessary.

Keep new agent-authored tests, including new test cases in existing files, out of the PR unless the user explicitly requested them. Updates to existing tests, fixtures, and snapshots are allowed when needed for the change. Review the diff and preserve pre-existing user changes.

If the changes add a Remotion Element, read the [Element contribution guide](../../../packages/docs/elements/contributing.mdx) before continuing.

Use [`scripts/pr-workflow.ts`](scripts/pr-workflow.ts) for the repeatable PR steps. Pass every changed file explicitly with `--file`, including relevant root-level files. Pass only Oxfmt-supported changed files with `--format`; do not format unrelated packages or the whole repository. If none are supported, omit `--format`.

For example:

```
bun .agents/skills/pr/scripts/pr-workflow.ts prepare \
  --file packages/example/src/Example.tsx \
  --format packages/example/src/Example.tsx
```

`prepare` formats the listed files, runs `bun run build` and `bun run stylecheck`, checks the changed-file list, and prints timings and `REVIEWED_DIFF`. Inspect the full diff and the contents of untracked files, including formatter changes, before publishing. If anything changes afterward, run `prepare` and review again.

Choose the PR title according to the [`pr-name`](../pr-name/SKILL.md) skill. Write the PR body to a temporary Markdown file in the system temp directory. If the work is tied to a GitHub issue, include a closing keyword such as `Closes #1234`, preserving the issue number or URL the user provided.

```
bun .agents/skills/pr/scripts/pr-workflow.ts publish \
  --file packages/example/src/Example.tsx \
  --reviewed <REVIEWED_DIFF> \
  --title 'Internal testbed: Describe the change' \
  --body-file /tmp/remotion-pr-body.md
```

`publish` verifies the reviewed diff, checks for an existing PR, commits once, pushes once with `git push -u origin HEAD`, and creates a PR with `gh pr create --body-file` if needed. It preserves an existing PR's title and body. Never force push unless the user asks. If publishing stops after a commit or push, inspect the branch and PR before retrying so those operations are not repeated blindly.

## Link directly changed website pages

After creating the PR, check whether it directly adds or modifies a primary page in `packages/docs`. Determine each page's public path from the page source, using `packages/docs/docusaurus.config.ts` as the route source. Do not infer paths for deleted pages or changes that only affect shared components, styles, data, or configuration.

After creating the PR, poll its comments for up to 60 seconds for the Vercel comment, sleeping 5 seconds between checks. Take the `Preview` link from the `remotion` project row and append each page path to it; ignore the `bugs` project row. If that preview link is unavailable and the deployment link only points to the Vercel dashboard, use `vercel inspect <deployment-url>` only when the Vercel CLI is installed and authenticated. Otherwise, do not modify the PR body and report that the preview URL could not be resolved.

Only wait for the Vercel comment. Do not wait for the deployment to finish, create a Vercel heartbeat, or probe the preview page.

Append the deep links to a `## Preview` section in the PR body. Fetch the current body into a temporary Markdown file and update it with `gh pr edit <pr> --body-file <path-to-temp-md-file>`; never pass the replacement body inline.

If either the page path or the preview URL cannot be determined confidently, leave the created PR unchanged and report that preview links were not added.
