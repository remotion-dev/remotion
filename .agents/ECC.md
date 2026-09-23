# Imported from ECC

A curated subset of agents and skills from [danielnguyenfinhub/ECC](https://github.com/danielnguyenfinhub/ECC) (a fork of [affaan-m/ECC](https://github.com/affaan-m/ECC)), imported at commit `e947fb33c720e0e1bf4e426e5d799c748622aacc`. MIT-licensed — see `ECC-LICENSE` in this folder.

Files are copied **verbatim** so they can be re-synced from a newer ECC checkout by copying the same file list again. Only static markdown was imported; ECC's installer, hooks, commands, rules and MCP configs were not.

## What's here

**Subagents** — `.agents/agents/*.md`, exposed to Claude Code through the `.claude/agents` symlink (same pattern as `.claude/skills`):

a11y-architect, architect, build-error-resolver, code-architect, code-explorer, code-reviewer, code-simplifier, comment-analyzer, performance-optimizer, planner, pr-test-analyzer, react-build-resolver, react-reviewer, refactor-cleaner, security-reviewer, silent-failure-hunter, type-design-analyzer, typescript-reviewer

**Skills** — internal agent-only skills in `.agents/skills/` (per `skill-locations`, not public `packages/skills`):

accessibility, bun-runtime, codebase-onboarding, error-handling, react-patterns, react-performance, search-first

## Precedence

Remotion's own guidance wins where they conflict: the root `AGENTS.md` (coding style, nullable-not-optional params) and the Remotion-authored skills in `.agents/skills/` (e.g. `writing-tests`, `formatting`, `remotion-best-practices`) override anything in these imported files.

**One local edit:** 11 agents described themselves as "Use PROACTIVELY", "MUST BE USED" or "Automatically activated" (a11y-architect, architect, build-error-resolver, code-reviewer, performance-optimizer, planner, react-build-resolver, react-reviewer, refactor-cleaner, security-reviewer, typescript-reviewer), which makes Claude Code start them on its own. Each run is a whole extra agent that re-reads files, so their `description:` lines were rewritten as "Use when asked…" to make them opt-in, keeping what each one does. Everything else in these files is verbatim. After a re-sync, re-apply this: `grep -liE "PROACTIVELY|MUST BE USED|automatically activated" .agents/agents/*.md` should print nothing.

The "Related" footers in `react-reviewer`, `react-build-resolver` and `typescript-reviewer` mention ECC rules, commands and skills that were deliberately not imported. Those references are dangling by design.

## Deliberately left out

- Agents and skills for other stacks (C++, C#, Dart/Flutter, Django, FastAPI, Go, Java, Kotlin, PHP, Python, Rust, Swift, Vue, and so on) plus domain-specific ones (healthcare, networking, marketing, SEO, trading).
- `doc-updater` and `e2e-runner`: they depend on ECC's `/update-codemaps` and `/update-docs` commands, and on the Vercel `agent-browser` CLI.
- `tdd-guide`, `tdd-workflow` and `react-testing`: their 80%-coverage, unit-first approach contradicts the repo's `writing-tests` skill.
- `remotion-video-creation`: it duplicates, and can go stale against, the official `remotion-*` skills already in `.agents/skills/`.
- `motion-*`: these cover Framer Motion and CSS-transition animation, and Remotion compositions must be frame-driven (`useCurrentFrame()`).
- `security-review`: its name collides with Claude Code's built-in `/security-review`.
- `documentation-lookup`, `deep-research` and `exa-search`: they need MCP servers that aren't configured here.
- `benchmark`: it stores baselines in an ECC-specific `.ecc/` directory.
- `frontend-patterns`: it's mostly about Next.js.
