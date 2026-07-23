---
name: vercel
description: Set up a Codex monitor for Vercel deployments and preview URLs. Use when the user invokes /vercel or $vercel, asks Codex to watch or monitor a Vercel deployment, waits for a Vercel preview or PR preview to become ready, or wants to be notified with both the deployment URL and preview URL once Vercel is READY.
---

# Vercel Monitor

## Overview

Set up a short-lived Codex heartbeat that watches the `remotion` Vercel deployment and reports back in the current thread when it is ready or failed. Always include both the Vercel deployment/dashboard URL and the public preview URL in the final notification.

## Project Selection

This repository has two Vercel deployments: `bugs` and `remotion`. The Vercel monitor skill always means the `remotion` deployment unless the user explicitly asks for another project.

- Select checks, deployment URLs, preview URLs, and CLI results for the `remotion` project.
- Ignore the `bugs` deployment, even if it appears first or is newer.
- When output contains links for both projects, use surrounding check names, project names, or deployment metadata to associate the links with `remotion`. If necessary, inspect the candidates before creating a monitor.
- Do not ask the user which project they mean merely because both deployments exist; default to `remotion`.

## Workflow

1. Resolve the deployment to monitor.
2. Check whether it is already ready.
3. Create a heartbeat monitor if it is still building or queued.
4. Tell the user what is being monitored and which links will be reported.

## Resolve Links

Prefer sources in this order:

1. A Vercel deployment URL or preview URL explicitly provided by the user.
2. URLs in the current terminal output or pasted logs.
3. Vercel URLs from the active GitHub PR's `remotion` check or deployment status. Ignore the `bugs` check.
4. Vercel CLI output for the `remotion` project, if the repository is linked and the user asked for the latest deployment.

Use `scripts/extract-vercel-links.py` to normalize raw terminal, Vercel CLI, or GitHub output:

```bash
python3 .agents/skills/vercel/scripts/extract-vercel-links.py < deployment-output.txt
```

If only one link is available, use `vercel inspect <url>` when authenticated to confirm that it belongs to the `remotion` project and discover the missing deployment or preview URL. If neither a deployment URL nor a preview URL can be found, ask the user for one concise piece of context: the Vercel URL, PR URL/number, or branch name.

## Check Status

Prefer Vercel's deployment status over HTTP probing:

```bash
vercel inspect <deployment-or-preview-url>
```

Treat these as terminal states:

- `READY`: report success immediately; do not create a monitor.
- `ERROR`, `FAILED`, `CANCELED`, or `CANCELLED`: report failure immediately; do not create a monitor.

Treat these as monitorable states:

- `BUILDING`, `QUEUED`, `INITIALIZING`, or unknown but plausibly in progress.

If Vercel CLI is unavailable or unauthenticated, probe the preview URL with `curl -I -L --max-time 20 <preview-url>`. HTTP 2xx or 3xx means the preview is ready. HTTP 401 or 403 can also mean the deployment is ready but protected; report it as ready/protected if the response is clearly from Vercel deployment protection. A Vercel `DEPLOYMENT_NOT_FOUND`, 404, timeout, or DNS failure means keep monitoring unless a terminal Vercel status says otherwise.

## Create The Monitor

Use the Codex app automation tool. If `automation_update` is not already in the tool list, search for it with `tool_search` before creating the monitor.

Create a `heartbeat`, not a cron, because the user wants this thread to be notified later. Use a one-minute cadence with a bounded count, usually 30 attempts unless the user asked for a different window. Do not show the raw RRULE string to the user.

The heartbeat prompt must be self-contained. Include:

- Deployment/dashboard URL, if known.
- Preview URL, if known.
- Branch, PR, project, or commit context, if known.
- Status command to prefer, normally `vercel inspect <url>`.
- HTTP fallback command for the preview URL.
- Ready criteria and failure criteria.
- Instruction to reply in the current thread only when ready or failed.
- Instruction to include both links in the notification.
- Instruction to delete or pause this heartbeat after reporting a terminal state, if the automation id is available.

Example heartbeat prompt:

```text
Check this Vercel deployment until it reaches a terminal state.

Deployment URL: <deployment-url-or-unknown>
Preview URL: <preview-url-or-unknown>
Context: <branch/pr/project/commit-or-unknown>

Prefer `vercel inspect <deployment-or-preview-url>` if available and authenticated. If that is unavailable, use `curl -I -L --max-time 20 <preview-url>` and, if needed, fetch the response body to distinguish Vercel deployment protection from DEPLOYMENT_NOT_FOUND.

Ready means Vercel status READY, or the preview URL returns HTTP 2xx/3xx, or it returns Vercel deployment-protection HTTP 401/403. Failure means Vercel status ERROR, FAILED, CANCELED, or CANCELLED.

If ready, reply in the thread: "Vercel deployment is ready" and include:
- Deployment: <deployment-url>
- Preview: <preview-url>

If failed, reply in the thread with the failure status and include the same two links.

If still building, queued, initializing, not found, or unknown, stay quiet and let the next heartbeat check again. After reporting ready or failed, delete or pause this heartbeat if the automation id is available.
```

After creating the heartbeat, tell the user briefly which deployment/preview is being watched and the check cadence. If the deployment is already ready or failed, do not create a monitor; report the terminal status and links immediately.
