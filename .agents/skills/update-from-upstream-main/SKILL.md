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

   Stop and report the state if the working tree contains uncommitted changes, the current checkout is detached, or an operation such as a merge or rebase is already in progress. Do not stash or discard changes automatically.

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

6. Validate the result. Always run `git diff --check`. If conflicts were resolved or the combined changes could affect behavior, run the relevant package tests. For broad changes, run:

   ```bash
   bun run build
   bun run stylecheck
   ```

7. Push only when the user asked to update a published branch or pull request. Use a normal push and stop if it is rejected:

   ```bash
   git push <canonical-remote> HEAD
   ```

   Never force-push.

8. Report the previous and new commit, whether the update was a fast-forward or merge, any conflicts resolved, validation performed, and whether the branch was pushed.
