---
name: studio-loop
description: Continuously improve Remotion Studio by making a video, reproducing real UX and performance issues, fixing them, and verifying the result. Use for ongoing Studio dogfooding and maintenance, including checkpoints that hand one PR over for review while work continues in a stacked PR.
---

# Studio improvement loop

Own the Studio experience: make it quick, responsive, and reliable. Continue
making a real YouTube video combining NLE editing and motion graphics, using
that workflow to discover and fix problems. Apply
[studio-dev](../studio-dev/SKILL.md) to every implementation change.

## Resume the project and browser

- Recover the existing worktree, branch/PR or stack, local video project, running
  Studio, browser session, and handoff notes. Continue that project instead of
  starting another demo each iteration. Preserve unrelated changes and local QA
  assets; do not commit the video project or exports unless requested.
- Inspect Git state and setup instructions as needed, but **use Studio before
  analyzing its implementation**. Reuse a server only when its worktree and URL
  are known. Otherwise start Studio from `packages/example` with
  `bunx remotion studio --no-open` and use the URL it prints, rather than assuming
  port 3000 belongs to this checkout. Build/install dependencies if needed.
- **Do not ask the user to unlock the Mac.** Use an existing usable browser
  session, or launch a fresh headless Playwright browser for local Studio when
  desktop/browser UI access is unavailable. This workflow does not depend on
  the Mac being unlocked. Keep browser tooling separate from product changes.
- Exercise the real UI through clicks, keyboard input, drag/drop, file upload,
  and screenshots. Use actual registered WebMCP tools for state/readback and
  supported actions, and direct project edits where appropriate. Do not replace
  the UI pass with source inspection or mocked behavior. If browser execution
  fails, diagnose the headless setup and report any remaining verification gap;
  do not treat an automation failure as a Studio bug. If UI verification remains
  blocked, keep affected work in draft and report the gap instead of claiming a
  verified checkpoint. Continue independent work that does not depend on it.

## Work in a loop

1. Continue an actual editing task. Prioritize common workflows: import and
   preview media, arrange/trim/split clips, edit text and transforms, add motion
   graphics and audio, scrub/play, undo/redo, save/reload, then render and review
   the exported video. Vary the next task based on what has already been covered.
2. When an issue appears, capture a reproducible interaction and the expected
   result before inspecting the relevant implementation. Capture a relevant
   performance baseline before changing code. Look for slow feedback,
   missing optimistic paths, flicker, confusing copy/errors, layout mistakes,
   failed codemods, races, and unnecessary work. Check the persisted source and
   visible result rather than assuming a successful request means a correct edit.
3. Fix the observed problem. Internal refactors are allowed, but keep the
   signatures of public APIs with non-experimental documentation stable. Follow
   Studio's existing design, optimistic/history paths, CSS reset, iframe hover
   handling, and mode capabilities. Code-editable actions already provide agentic
   access; do not add redundant WebMCP wrappers. Document any new tools or changed
   tool contracts as required by studio-dev.
4. Repeat the original interaction in the rebuilt UI. Verify immediate feedback,
   persistence/HMR, relevant failure/navigation races, and undo/redo. Cover the
   applicable Studio modes, using a real Browser Studio iframe for changes that
   depend on embedding. Recheck neighboring common actions affected by the fix.
5. Repeat the performance measurement with a comparable project, viewport,
   interaction, and playback state. Verify playback actually started; avoid
   concurrent builds/renders during measurements. Follow
   [studio-perf](../studio-perf/SKILL.md) and use
   [react-scan](../react-scan/SKILL.md) when render/commit work is relevant. Resolve
   regressions, and report measurement limits rather than claiming broad coverage.
6. Run affected existing checks and the verification required by
   [pr](../pr/SKILL.md). Follow [writing-tests](../writing-tests/SKILL.md): do not add
   repository test cases unless explicitly requested. Temporary reproduction and
   profiling scripts may be kept outside the repository.
7. Commit and push verified production changes to the active PR, keeping its title
   and description current. Keep using that PR across iterations until the user
   asks for a checkpoint or a different PR. Return to making the video and repeat;
   a successful fix or a progress report is not a request to stop the loop.

Delegate independent reproduction, review, or bounded implementation work when
useful. Give each implementation owner separate files, and coordinate builds and
browser sessions so they do not invalidate another measurement or edit.

## Checkpoints and review

Treat “checkpoint”, “let me review this PR”, or “stack the next batch” as a request
to hand off a stable review boundary **and continue working**, unless the user
also asks to pause or stop.

1. Finish the current bounded fix and its verification. Do not expand the batch.
   Preserve unfinished or unrelated work for the next layer instead of including
   partial changes in the checkpoint. Stage only the intended production hunks,
   inspect the staged diff, and preserve excluded hunks even within the same file.
   Local QA dirt is not a reason to discard the project or delay the checkpoint.
2. Commit/push the batch, update its PR description with behavior, validation,
   performance results and known limits, and mark the PR ready for review with
   `gh pr ready` if it is a draft. Share the PR link and exact checkpoint commit.
   Report pending/failing CI honestly; do not call it green before checks finish.
3. Freeze that PR's scope for review. Follow [gh-stack](../gh-stack/SKILL.md) to
   adopt an existing branch if needed and create the next layer before making
   further changes. Base the new layer on the checkpoint branch so its PR shows
   only subsequent work. Open a draft PR when the next layer has verified changes,
   and keep that batch in the same PR until the next checkpoint. Without force-push
   authorization, publish with normal `git push`, `gh pr create`/`edit`, and
   `gh stack link` using PR numbers; do not invoke stack commands that force-push.
4. Continue the same video and improvement loop on the new layer while the user
   reviews the checkpoint. Do not keep appending unrelated progress to the PR
   under review. If review feedback changes a lower layer, apply it to its owning
   branch and update dependent layers using the stack workflow, preserving
   published history unless rewriting it was explicitly authorized.
5. When the user merges a parent, verify its actual GitHub state and continue in
   the existing child PR. Preserve worktree changes before changing its base.
   `gh stack sync` rebases and pushes, and stack push/submit may force-push; do not
   use them to rewrite a published child without explicit authorization. The
   history-preserving path is to fetch and merge the updated trunk into the child,
   push normally, retarget its PR, and unstack/rebuild tracking for the remaining
   layers as needed. Check the resulting base and diff contain only remaining
   work, including after a squash merge. Do not merge PRs or force-push without
   explicit authorization.

A status question alone does not request a checkpoint. Answer it briefly and
continue. A pause/stop request ends the active loop; record where to resume. Do not
create a scheduled or background automation unless the user requests one.

## Keep continuity

Maintain a small local handoff outside the PR with the project and asset paths,
worktree/branch/stack and PR links, checkpoint heads, server URL and launch command,
browser connection details, reproduction steps, baseline/after evidence, tests,
exports, known limits, and next useful editing task. Keep credentials and complete
render request/environment payloads out of logs and handoffs. Resume from this
record after context changes instead of rediscovering or repeating completed work.
