---
image: /generated/articles-docs-vercel-create-sandbox.png
title: createSandbox()
crumb: '@remotion/vercel'
---

# createSandbox()<AvailableFrom v="4.0.426" />

:::warning
Experimental package: We reserve the right to make breaking changes in order to correct bad design decisions until this notice is gone.
:::

Creates a new [Vercel Sandbox](https://vercel.com/docs/vercel-sandbox) with all Remotion dependencies installed, including system libraries, the compositor, and a browser.  
After creating the sandbox, call [`addBundleToSandbox()`](/docs/vercel/add-bundle-to-sandbox) to copy your Remotion bundle into it.

## Example

```ts twoslash title="create-snapshot.ts"
// @module: es2022
// @target: es2022
import {addBundleToSandbox, createSandbox} from '@remotion/vercel';
import type {CreateSandboxOnProgress} from '@remotion/vercel';
// ---cut---
const sandbox = await createSandbox({
  onProgress: async ({progress, message}) => {
    console.log(`${message} (${Math.round(progress * 100)}%)`);
  },
});

await addBundleToSandbox({
  sandbox,
  bundleDir: '/path/to/bundle',
});

// ... use the sandbox

await sandbox.stop();
```

## Arguments

An object with the following properties:

### `onProgress?`

A callback that receives progress updates during sandbox creation.

```ts twoslash
import type {CreateSandboxOnProgress} from '@remotion/vercel';
// ---cut---
const onProgress: CreateSandboxOnProgress = async ({progress, message}) => {
  console.log(`${message} (${Math.round(progress * 100)}%)`);
};
```

### `resources?`

The resources to allocate to the sandbox. The type is inherited from the [`@vercel/sandbox`](https://vercel.com/docs/vercel-sandbox) SDK.

Each vCPU gets 2048 MB of memory.

```ts twoslash title="custom-resources.ts"
// @module: es2022
// @target: es2022
import {createSandbox} from '@remotion/vercel';
// ---cut---
const sandbox = await createSandbox({
  resources: {vcpus: 8},
});
```

Default: `{vcpus: 4}`.

### `timeoutInMilliseconds?`<AvailableFrom v="4.0.452" />

The maximum time allowed for the sandbox to be created, in milliseconds. If exceeded, sandbox creation is aborted.

Default: `300000` (5 minutes).

## Return value

A [`VercelSandbox`](/docs/vercel/types#vercelsandbox) object (a [`Sandbox`](https://vercel.com/docs/vercel-sandbox/sdk-reference#sandbox-class) with `AsyncDisposable` support).

## Stopping the sandbox

When you are done with the sandbox, you need to stop it to free resources. There are two ways to do this:

### Using `sandbox.stop()`

Manually call `sandbox.stop()` when you are done:

```ts twoslash title="manual-cleanup.ts"
// @module: es2022
// @target: es2022
import {createSandbox} from '@remotion/vercel';
// ---cut---
const sandbox = await createSandbox();

// ... use the sandbox

await sandbox.stop();
```

### Using `await using`

Use `await using` to automatically stop the sandbox when it goes out of scope:

```ts twoslash title="auto-cleanup.ts"
// @module: es2022
// @target: es2022
import {createSandbox} from '@remotion/vercel';
// ---cut---
await using sandbox = await createSandbox();

// ... use the sandbox
// sandbox.stop() is called automatically
```

## See also

- [`addBundleToSandbox()`](/docs/vercel/add-bundle-to-sandbox)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/vercel/src/create-sandbox.ts)
