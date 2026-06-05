---
name: pr-ready
description: Resolve CI failures, merge conflicts, or local branch changes to get a PR ready
---

Use this skill when a pull request is not ready because there is either:

- a CI failure
- a merge conflict
- uncommitted or unpushed changes

Bring the pull request back to a ready state.

Start by checking:

1. The current git branch and working tree state with `git status`.
2. Whether the local branch has commits that are not pushed yet.
3. Whether the PR branch has merge conflicts with the base branch.
4. The current PR checks or CI failures using the `gh` CLI.

If there are uncommitted changes, untracked files that look relevant, or commits that have not been pushed, stop before changing, committing, or pushing them and ask the user for confirmation.

If there is a merge conflict:

1. Update the local base branch reference.
2. Rebase or merge the PR branch onto the base branch, following the repository's existing workflow.
3. Resolve conflicts carefully and preserve both the PR intent and upstream changes.
4. Run the relevant formatting, tests, or builds for the affected packages.
5. Ask the user for confirmation before pushing if the conflict resolution creates unpushed commits.

If there is a CI failure:

1. Inspect the failing check logs with the `gh` CLI.
2. Fix the underlying cause instead of retrying or bypassing the failure.
3. Run the relevant local checks that cover the failure.
4. Commit the fix if needed.
5. Ask the user for confirmation before pushing if this creates unpushed commits.

If there are no CI failures, no merge conflicts, and no uncommitted or unpushed changes, report that the PR is already ready.
