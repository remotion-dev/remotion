---
name: update-version
description: Update `AvailableFrom` in a PR to the next Remotion patch version (`main` + `0.0.1`).
---

Use this when a PR contains docs changes with `<AvailableFrom v="...">` and the value should reflect the next release version.

1. Get the canonical version from `main`:

```bash
git fetch origin main --quiet
git --no-pager show origin/main:packages/core/src/version.ts
```

Read `VERSION` from that file (for example: `4.0.468`), then compute the next patch version by incrementing the patch number by 1 (`4.0.469`).

2. Find `AvailableFrom` entries changed in the current PR:

```bash
git --no-pager diff origin/main...HEAD -- packages/docs | rg 'AvailableFrom v="'
```

3. Update only `AvailableFrom` values touched by this PR so they match the computed next patch version from step 1.

4. Do not change unrelated `AvailableFrom` values outside the PR diff.

5. Commit and push the update.
