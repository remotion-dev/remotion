---
name: flake
description: Track Remotion CI flakes in issue #8375, increment repeated signatures, discover failed PR checks when no PR is given, and rerun flaky GitHub Actions jobs.
---

# Flake

Use this skill when a Remotion CI check fails and looks flaky, or when asked to run `/flake`.

Tracker issue: https://github.com/remotion-dev/remotion/issues/8375

## Goal

Record flaky CI failures in issue #8375 and get the affected suite running again.

For every confirmed or likely flake:

1. Identify the PR, workflow run, job, failed step, and concise failure signature.
2. Update issue #8375:
   - If the signature already exists, increment its `Count`.
   - If it is new, append a row with count `1`, workflow/job, first-seen date, and evidence URL.
3. Rerun the flaky job or failed jobs.

## Find The Failure

Prefer `gh` because the GitHub app may not expose all Actions logs or write permissions.

If the user gave a PR:

```bash
gh pr view <pr-number> --repo remotion-dev/remotion --json number,title,headRefName,statusCheckRollup
gh pr checks <pr-number> --repo remotion-dev/remotion --watch=false
```

If the user gave a workflow run or job URL:

```bash
gh run view <run-id> --repo remotion-dev/remotion --json databaseId,attempt,displayTitle,event,headBranch,headSha,status,conclusion,workflowName,createdAt,updatedAt,url,jobs
gh api repos/remotion-dev/remotion/actions/jobs/<job-id>/logs
```

If there is no PR context, inspect recent open PRs and recent failed runs:

```bash
gh pr list --repo remotion-dev/remotion --state open --limit 30 --json number,title,headRefName,statusCheckRollup
gh run list --repo remotion-dev/remotion --workflow "Install and Test" --status failure --limit 20 --json databaseId,displayTitle,event,headBranch,headSha,conclusion,createdAt,url,workflowName
```

For rerun attempts, inspect the original attempt before deciding whether a failure was flaky:

```bash
gh api repos/remotion-dev/remotion/actions/runs/<run-id>/attempts/1/jobs --paginate
gh api repos/remotion-dev/remotion/actions/jobs/<failed-job-id>/logs
```

## Classify A Flake

Treat a failure as a flake when at least one is true:

- The same run, job, or failed step succeeded after a rerun without code changes.
- The failure is infrastructure/network related, such as `fetch failed`, connection resets, package manager download failures, cache service failures, or runner provisioning errors.
- The test failure is a timeout, race, browser disconnect, port collision, or intermittent external service failure, and the PR changes do not plausibly touch that area.

Do not record deterministic type errors, lint errors, snapshots, or test assertions caused by changed source behavior unless there is evidence they pass on retry.

## Signature Rules

Use a stable signature that groups repeats but stays specific enough to act on:

- Include package or suite when available, for example `@remotion/it-tests#testssr`.
- Include test name when available.
- Include the root error text, stripped of timestamps, paths, random IDs, ports, line numbers, and ANSI codes.
- Include workflow/job separately in the tracker row, not inside the signature unless needed to disambiguate.

Good examples:

- `` `oven-sh/setup-bun@v2.1.2` failed with `TypeError: fetch failed` ``
- `` `delayRender()` timeout while running `Render video with browser instance not open` in `@remotion/it-tests#testssr` ``

## Update The Tracker

Read the issue body:

```bash
gh issue view 8375 --repo remotion-dev/remotion --json body --jq .body
```

Edit the full issue body, preserving the table. Always write the replacement Markdown to a temporary file and use `--body-file`; do not pass multiline Markdown inline.

Table format:

```md
| Count | Signature | Workflow / job | First seen | Evidence |
| ---: | --- | --- | --- | --- |
| 1 | `signature` | `Workflow` / `Job` | YYYY-MM-DD | https://github.com/remotion-dev/remotion/actions/runs/... |
```

When incrementing an existing row:

- Change only `Count` unless the evidence link is dead or less useful than the new one.
- Keep `First seen` as the earliest known date.

When appending a row:

- Use the GitHub Actions job URL when possible.
- Use the current date from the log timestamp, not the local machine date, if they differ.

Verify after editing:

```bash
gh issue view 8375 --repo remotion-dev/remotion --json body --jq .body
```

## Rerun

Prefer rerunning only failed jobs:

```bash
gh run rerun <run-id> --repo remotion-dev/remotion --failed
```

If only one known flaky job needs a rerun and the run is complete:

```bash
gh api --method POST repos/remotion-dev/remotion/actions/jobs/<job-id>/rerun
```

If a flaky suite is still in progress and waiting would block the task, abort that workflow run and rerun failed jobs after cancellation is visible:

```bash
gh run cancel <run-id> --repo remotion-dev/remotion
gh run watch <run-id> --repo remotion-dev/remotion --exit-status
gh run rerun <run-id> --repo remotion-dev/remotion --failed
```

If `gh run watch` exits non-zero because cancellation made the run fail, continue to rerun failed jobs.

## Report Back

Summarize:

- Tracker issue row added or incremented.
- Rerun action taken, including run or job URL.
- Any remaining running checks that were intentionally left alone.
