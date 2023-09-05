---
title: "Embedding Remotion in an Electron App (Unofficial Guide)"
crumb: "Snippets"
id: electron-app-guidelines
---

# Embedding Remotion in an Electron App

:::info
Embedding Remotion in an Electron app using the following method is an **unofficial approach** and not officially supported by Remotion at this time. While it is possible to make it work, it may require customization and adjustments based on your specific use case and platform requirements.
:::

## Prerequisites

1. Node.js and npm installed on your system.
2. A basic understanding of Electron and Remotion.

## Create an Electron App

If you don't already have an Electron app, you can create one using Electron Forge or any other method of your choice. See [electronjs.org/quickstart](https://www.electronjs.org/docs/latest/tutorial/quick-start).

## Install Dependencies

In your Electron project directory, install the necessary dependencies.

```bash
npm install @remotion/renderer
npm install esbuild
```

## Bundle Electron Code

Switch to using esbuild for bundling your Electron-specific code. Create a custom esbuild configuration to handle @remotion/renderer correctly.

- Include `@remotion/renderer` in your esbuild bundle but exclude all of its dependencies.

- Write a custom esbuild plugin to substitute all `@remotion/compositor-*` imports pointing to the directory outside of your app.asar package. This allows esbuild to unpack the `@remotion/compositor-*` packages from the asar package.

Example esbuild configuration (`esbuild.config.js`):

```ts
const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["main.ts"], // Your Electron entry point
    bundle: true,
    outfile: "main.js",
    plugins: [
      // Add your custom esbuild plugin for @remotion/compositor-* imports
    ],
  })
  .catch(() => process.exit(1));
```

## Packaging Electron App

Configure your Electron app to package the `@remotion/compositor-\*` packages correctly.

- Use your Electron packagerConfig to specify how to unpack `@remotion/compositor-\*` packages from the asar package.

Example electron-forge packagerConfig (`forge.config.js`):

```js
module.exports = {
  packagerConfig: {
    // Specify how to unpack @remotion/compositor-* packages
  },
};
```

## Disable chmod behavior (MacOS)

Chmod is not allowed inside a packaged MacOS app, as it's a read-only file system. This leads to problems since `@remotion/renderer` per default tries to chmod the `compositor`.
You can fix this by setting the `READ_ONLY_FS` environment variable as true, which will disable the chmod behavior.

### Entitlements (MacOS)

If you encounter issues with executing external libraries like ffmpeg on MacOS, make sure to set the necessary entitlements in your Electron app configuration to allow them to run.

## See also

-
