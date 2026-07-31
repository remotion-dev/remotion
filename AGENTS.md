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

## Key services

- **Remotion Studio** (dev testbed): `cd packages/example && bun run dev` — starts at `http://localhost:3000`. This is the main dev UI for previewing video compositions.
- **Player testbed**: `cd packages/player-example && bun run dev` — for testing `@remotion/player` changes.
- **Docs site**: `cd packages/docs && bun run start` — Docusaurus dev server.

## Rendering test videos

From `packages/example`:

- `bunx remotion compositions` — list available compositions.
- `bunx remotion render <comp-id> --output ../../out/video.mp4` — render a video.
- `bunx remotion still <comp-id> --output ../../out/still.png` — render a still image.
