## Monorepo setup

There are multiple folders in the `packages` folder, which correspond to the packages in the monorepo.

The **package name** for each folder is `@remotion/[folder-name]`, except for the `core` package, which has the package name `remotion`.

## Build instructions

- Use `pnpm i` to install dependencies, not npm.
- You need to install `bun` to run the project.
- To build the project, run `bunx turbo make --filter="[package-name]"` and only include the package you are working on. Refer to package naming convention above.

## Documentation

Any new features or settings should be documented in the `pacakges/docs` folder.

- Add new pages to the sidebar: `packages/docs/sidebars.js`.
- Generate og:images for the new pages: `cd package/docs && bun render-cards.mjs`.
- Usually, there is a TableOfContents.tsx file in the folder of the documentaiton for the package. Add it there as well if there is a table of contents.

## Committing

- Use the commit message format "`[package-name]: [commit-message]`".
