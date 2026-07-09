---
name: studio
description: Start Remotion Studio from packages/example and open it in the Codex browser. Use when the user invokes /studio or $studio, asks to launch the example Studio, or wants the Remotion Studio dev UI available locally.
---

# Remotion Studio

## Overview

Prepare the Remotion monorepo, launch the example Studio, and open the served URL in the Codex in-app browser.

## Workflow

1. From the repository root, run:

```bash
bun i && bun run build
```

2. Start Studio from the example package:

```bash
cd packages/example && bunx remotion studio --no-open
```

Use `bunx`, not `npx`. Always pass `--no-open`; Codex should open the printed URL explicitly instead of letting the CLI open a browser.

3. Do not check `localhost:3000` before starting Studio. Another worktree may already be using that port, and probing it first can open the wrong Studio.
4. Keep the server process running and read its output for the local URL. The expected default is `http://localhost:3000`, but the CLI output is the source of truth.
5. If the CLI says Studio is already running, use the exact URL printed by that CLI invocation. Only verify with `curl` after the CLI has identified the URL for this worktree.
6. Open the exact CLI URL in the Codex in-app browser yourself. If no browser tool is available yet, use `tool_search` for the in-app browser control tool, then navigate to the local URL.
7. Tell the user the Studio URL and whether this is a newly started or already running server.
