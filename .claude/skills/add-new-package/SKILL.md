# Add a new Remotion package

## Steps

1. **Create `packages/<name>/`** with these files:
   - `package.json` — copy from `@remotion/motion-blur` as template; update name, description, homepage, dependencies
   - `tsconfig.json` — extends `../tsconfig.settings.json`, rootDir `src`, outDir `dist/cjs`, reference `../core`
   - `src/index.ts` — exports
   - `bundle.ts` — Bun build script, externalize `react`, `remotion`, `remotion/no-react`, `react/jsx-runtime`
   - `eslint.config.mjs` — use `remotionFlatConfig({react: true})` if React, `{react: false}` otherwise
   - `.npmignore` — copy from `@remotion/noise`
   - `README.md` — package name, description, install command, link to docs

2. **Register in monorepo:**
   - `tsconfig.json` (root) — add `{"path": "./packages/<name>"}` to references
   - `packages/cli/src/list-of-remotion-packages.ts` — add `'@remotion/<name>'`
   - `packages/create-video/src/list-of-remotion-packages.ts` — add `'@remotion/<name>'`
   - `packages/studio-shared/src/package-info.ts` — add to `packages`, `descriptions`, `installableMap`, `apiDocs`

3. **Documentation (`packages/docs/docs/<name>/`):**
   - `index.mdx` — install tabs, table of contents, license
   - `table-of-contents.tsx` — TOCItem grid linking to component/function pages
   - Individual component/function `.mdx` pages
   - Edit `packages/docs/sidebars.ts` — add category
   - Edit `packages/docs/src/data/articles.ts` — add entries alphabetically

4. **Example usage:**
   - Add `"@remotion/<name>": "workspace:*"` to `packages/example/package.json`
   - Create `packages/example/src/<Name>/index.tsx`
   - Register `<Composition>` in `packages/example/src/Root.tsx`

5. **Run `bun i`** to install dependencies

6. **Build:** `cd packages/<name> && bun run make`

## Version

Use the current version from `packages/core/src/version.ts`.

## Patterns

- Use `"workspace:*"` for internal dependencies
- Use `"catalog:"` for shared external dependency versions
- The `make` script is: `tsc -d && bun --env-file=../.env.bundle bundle.ts`
- Packages with React components need `peerDependencies` for `react` and `react-dom`
