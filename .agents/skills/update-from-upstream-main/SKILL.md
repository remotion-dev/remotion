---
name: update-from-upstream-main
description: Update the current Remotion branch with the latest canonical main branch. Use when asked to update or sync from upstream main, merge the latest main into a feature branch, fast-forward local main, or bring a pull request branch up to date without rewriting published history.
---

# Update From Upstream Main

Update from the canonical `remotion-dev/remotion` repository while preserving local work and published branch history.

## Workflow

1. Inspect the repository before changing it:

   ```bash
   git status --short --branch
   git branch --show-current
   git remote -v
   ```

   Stop and report the state if the current checkout is detached or an operation such as a merge or rebase is already in progress.

   If the working tree contains staged, unstaged, or untracked changes, stash them automatically before continuing:

   ```bash
   git stash push --include-untracked --message "update-from-upstream-main: preserve local changes"
   git rev-parse stash@{0}
   ```

   Record the created stash's commit ID so the same entry can be restored later. Verify that the working tree is clean before fetching. If stashing fails or leaves changes behind, stop without starting the update. Do not include ignored files unless the user explicitly asks.

2. Select the canonical remote whose URL points to `remotion-dev/remotion`. Prefer `upstream` when it exists; otherwise use `origin`. If neither remote points to the canonical repository, stop and ask before adding or changing a remote.

3. Fetch the latest main branch without changing the working tree:

   ```bash
   git fetch <canonical-remote> main
   ```

4. Update the checked-out branch:
   - On `main`, require a fast-forward:

     ```bash
     git merge --ff-only <canonical-remote>/main
     ```

   - On a feature branch, merge main without opening an editor:

     ```bash
     git merge --no-edit <canonical-remote>/main
     ```

   Do not rebase, reset, or force-push. A merge keeps published branch history intact and can be pushed normally.

5. If the merge conflicts, resolve each file deliberately and preserve both the feature intent and upstream changes. Do not accept `ours` or `theirs` across the entire merge. Check every resolved file for leftover conflict markers before staging:

   ```bash
   rg -n '^(<{7}|={7}|>{7})' -- <resolved-files>
   ```

   Inspect and remove any matches that are conflict markers. Then stage only the resolved files and finish the merge with:

   ```bash
   git commit --no-edit
   ```

6. If step 1 created a stash, reapply it after the upstream update is complete:

   ```bash
   git stash apply --index <recorded-stash-commit>
   ```

   Reapply the stash before reporting success or before stopping after a fetch or merge failure, provided no Git operation is still in progress. If applying the stash causes conflicts, resolve them deliberately without rerunning `git stash apply`. The stash entry remains as a recovery copy. After confirming that all stashed changes, including untracked files and their staged state, were restored, find the entry with the recorded commit ID in `git stash list --format='%gd %H'` and drop only that entry. Never pop or drop a pre-existing stash.

7. Validate the result. Always run `git diff --check` and `git diff --cached --check`. If conflicts were resolved or the combined changes could affect behavior, run the relevant package tests. For broad changes, run:

   ```bash
   bun run build
   bun run stylecheck
   ```

8. Push only when the user asked to update a published branch or pull request. Use a normal push and stop if it is rejected:

   ```bash
   git push <canonical-remote> HEAD
   ```

   Never force-push.

9. Report the previous and new commit, whether the update was a fast-forward or merge, whether local changes were stashed and successfully reapplied, any conflicts resolved, validation performed, and whether the branch was pushed.
