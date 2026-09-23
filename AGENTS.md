## Setup commands

```bash
# Install dependencies (uses Bun)
bun install

# Build all packages
bunx turbo run make

# Run tests and linting
bunx turbo run lint test

# Clean build artifacts
bun run clean

# Build a specific package
bunx turbo run make --filter='<package-name>'
```

Use `bunx` (not `npx`) to run package binaries.

The current Remotion version can be found in `packages/core/src/version.ts`. The next version should increment the patch version by 1.

## Coding style

- Keep things in one function unless they are composable or reusable.
- Do not extract single-use helpers preemptively. Inline the logic at the call site unless the helper is reused, hides a genuinely complex boundary, or has a clear independent name that improves the caller.

## Internal API optionality

When adding or reviewing TypeScript parameters, React props, or type/interface members, make new internal inputs preferrably nullable (`T | null`), not optional (`?:`). Public exported APIs are exempt when requiring the input would be breaking.

## Key services

- **Remotion Studio** (dev testbed): `cd packages/example && bun run dev` — starts at `http://localhost:3000`. This is the main dev UI for previewing video compositions.
- **Player testbed**: `cd packages/player-example && bun run dev` — for testing `@remotion/player` changes.
- **Docs site**: `cd packages/docs && bun run start` — Docusaurus dev server.

## Rendering test videos

From `packages/example`:

- `bunx remotion compositions` — list available compositions.
- `bunx remotion render <comp-id> --output ../../out/video.mp4` — render a video.
- `bunx remotion still <comp-id> --output ../../out/still.png` — render a still image.

## Imported agents and skills

`.agents/agents/` (exposed via the `.claude/agents` symlink) and 7 skills in `.agents/skills/` are imported from ECC — see `.agents/ECC.md` for the list, what was left out, and how to re-sync. The agents run only when asked. The `ponytail-review`, `ponytail-audit` and `ponytail-debt` skills and the "Work lean" rules below come from ponytail — see `.agents/PONYTAIL.md`. This file and the Remotion-authored skills take precedence over all of them where they conflict.

## Work lean

Read the task and the code it touches first. Then, before writing code, stop at the first rung that holds:

1. Does it need to exist? Skip speculative features and say so in one line.
2. Is it already in this repo? Reuse the helper, util or pattern.
3. Does the standard library or the platform do it?
4. Does an installed dependency do it? No new dependency for what a few lines can do.
5. Only then, write the minimum code that works.

- Fix a bug at its root: grep every caller of the function you touch and fix the shared function once.
- Shortest correct diff, fewest files, deletion over addition. No abstraction, config or boilerplate nobody asked for.
- Never cut input validation at trust boundaries, error handling that prevents data loss, security, accessibility, or anything explicitly requested. Non-trivial logic still gets a test (see the `writing-tests` skill).
- Mark a deliberate shortcut with `// ponytail: <limit>, <when to upgrade>`; `/ponytail-debt` lists them.
- Report in a few lines: what changed and what was skipped. Explain at length only when asked.

Token habits in this monorepo:

- Build and test only the package you changed (`--filter`), not the whole turbo graph.
- Search with grep/glob before opening files, and read only the lines you need.
- Pipe long command output through `tail` or `grep`.
- Use subagents for broad searches only. Each starts from nothing (a one-question Explore run here used about 48,000 tokens) and an Explore subagent here did not see this file, so put the rules that matter into its prompt.
