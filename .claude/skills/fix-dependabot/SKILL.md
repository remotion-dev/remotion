---
name: fix-dependabot
description: Fix a Dependabot PR by updating all monorepo instances of the dependency, running bun install, and pushing
---

Dependabot PRs only update one `package.json` and never run `bun install`, so the `bun.lock` file is out of date and other packages in the monorepo still reference the old version. This skill fixes both problems.

## Steps

1. **Get PR info** — Use `gh pr view <number> --json headRefName,files,title,body` to identify the branch name, which dependency was bumped, and the old/new versions.

2. **Checkout the branch**:

```bash
git fetch origin <branch>
git checkout <branch>
```

3. **Update all monorepo instances** — Dependabot only touches one package. Search for all other `package.json` files that reference the same dependency at the old version and update them too:

```bash
rg '"<dependency>": "[~^]?<old-version>"' --glob '**/package.json'
```

Update every match to the new version. Preserve the prefix style (`^`, `~`, or exact) that each package already uses.

4. **Run `bun install`** from the repo root to regenerate `bun.lock`.

5. **Verify** — Run `git status` to confirm only `bun.lock` and the expected `package.json` files were modified. If other unexpected files changed, investigate before proceeding.

6. **Commit and push**:

```bash
git add -u
git commit -m "Update <dependency> to <version> across all monorepo packages"
git push
```

7. **Switch back** — Return to your previous branch (usually `main`):

```bash
git checkout main
```

## Notes

- Dependabot says "Dependabot will resolve any conflicts with this PR as long as you don't alter it yourself" — but updating the lockfile and sibling packages is the expected workflow and won't cause issues.
- If the version bump is a major version (e.g. vite 5 → 6), consider whether the upgrade is appropriate or if it should be ignored. Check for breaking changes.
- If `bun install` fails, the dependency version may have conflicts with other packages. In that case, close the PR and comment explaining why.
