---
name: studio-config-option-lifecycle
description: Classify and wire Remotion Studio config options as either startup-fixed or reloadable while preventing mixed lifecycle behavior across consumers. Use when adding, changing, or reviewing a Config setter or CLI option consumed by Studio, its preview server, compiler, HTML bootstrap, public-folder watcher, or render queue.
---

# Studio Config Option Lifecycle

Make reload behavior explicit for every Studio-facing option. A config file is reset and re-executed when it changes, but a consumer only observes the new value if its code reads the option again.

## Classify the whole option

Inspect every Studio consumer, then assign one lifecycle to the whole option:

- **Startup-fixed:** Changing the value requires recreating a server, compiler, watcher, directory mapping, or other initialized resource.
- **Reloadable:** Every Studio consumer can safely use the new value after the browser reload or at another deliberate request boundary.

If any consumer must be startup-fixed, make the option startup-fixed for all Studio consumers. Do not implement mixed lifecycle behavior.

Do not infer reloadability from `Config.set*()` state being updated. Config re-execution updates module state regardless of whether an already-created consumer observes it.

## Wire startup-fixed values

Resolve the option once in `packages/cli/src/studio.ts` before calling `startStudio()`:

```ts
const fixedValue = option.getValue({commandLine: parsedCli}).value;

await StudioServerInternals.startStudio({
	fixedValue,
});
```

Pass the value, not a getter, through `startStudio()`, `startServer()`, and the consumer. Keep new internal parameters required; use `T | null` when absence is valid.

Capture startup-fixed render settings in `StudioRenderJobFixedConfig` at the Studio queue boundary and thread that object into the job processor. Do not call `option.getValue()` from the processor, because config state may have changed since Studio startup.

Typical startup-fixed consumers include the Studio port, entry point, active compiler choice and override, polling mode, public directory and watcher, network binding, and cross-site-isolation headers.

## Wire reloadable values

Read reloadable options through a getter that retains CLI precedence:

```ts
const getValue = () =>
	option.getValue({commandLine: parsedCli}).value;

await StudioServerInternals.startStudio({
	getValue,
});
```

Pass the getter as a required internal callback and invoke it only at the boundary that should observe config changes, such as generating Studio HTML after the `config-file-changed` browser reload. Do not evaluate the getter earlier and pass its result onward.

Use the existing `getStudioRuntimeConfig()` path for values already represented by `StudioRuntimeConfig`. Be careful when extending that exported type: adding a required property can be a public API break. For independent HTML bootstrap values, pass a dedicated getter through the internal Studio server layers.

Only use this pattern when all Studio consumers are reloadable. Typical examples include UI behavior and HTML bootstrap defaults that do not require rebuilding initialized resources.

## Resolve lifecycle conflicts

Search all reads of the option and decide each one independently:

```sh
rg -n "myOption|setMyOption|my-cli-flag" packages
```

If the consumers do not all support reloading, capture the option once at Studio startup and pass that same value to every consumer. For example, if the active preview compiler cannot change bundlers, future render jobs must retain the startup bundler choice as well.

Treat aliases as one option. If a deprecated setter updates multiple underlying values, make every affected Studio consumer follow the stricter startup-fixed lifecycle.

## Reset and rollback

Ensure config reload resets the option before executing the changed file, so deleting a setter restores the default. Options registered through `BrowserSafeApis.options` and exposed directly through `Config` are reset by `resetBrowserSafeConfigOptions()`. Add an explicit reset in `ConfigInternals.resetConfigOptions()` for custom module state.

Preserve transactional reload behavior: an invalid changed config must leave the previous valid configuration active.

## Test the lifecycle

Add tests that prove the classification:

- Reloadable: change the option after the initial read, cross the intended reload/request boundary, and assert the new value is observed.
- Startup-fixed: capture the initial value, change config state, and assert the initialized consumer still receives the original value.
- Cross-consumer: assert every Studio consumer receives the same startup snapshot when any one consumer requires it.
- Reset: omit a previously set option on reload and assert its default is restored.
- Nullable internal inputs: pass `null` explicitly in fixtures and call sites.

Run focused builds and checks for the affected packages:

```sh
bunx turbo run make lint formatting --filter='@remotion/cli' --filter='@remotion/studio-server'
bun test packages/cli/src/test/config-reload.test.ts packages/cli/src/test/config-reset.test.ts
```
