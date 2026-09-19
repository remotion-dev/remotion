---
name: issue
description: Create, edit, or comment on Remotion GitHub issues.
---

## Titles

Write a concise title that preserves the user's framing. An issue may describe a problem or give a directive; do not turn a problem into a prescribed solution unless the user supplied or explicitly requested one.

Prefix package-specific issues with the package name:

```text
`@remotion/package`: Issue description
```

For broader areas, use the corresponding prefix:

```text
Docs: Issue description
Studio: Issue description
Build: Issue description
CI: Issue description
Repo: Issue description
```

Avoid vague titles such as `Bug`, `Fix issue`, or `Examples follow-up`.

## Markdown bodies and comments

Never pass multiline Markdown inline through shell arguments. Write issue bodies and multiline comments to a temporary Markdown file, preferably with the `write` tool, and pass it with `--body-file`.

After creating or editing an issue, verify its title and body:

```bash
gh issue view <number> --json title,body
```

Confirm that the content is correct and multiline Markdown contains real newlines rather than literal `\n` sequences.

## Relationships

For parent issues, sub-issues, blocked-by, and blocking relationships, use the [`issue-management`](../issue-management/SKILL.md) skill.
