---
name: find-unplanned-issues
description: 'Audit and clean the Remotion GitHub masterplan hierarchy. Use when finding open issues that lack a masterplan ancestor, identifying orphaned issues that need a parent, or recursively removing closed issues from the masterplan rooted at issue #9081.'
---

# Find unplanned issues

Run the bundled read-only audit from the repository root:

```sh
bun .agents/skills/find-unplanned-issues/scripts/find-unplanned-issues.ts
```

The script treats an issue as planned when its title contains `masterplan` or any
issue in its parent chain has a title containing `masterplan`. Masterplan issues
themselves are omitted from the report. Repository-specific exceptions are also
omitted; currently, issue #8375 is exempt because the long-running CI flake
tracker intentionally stands on its own. Results distinguish between:

- `no parent`: the open issue has no parent at all.
- `no masterplan ancestor`: the issue has a parent, but following the complete
  parent chain does not reach a masterplan.

Use a different repository or machine-readable output when needed:

```sh
bun .agents/skills/find-unplanned-issues/scripts/find-unplanned-issues.ts --repo owner/repo
bun .agents/skills/find-unplanned-issues/scripts/find-unplanned-issues.ts --json
```

Pass `--check` for automation. It exits with status 1 when unplanned issues are
found and 0 when every non-exempt open issue belongs to a masterplan.

The audit requires an authenticated `gh` CLI that supports the `parent` JSON
field. It only reads issue data. To fix findings, use the `issue-management`
skill and verify each relationship after editing it.

## Remove closed issues from the masterplan

Preview all closed descendants of the root masterplan recursively:

```sh
bun .agents/skills/find-unplanned-issues/scripts/prune-closed-masterplan-issues.ts
```

The default root is <https://github.com/remotion-dev/remotion/issues/9081>.
Override it only when intentionally auditing a different hierarchy:

```sh
bun .agents/skills/find-unplanned-issues/scripts/prune-closed-masterplan-issues.ts \
  --root https://github.com/owner/repo/issues/123
```

The command is a dry run unless `--apply` is passed. During application, process
closed issues deepest-first and verify every relationship after changing it. If
a closed issue has open children, move those children to its parent before
removing the closed issue so open work stays in the masterplan.

```sh
bun .agents/skills/find-unplanned-issues/scripts/prune-closed-masterplan-issues.ts --apply
```

Use `--json` for a machine-readable dry-run report. Never pass `--apply` merely
to test the script; it changes live GitHub issue relationships.
