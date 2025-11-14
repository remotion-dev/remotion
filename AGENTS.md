## Setup commands

```bash
# Install dependencies (uses Bun)
bun install

# Build all packages
turbo run make

# Run tests and linting
turbo run lint test

# Clean build artifacts
bun run clean

# Build a specific package
turbo run make --filter='<package-name>'
```

The current Remotion version can be found in `packages/core/src/version.ts`. The next version should increment the patch version by 1.

Pull request titles should be in the format `\`[package-name]\``: [commit-message]`. For example, "`@remotion/player`: Add new feature.

## Contributing

Read the full [contribution guide](/packages/docs/docs/contributing/index.mdx).

- [General information](/packages/docs/docs/contributing/index.mdx)
- [Implementing a new feature](/packages/docs/docs/contributing/feature.mdx)
- [Implementing a new option](/packages/docs/docs/contributing/option.mdx)
