## Monorepo setup

There are multiple folders in the `packages` folder, which correspond to the packages in the monorepo.

The **package name** for each folder is `@remotion/[folder-name]`, except for the `core` package, which has the package name `remotion`, and for `create-video`, which has the package name `create-video`.

## Build instructions

- `pnpm` is the package manager for the project.
- To build the project after you made changes, run `bunx turbo make --filter="[package-name]"` and only include the package you are working on. Refer to package naming convention above. For example, the command to build the package in `packages/shapes` is `bunx turbo make --filter="@remotion/shapes"`.
- After making code changes, run `bunx prettier src --write` to format the code.

## Documentation

Any new features or settings should be documented in the `packages/docs` folder.

- Add new pages to the sidebar: `packages/docs/sidebars.js`.
- When creating a new page or duplicating an existing page, don't add the `image:` tag to the frontmatter at first. Instead, run `cd package/docs && bun render-cards.mjs` afterwards to generate and automatically add the `image:` tag. Commit the created image and the changed frontmatter.
- Usually, there is a TableOfContents.tsx file in the folder of the documentaiton for the package. Add it there as well if there is a table of contents.

## Commit messages

- Use the commit message format "`[package-name]: [commit-message]`". Use the package name from the package naming convention above, for example "`@remotion/shapes: Add heart shape`".
