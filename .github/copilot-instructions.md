## Build instructions

- Use `pnpm i` to install dependencies, not npm.
- You need to install `bun` to run the project.
- To build the project, run `bunx turbo make --filter="[package]"` and only include the package you are working on. The package name is `@remotion/[folder-name]`, except for the `core` package, which has the package name `remotion`.

## Documentation

Any new features or settings should be documented in the `pacakges/docs` folder.

- Add new pages to the sidebar: `packages/docs/sidebars.js`.
- Generate og:images for the new pages: `cd package/docs && bun render-cards.mjs`.
