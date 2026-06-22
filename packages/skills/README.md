# @remotion/skills

Agent Skills for Remotion projects.

Skills are instruction files for AI agents such as Claude Code, Codex and Cursor. They define Remotion-specific best practices, conventions and examples that an agent can load while working in a Remotion project.

## Usage

Install the skills in a Remotion project:

```bash
npx remotion skills add
```

Update installed skills:

```bash
npx remotion skills update
```

New Remotion projects created with `bun create video` are also offered the option to add skills.

## Included skill

The Remotion skill lives in [`skills/remotion/SKILL.md`](./skills/remotion/SKILL.md). It covers composition structure, animation patterns, media handling, effects and other Remotion workflows.

For visual and pixel effects, the skill points agents to [`skills/remotion/rules/effects.md`](./skills/remotion/rules/effects.md), which explains how to use `@remotion/effects` and how to create a reusable custom effect with `createEffect()`.

## Documentation

- [Agent Skills](https://www.remotion.dev/docs/ai/skills)
- [`npx remotion skills`](https://www.remotion.dev/docs/cli/skills)
