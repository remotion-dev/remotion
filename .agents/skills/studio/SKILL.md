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
cd packages/example && bunx remotion studio
```

Use `bunx`, not `npx`.

3. Keep the server process running and read its output for the local URL. The expected default is `http://localhost:3000`, but follow the printed URL if Remotion chooses another port.
4. If the output says the server is already running on port 3000, confirm it with `curl http://localhost:3000` and open that URL if it responds.
5. Open the URL in the Codex in-app browser. If no browser tool is available yet, use `tool_search` for the in-app browser control tool, then navigate to the local URL.
6. Tell the user the Studio URL and whether this is a newly started or already running server.
