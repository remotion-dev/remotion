---
name: issue-management
description: "Manage GitHub Issues 2.0 relationships with gh CLI: parent issues, sub-issues, blocked-by, and blocking links."
---

Use this skill when creating, editing, inspecting, or removing relationships between GitHub issues.

These commands use the Issues 2.0 `gh issue` support added in GitHub CLI PR [cli/cli#13057](https://github.com/cli/cli/pull/13057). Because this feature is new, first confirm the installed `gh` supports it:

```bash
gh issue create --help | grep -E -- '--parent|--blocked-by|--blocking'
gh issue edit --help | grep -E -- '--parent|--add-sub-issue|--add-blocked-by|--add-blocking'
```

If those flags are missing, update `gh` before trying to manage issue relationships. Do not invent older commands.

## Issue reference format

Relationship flags accept issue numbers or issue URLs.

Use a number for an issue in the current repository:

```bash
gh issue edit 123 --parent 100
```

Use a full issue URL for a cross-repository relationship:

```bash
gh issue edit 123 --blocked-by https://github.com/remotion-dev/remotion/issues/456
```

Multiple related issues can be passed as a comma-separated list:

```bash
gh issue edit 123 --add-blocked-by 200,201
```

## Parent and sub-issue relationships

A sub-issue has exactly one parent issue.

To create a new issue directly under a parent:

```bash
gh issue create \
  --title 'Docs: Add issue management skill' \
  --body-file /tmp/remotion-issue-body.md \
  --parent 100
```

To set or change the parent of an existing child issue:

```bash
gh issue edit <child-number> --parent <parent-number-or-url>
```

To remove the parent from a child issue:

```bash
gh issue edit <child-number> --remove-parent
```

To manage children from the parent issue:

```bash
gh issue edit <parent-number> --add-sub-issue <child-number-or-url>
gh issue edit <parent-number> --remove-sub-issue <child-number-or-url>
```

`--add-sub-issue` moves the child to the new parent if it already has another parent. Do not use `--add-sub-issue` while editing multiple parent issues in one command; one child cannot be added ambiguously to several parents.

## Blocked-by and blocking relationships

Use `blocked-by` when the issue being edited is waiting on another issue.

```bash
# Issue 123 is blocked by issue 200.
gh issue edit 123 --add-blocked-by 200

# Remove that relationship.
gh issue edit 123 --remove-blocked-by 200
```

Use `blocking` when the issue being edited blocks another issue.

```bash
# Issue 123 is blocking issues 300 and 301.
gh issue edit 123 --add-blocking 300,301

# Remove one blocking relationship.
gh issue edit 123 --remove-blocking 300
```

Equivalent mental model:

```bash
gh issue edit A --add-blocking B
```

means the same relationship as:

```bash
gh issue edit B --add-blocked-by A
```

Choose the command based on which issue you are already editing.

When creating an issue, set relationships immediately:

```bash
gh issue create \
  --title 'Studio: Add timeline validation' \
  --body-file /tmp/remotion-issue-body.md \
  --blocked-by 200,201 \
  --blocking 300
```

## Inspecting relationships

Human-readable view shows parent, sub-issues, blocked-by, and blocking metadata when present:

```bash
gh issue view <number>
```

Raw non-TTY output includes stable relationship lines:

```bash
gh issue view <number> | grep -E '^(parent|sub-issues|sub-issues-completed|blocked-by|blocking):'
```

For scripts, request the JSON fields explicitly:

```bash
gh issue view <number> \
  --json parent,subIssues,subIssuesSummary,blockedBy,blocking
```

`subIssues`, `blockedBy`, and `blocking` are connection objects with `nodes` and `totalCount`. `subIssuesSummary` contains completion counts.

## Safe workflow

1. Create any new issue bodies with `--body-file`, not inline multiline shell strings.
2. Link the relationship using the appropriate `gh issue create` or `gh issue edit` flag.
3. Verify with `gh issue view <number>` or `gh issue view <number> --json parent,subIssues,subIssuesSummary,blockedBy,blocking`.
4. If editing a PR or parent issue body afterward, replace vague checklist text with concrete issue numbers.
