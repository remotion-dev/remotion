---
name: checkout
description: Checkout a requested branch or ref in the Remotion repo, then install dependencies and build. Use when the user asks to checkout a ref and prepare the workspace.
---

Checkout the user-provided ref, then run:

```bash
bun i
bun run build
```
