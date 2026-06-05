---
name: issue
description: Create or update GitHub issues with correct Remotion naming and safe multiline Markdown handling
---

Use this skill when creating, editing, or commenting on GitHub issues. For parent issues, sub-issues, blocked-by, and blocking relationships, use the [`issue-management`](../issue-management/SKILL.md) skill.

## Issue title format

Use concise, action-oriented titles.

If the issue primarily affects a package, prefix the title with the package name:

```text
`@remotion/package`: Change description
```

Examples:

```text
`@remotion/player`: Support keyboard shortcuts for fullscreen
`@remotion/lambda`: Improve retry message for failed renders
`@remotion/docs`: Add examples contribution guide
```

If the issue affects the website/docs broadly, use:

```text
Docs: Change description
```

If the issue affects the Studio broadly, use:

```text
Studio: Change description
```

If the issue affects the monorepo or infrastructure broadly, use:

```text
Build: Change description
CI: Change description
Repo: Change description
```

Avoid vague titles such as:

```text
Bug
Fix issue
Examples follow-up
```

Prefer:

```text
Docs: Add a skill for creating examples
```

## Never pass multiline Markdown inline

Do not pass issue bodies, PR bodies, or long comments inline through shell arguments.

Avoid:

```bash
gh issue create --title "Docs: Add examples skill" --body "Line one\n\nLine two"
```

This can accidentally send literal `\n` characters to GitHub instead of real newlines.

Instead, always write Markdown to a temporary file and pass it with `--body-file`.

## Creating an issue

1. Write the issue body to a temp Markdown file:

```bash
cat > /tmp/remotion-issue-body.md <<'EOF'
Summary of the issue.

## Tasks

- [ ] First task
- [ ] Second task

## Context

Related to #1234.
EOF
```

2. Create the issue using `--body-file`:

```bash
gh issue create \
  --title 'Docs: Add a skill for creating examples' \
  --body-file /tmp/remotion-issue-body.md
```

Prefer using the `write` tool to create the temp Markdown file instead of shell heredocs when operating as an agent.

## Editing an issue body

1. Write the full replacement body to a temp Markdown file.
2. Edit the issue using `--body-file`:

```bash
gh issue edit 1234 --body-file /tmp/remotion-issue-body.md
```

After editing, verify that the body renders as intended:

```bash
gh issue view 1234 --json body --jq .body
```

Make sure the output contains real blank lines, not literal `\n` escape sequences.

## Adding an issue comment

For multiline comments, also use a file:

```bash
gh issue comment 1234 --body-file /tmp/remotion-issue-comment.md
```

## Creating or linking related issues

For parent issues, sub-issues, blocked-by, and blocking relationships, use the [`issue-management`](../issue-management/SKILL.md) skill. Prefer the new `gh issue create` and `gh issue edit` relationship flags over hand-written GraphQL mutations.

## Updating a PR or issue after linking a related issue

If a PR or issue mentions follow-up work that is now tracked by a related issue, replace vague checklist items with the concrete issue number.

Prefer:

```md
The Remotion skill for creating examples is tracked separately in sub-issue #8158, not in this PR.
```

Avoid:

```md
- [ ] Add a Remotion skill for creating an example
```

if that work is not part of the current PR.

## Final verification checklist

After creating or editing an issue:

- [ ] View the issue body with `gh issue view <number> --json body --jq .body`
- [ ] Confirm Markdown has real newlines
- [ ] Confirm the title follows the package/docs/studio naming convention
- [ ] Confirm issue references such as `#1234` are correct
- [ ] If adding issue relationships, follow the `issue-management` skill and confirm the intended links
