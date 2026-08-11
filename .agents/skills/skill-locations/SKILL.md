---
name: skill-locations
description: Document Remotion skill placement. Use when adding, moving, or editing Remotion skills to decide whether a skill belongs in .agents/skills as an internal skill or packages/skills as a public skill.
---

# Remotion Skill Locations

Place internal agent-only skills in `.agents/skills/<skill-name>/SKILL.md`.

Place public, redistributable skills in `packages/skills/skills/<skill-name>/SKILL.md`.
Expose every public skill to agents with a symlink at `.agents/skills/<skill-name>`.
Run `bun run syncskills` after adding a public skill; CI verifies the symlinks with
`bun run checkskills`.

When in doubt, ask whether the skill is internal or public before moving it between these roots.
