# Sequence retains a replaced child

Copy this folder outside the Remotion checkout, then run:

```sh
bun install
bun run build
bun run preview
```

Open http://127.0.0.1:4178 in Chrome. Use the production build above: development React can retain debug owners independently of this bug.

1. Click **Replace child five times** and wait for the completion message.
2. Open DevTools → Memory and click **Collect garbage**.
3. Click **Inspect retained revisions**.

Only child 5 is still rendered, so the expected result is `[5]`. The affected implementation retains child 0 as well: `[0,5]`. Each child function captures a 1 MiB buffer. The array stores only weak references to these functions.

The extra two commits after replacement flush React's current and alternate trees. After clicking **Unmount Player** and collecting garbage again, the expected result is `[]`.

This measures JavaScript reachability after explicit GC. It does not measure process memory or assume when automatic GC will run.
