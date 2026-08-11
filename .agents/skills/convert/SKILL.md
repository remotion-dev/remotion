---
name: convert
description: Start the local @remotion/convert app and open it in the Codex browser. Use when the user invokes /convert or $convert, asks to launch convert.remotion.dev locally, or wants to inspect the Convert package UI.
---

# Convert App

## Overview

Prepare the Remotion monorepo, launch the Convert app, and open the served URL in the Codex in-app browser.

## Workflow

1. From the repository root, run:

```bash
bun i && bun run build
```

2. Start the Convert app:

```bash
cd packages/convert && bun run dev
```

3. Keep the server process running and read its output for the local URL. The expected default is `http://localhost:5173`, but follow the printed URL if Vite chooses another port.
4. Open the URL in the Codex in-app browser. If no browser tool is available yet, use `tool_search` for the in-app browser control tool, then navigate to the local URL.
5. Tell the user the Convert URL and whether this is a newly started or already running server.
