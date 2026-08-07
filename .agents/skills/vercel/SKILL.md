---
name: vercel
description: Set up a Codex monitor for Vercel deployments and preview URLs. Use when the user invokes /vercel or $vercel, asks Codex to watch or monitor a Vercel deployment, waits for a Vercel preview or PR preview to become ready, or wants to be notified with both the deployment URL and preview URL once Vercel is READY.
---

# Vercel Monitor

Monitor one immutable Vercel deployment for the `remotion` project and notify the
current task when that exact deployment becomes ready or fails.

## Non-negotiable rules

- Never infer deployment state from an HTTP response. A branch preview alias can
  return 200 from the previous deployment while the new deployment is building.
- Never monitor a branch preview alias. It is movable and can resolve to an older
  or newer deployment.
- Pin the monitor to a Vercel deployment ID (`dpl_...`) or the immutable automatic
  deployment hostname (`<project>-<random>-<scope>.vercel.app`).
- Read the machine-readable Vercel deployment state. Do not parse human CLI output.
- Default to the `remotion` project and the `remotion` Vercel scope. Ignore the
  `bugs` project unless the user explicitly asks for it.

## Resolve the exact deployment

Prefer these sources, in order:

1. A Vercel deployment/dashboard URL supplied by the user.
2. The `Vercel – remotion` check on the active GitHub PR. Its dashboard URL has
   the form `https://vercel.com/remotion/remotion/<deployment-id-suffix>`.
3. The `remotion` row in the Vercel bot's PR comment.
4. `vercel list remotion --scope remotion --format=json`, matched to the exact PR,
   commit SHA, or branch in `.deployments[].meta`.

The final path segment of a dashboard URL becomes the deployment ID by prefixing
it with `dpl_`. For example:

```text
https://vercel.com/remotion/remotion/AbCd1234 -> dpl_AbCd1234
```

The `Preview` link in a Vercel PR comment is normally a branch alias. Preserve it
for the final notification, but do not use it for state checks.

When using `vercel list`, select the newest deployment that matches all available
identity fields:

- `.name == "remotion"`
- `.meta.githubPrId == <PR number>`, when a PR is known
- `.meta.githubCommitSha == <full commit SHA>`, when a commit is known

Do not silently fall back to a different commit. If no exact deployment can be
identified, ask for the Vercel dashboard URL, PR number, or commit SHA.

## Read state

Run the bundled checker from the repository root:

```bash
python3 .agents/skills/vercel/scripts/check-deployment.py <deployment-id-or-url>
```

The checker calls:

```bash
vercel inspect <deployment-id-or-immutable-url> \
  --scope remotion \
  --format=json
```

It validates the project, rejects moving aliases, and emits normalized JSON.
Use its `state` field:

- `READY`: success.
- `ERROR`, `CANCELED`, or `CANCELLED`: failure.
- `BUILDING`, `QUEUED`, or `INITIALIZING`: still in progress.
- `UNKNOWN`: not terminal. Report the diagnostic only if it persists or prevents
  creation of a trustworthy monitor.

HTTP probing may be used after `READY` as an optional reachability check. It must
never promote a non-ready or unknown deployment to `READY`.

## Create the monitor

Use the Codex automation tool to create a one-minute heartbeat with a bounded
count, normally 30 attempts. The heartbeat prompt must be self-contained and
include:

- The pinned deployment ID or immutable deployment hostname.
- The dashboard URL.
- The branch preview alias, if known, for the final notification only.
- The project, PR, branch, and commit context, if known.
- The exact checker command.
- The terminal-state rules above.

Use this prompt shape:

```text
Monitor this exact Vercel deployment until it reaches a terminal state.

Pinned deployment: <dpl_id_or_immutable_hostname>
Dashboard: <dashboard_url>
Preview alias (reporting only; never use for state): <preview_url_or_unknown>
Context: <project/pr/branch/commit>

From the repository root, run:
python3 .agents/skills/vercel/scripts/check-deployment.py <pinned_deployment>

Only the JSON `state` is authoritative.
- READY: reply "Vercel deployment is ready" and include Dashboard and Preview.
- ERROR, CANCELED, or CANCELLED: reply with the failure state and include both links.
- BUILDING, QUEUED, INITIALIZING, or UNKNOWN: stay quiet and check again next time.

Never curl the preview URL to determine readiness. After reporting a terminal
state, delete or pause this heartbeat if its automation ID is available.
```

Before creating a heartbeat, run the checker once. If the deployment is already
terminal, report immediately instead. Otherwise, tell the user which exact
deployment is being watched and the cadence.
