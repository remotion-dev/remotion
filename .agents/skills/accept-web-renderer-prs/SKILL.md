---
name: accept-web-renderer-prs
description: Review and merge eligible web-renderer pull requests from alec-watts.
---

criteria:

- must be from alec-watts
- must be green
- must not be draft
- must not have pushes from alec-watts within last hour
- must follow [$pr-name](/Users/jonathanburger/.codex/worktrees/6fba/remotion/.agents/skills/pr-name/SKILL.md) - you may update any PRs which are not
- must not have outstanding pullfrog reviews - you may push fixes
- changes to `limitations.mdx` must follow the guidance below - you may push fixes
- you may resolve merge conflicts
- PR looks reasonable, apply independent scrutiny



merge PRs which satisfy criteria

## `limitations.mdx` guidance

In `packages/docs/docs/client-side-rendering/limitations.mdx`, keep recently added text to whether each property is supported and the exceptions for partial support. Preserve relevant support caveats, but omit implementation details and descriptions of testing methodology.

Only simplify recently introduced verbosity. Preserve the intro and longstanding explanations. Use the PR diff and Git history to distinguish recent additions from existing content.
