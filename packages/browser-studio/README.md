# @remotion/browser-studio

Run Remotion Studio in the browser

## Usage

This is an internal package and has no documentation.

## Dependency resolution

By default, Browser Studio resolves published package versions through `esm.sh`.
Repository development and E2E tests set `workspacePackageBaseUrl` and serve
every `remotion` and `@remotion/*` export from the current checkout's build
artifacts instead. Third-party packages intentionally continue to use the
external resolver.
