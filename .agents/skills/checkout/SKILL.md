---
name: checkout
description: Checkout a requested branch or ref in the Remotion repo, rename the current task to the associated PR title when running in Codex, then install dependencies and build. Use when the user asks to checkout a ref and prepare the workspace.
---

Checkout the user-provided ref. Only when running in Codex, use
`gh pr view --json title --jq .title` to get the associated PR title, then use
`set_thread_title` to rename the current Codex task to that title. If the ref has no
associated PR, leave the task title unchanged and continue. Outside Codex, skip the
PR title lookup and task rename.

Then run:

```bash
bun i
bun run build
```
