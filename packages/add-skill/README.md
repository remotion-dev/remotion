# @remotion/add-skill

This is a fork of [vercel-labs/add-skill](https://github.com/vercel-labs/add-skill) with CodeBuddy support added.

## Differences from upstream

This package includes CodeBuddy as a supported agent, allowing skills to be installed to `.codebuddy/skills/` directories.

## Usage

This package is used internally by Remotion's `create-video` command when installing skills. It can also be used directly:

```bash
npx @remotion/add-skill remotion-dev/skills
```

## Supported Agents

All agents from the upstream package are supported, plus:
- **CodeBuddy** - Skills are installed to `.codebuddy/skills/`

## License

MIT
