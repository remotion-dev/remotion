---
name: triaging-external-prs
description: Triage pull requests from contributors without write access to remotion-dev/remotion. Decides whether to review, merge, convert to an issue, or close. Use when asked whether an outside PR is worth merging, is speculative, or comes from high-volume automated contribution.
---

# Triaging external PRs

Judge the change, not the person. Account signals only decide how much evidence to require.

Copy this checklist and work through it:

```
- [ ] 1. Problem is real
- [ ] 2. Fix is at the root cause
- [ ] 3. Tests cover user-visible behavior
- [ ] 4. Size and behavior change are proportionate
- [ ] 5. No duplicate
- [ ] 6. Account context
- [ ] 7. Decide
```

## 1. Problem is real

- Linked issue filed by someone else, or a reproduction that a real composition, render, or Studio session can hit.
- Self-filed issue opened minutes before the PR, or no issue: treat as unconfirmed.
- Speculative: guards against inputs that only the user's own code or Remotion's own tooling produces, such as `1e999` coordinates, malformed compositor frames, or arguments to maintainer-run scripts.

## 2. Root cause

Read `.agents/skills/fix-root-cause/SKILL.md` and apply it to the diff. Ask whether the state the PR handles is legitimate. A clamp, guard, or try/catch where the symptom surfaced is not a fix unless that state can legitimately occur there.

## 3. Tests

Read `.agents/skills/writing-tests/SKILL.md` and check the added tests:

- Would the test fail if the feature entry point stopped calling the changed code?
- Does it assert an outcome a user sees (frame, path, source, CLI output), or a private helper?
- A test that re-implements the old code and compares against it proves equivalence, not behavior.

## 4. Proportionality

- Diff size matches the problem. A large heuristic layer for a narrow bug is a reason to fix it ourselves.
- Check whether existing output changes for inputs that worked before. For visual changes, render before and after with the same props and show both to the user.

## 5. Duplicates

Search open PRs for the same issue number and check overlap with maintainer PRs.

## 6. Account context

Check the author's recent PRs across GitHub with timestamps, for example `gh search prs --author <login> --sort created --limit 50 --json repository,createdAt,state`.

High-volume automated contribution looks like PRs to many unrelated repositories within hours, PRs opening at the same minute past each hour, and self-filed issues. This raises the bar for evidence. It never closes a good PR on its own.

## 7. Decide

Report the findings and the recommended action to the user. Take an action that touches GitHub (closing, labeling, commenting, filing an issue) only after the user confirms it.

| Situation                              | Recommended action                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Real issue, root-cause fix, good tests | Review normally                                                                                   |
| Speculative                            | Close, add `wontfix`, no comment on the PR                                                        |
| Unrequested but valuable idea          | File an issue describing the problem, then close the PR with `wontfix`                            |
| Plausible bug, unconfirmed             | Close the PR with `wontfix`, ask on the issue for a screenshot or composition from a real project |
| Duplicate                              | Keep the better one, close the other with "Closing in favor of #N"                                |
| Trusted repeat contributor             | Suggest adding them to the pull request limit bypass list                                         |
