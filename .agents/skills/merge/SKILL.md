---
name: merge
description: Wait for a Remotion pull request to become mergeable, handle merge conflicts, distinguish genuine CI failures from flakes, rerun flaky checks through the flake skill, and merge the PR. Use when asked to run /merge, merge a current PR after checks pass, or shepherd a Remotion PR through CI to merge.
---

# /merge

Use this skill for an existing pull request in the Remotion monorepo.

## Loop

Start from the top after every pushed fix, conflict resolution, CI rerun, or other state change:

1. Identify the PR:

```bash
gh pr view --json number,url,state,isDraft,baseRefName,headRefName,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup
```

2. If the PR is draft, closed, blocked by requested changes, missing required approval, or otherwise not eligible to merge for a non-CI reason, stop and report the blocker.

3. If GitHub reports merge conflicts, resolve them using the [`pr-ready`](../pr-ready/SKILL.md) workflow. Commit and push the resolution when needed, then start this loop from the top.

4. Wait for checks:

```bash
gh pr checks --watch --interval 30
```

5. If all required checks pass and the PR is mergeable, merge it:

```bash
gh pr merge --squash --delete-branch
```

If the repository or PR clearly requires another merge method, use that method instead.

## CI Failures

When checks fail, inspect the failed jobs and logs before deciding what to do:

```bash
gh pr checks --watch=false
gh run view <run-id> --json databaseId,status,conclusion,url,jobs
gh run view <run-id> --log-failed
```

If it is a genuine CI failure:

1. Fix the underlying issue locally, using the [`pr-ready`](../pr-ready/SKILL.md) workflow when helpful.
2. Run the targeted local checks, plus broader checks when the change has broad impact.
3. Commit and push the fix.
4. Start the loop from the top.

If it is a CI flake:

1. Use the [`flake`](../flake/SKILL.md) skill in this monorepo.
2. Rerun the failed flaky job or failed jobs as directed by that skill.
3. Start the loop from the top.
