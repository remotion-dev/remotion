# Add a new Remotion package

## Steps

1. **Create `packages/<name>/`** with these files:
   - `package.json` — copy from `@remotion/light-leaks` as template; update name, description, homepage, dependencies
   - `tsconfig.json` — extends `../tsconfig.settings.json`, uses tsgo with `emitDeclarationOnly: true`, `outDir: "dist"`, `module: "es2020"`, `moduleResolution: "bundler"`, `target: "ES2022"`
   - `src/index.ts` — exports
   - `bundle.ts` — Bun build script, externalize `react`, `remotion`, `remotion/no-react`, `react/jsx-runtime`, `react/jsx-dev-runtime`, `react-dom`
   - `eslint.config.mjs` — use `remotionFlatConfig({react: true})` if React, `{react: false}` otherwise
   - `.npmignore` — copy from `@remotion/light-leaks`
   - `README.md` — package name, description, install command, link to docs

2. **Register in monorepo:**
   - `tsconfig.json` (root) — add `{"path": "./packages/<name>"}` to references
   - `packages/cli/src/list-of-remotion-packages.ts` — add `'@remotion/<name>'`
   - `packages/create-video/src/list-of-remotion-packages.ts` — add `'@remotion/<name>'`
   - `packages/studio-shared/src/package-info.ts` — add to `packages`, `descriptions`, `installableMap`, `apiDocs`

3. **Documentation (`packages/docs/docs/<name>/`):**
   - Add `"@remotion/<name>": "workspace:*"` to `packages/docs/package.json` dependencies (needed for twoslash snippets)
   - `index.mdx` — install tabs, table of contents, license
   - `table-of-contents.tsx` — TOCItem grid linking to component/function pages
   - Individual component/function `.mdx` pages
   - Edit `packages/docs/sidebars.ts` — add category
   - Edit `packages/docs/components/TableOfContents/api.tsx` — import table of contents and add section

See the `writing-docs` skill for details on writing documentation.

4. **Example usage:**
   - Add `"@remotion/<name>": "workspace:*"` to `packages/example/package.json`
   - Create `packages/example/src/<Name>/index.tsx`
   - Register `<Composition>` in `packages/example/src/Root.tsx`
   - Add `{"path": "../<name>"}` to `packages/example/tsconfig.json` references

5. **Run `bun i`** to install dependencies

6. **Build:** `cd packages/<name> && bun run make`

## Version

Use the current version from `packages/core/src/version.ts`.  
For the documentation version, increment the patch version by 1 as it will only be released with the next Remotion release.

## Patterns

- Use `"workspace:*"` for internal dependencies
- Use `"catalog:"` for shared external dependency versions
- The `make` script is: `tsgo && bun --env-file=../.env.bundle bundle.ts`
- Add `"type": "module"` to `package.json`
- Add `"@typescript/native-preview": "catalog:"` to devDependencies
- Types/main point to `dist/index.d.ts` and `dist/index.js` (not `dist/cjs/`)
- Packages with React components need `peerDependencies` for `react` and `react-dom`
