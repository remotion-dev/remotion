# AGENTS.md

## Project overview

Remotion is a framework for creating videos programmatically using React. This is a Turborepo monorepo with 90+ packages including core libraries, renderers, cloud services, and templates.

**Key packages:**

- `remotion` (core): Main library for creating videos
- `@remotion/cli`: Command-line interface
- `@remotion/player`: Video player component
- `@remotion/studio`: Visual editing interface
- `@remotion/renderer`: Server-side rendering
- `@remotion/lambda`: AWS Lambda rendering

Other packages are located in the `packages/` directory.

## Setup commands

```bash
# Install dependencies (uses Bun)
bun install

# Build all packages
turbo run make

# Watch mode (builds on file changes)
turbo watch make --concurrency=2

# Run tests and linting
turbo run lint test

# Clean build artifacts
bun run clean
```

## Monorepo navigation

- Use `turbo run make --filter='<package-name>'` to build a specific package
- Use `turbo watch make --filter='<package-name>'` to watch a specific package
- Package names are in each `package.json` `name` field (e.g., `@remotion/player`, `remotion`)
- Check `packages/` directory structure; packages are in `packages/<package-name>/`

## Testing instructions

- Run full test suite: `bun test`
- Lint and format: `bun stylecheck`
- Run tests for specific package: `turbo run test --filter='<package-name>'`
- CI runs: `turbo run make test --concurrency=1`
- SSR tests: `bun testssr`
- Lambda tests: `bun testlambda`
- WebCodecs tests: `bun testwebcodecs`

All tests must pass before merging.

## Code style guidelines

- Prefer early returns in condition checks where possible
- When working with file sizes or times, clearly reflect units in variables:
  - Good: `lastProgressMs`, `fetchedBytes`, `downloadedMb`
  - Bad: `lastProgress`, `fetched`, `downloaded`
- Do not leave useless comments
- Use functional patterns where possible

## Contributing

Read the full [contribution guide](/packages/docs/docs/contributing/index.mdx).

- [General information](/packages/docs/docs//contributing/index.mdx)
- [Implementing a new feature](/packages/docs/docs/contributing/feature.mdx)
- [Implementing a new option](/packages/docs/docs/contributing/option.mdx)

Watch the contributing video tutorial: https://www.youtube.com/watch?v=tgBfJw2tET8
