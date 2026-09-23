# Imported from ponytail

The rules and three skills from [danielnguyenfinhub/ponytail](https://github.com/danielnguyenfinhub/ponytail) (a fork of [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail), v4.9.0), imported at commit `fa391221f5b587043da44c60630a42d2e3af5d2a`. MIT-licensed — see `PONYTAIL-LICENSE` in this folder.

Ponytail is "lazy senior dev mode": build only what is needed, reuse what exists, and write the shortest correct change. Here it is used to cut the tokens spent generating videos and developing this repo.

## What's here

**Rules** — condensed into the files every session already reads, instead of ponytail's own `ponytail` skill and hooks:

- the root `AGENTS.md`, "Work lean": the ladder, the rules and token habits for this monorepo;
- `my-video/AGENTS.md`, "Work lean: fewer tokens per video": the same ladder for videos (existing scene, Element, `@remotion/*` package, then new code) and cheap ways to check the result;
- `my-video/chat-skill/SKILL.md`, "Keep it lean": the short version for claude.ai.

**Skills** — copied verbatim into `.agents/skills/`, so they can be re-synced by copying the same files again. They run only when asked:

- `ponytail-review`: review a diff for over-engineering only, one line per finding.
- `ponytail-audit`: the same review across the whole repo, ranked by what to cut.
- `ponytail-debt`: list every `ponytail:` shortcut comment with its limit and upgrade trigger.

## Precedence

Remotion's own guidance wins where they conflict: the root `AGENTS.md` coding rules and the Remotion-authored skills in `.agents/skills/` (e.g. `writing-tests`, which asks for integration tests rather than ponytail's single assert-based check).

## Deliberately left out

- **The `ponytail` skill.** Its description says to use it on any coding task, so it would load about 1,400 tokens into every code change, on top of rules the `AGENTS.md` files already carry. Its lite/full/ultra levels are left out with it.
- **The hooks** (`SessionStart`, `SubagentStart`, `UserPromptSubmit`). They inject the whole skill into every session and every subagent, and track the level in flag files. The `AGENTS.md` files do the first for nothing extra. Subagents are not covered: an Explore subagent tested here did not see `AGENTS.md`, so put the rules that matter into a subagent's prompt.
- **`ponytail-help` and `ponytail-gain`.** One documents the plugin's modes, environment variables and updates; the other prints the project's published benchmark figures. Neither applies to a copied skill.
- The plugin manifests and rule copies for other hosts (Cursor, Codex, Gemini, OpenCode, Windsurf and others), the MCP server, benchmarks, examples and tests.
