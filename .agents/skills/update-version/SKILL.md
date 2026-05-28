---
name: update-version
description: Update `AvailableFrom` in a PR to the current Remotion version from `main`.
---

Use this when a PR contains docs changes with `<AvailableFrom v="...">` and the value should match the version currently in `main`.

1. Get the canonical version from `main`:

```bash
git fetch origin main --quiet
git --no-pager show origin/main:packages/core/src/version.ts
```

Read `VERSION` from that file (for example: `4.0.468`).

2. Find `AvailableFrom` entries changed in the current PR:

```bash
git --no-pager diff origin/main...HEAD -- packages/docs | rg 'AvailableFrom v="'
```

3. Update only `AvailableFrom` values touched by this PR so they match the `VERSION` from step 1.

4. Do not change unrelated `AvailableFrom` values outside the PR diff.

5. Commit and push the update.
