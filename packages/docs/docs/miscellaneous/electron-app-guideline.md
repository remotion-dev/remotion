---
title: "Embedding Remotion in an Electron App (Unofficial Guide)"
crumb: "Snippets"
id: electron-app-guidelines
---

# Embedding Remotion in an Electron App (Unofficial Guide)

**Disclaimer:** Please note that embedding Remotion in an Electron app using the following method is an unofficial approach and not officially supported by Remotion at this time. While it is possible to make it work, it may require customization and adjustments based on your specific use case and platform requirements. Use this guide at your own discretion.

## Prerequisites

1. Node.js and npm installed on your system.
2. A basic understanding of Electron and Remotion.

## Steps

1. **Create an Electron App**: If you don't already have an Electron app, you can create one using Electron Forge or any other method of your choice. Make sure your Electron app is set up and working correctly.

2. **Install Dependencies**: In your Electron project directory, install the necessary dependencies.

   ```bash
   npm install @remotion/renderer
   npm install esbuild
   ```

3. **Bundle Electron Code**: Switch to using esbuild for bundling your Electron-specific code. Create a custom esbuild configuration to handle @remotion/renderer correctly.

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
      // ...
    ],
  })
  .catch(() => process.exit(1));
```

4. **Packaging Electron App**: Configure your Electron app to package the @remotion/compositor-\* packages correctly.

- Use your Electron packagerConfig to specify how to unpack @remotion/compositor-\* packages from the asar package.

Example electron-forge packagerConfig (`forge.config.js`):

```ts
module.exports = {
  packagerConfig: {
    // Specify how to unpack @remotion/compositor-* packages
    // ...
  },
  // ...
};
```

5. **Disable chmod Behavior (MacOS)**: If you face issues related to chmod on MacOS, you can disable it by setting the `READ_ONLY_FS` environment variable.

In your Electron code, before importing `@remotion/renderer`, add the following code:

```ts
If (!process.env.READ_ONLY_FS) {
// @remotion/renderer import
}
```

6. **Entitlements (MacOS)**: If you encounter issues with executing external libraries like ffmpeg on MacOS, make sure to set the necessary entitlements in your Electron app configuration to allow them to run.

7. **Testing and Distribution**: Test your Electron app thoroughly, especially on external machines to ensure it works as expected. Distribute your Electron app with embedded Remotion to your users.

8. **Documentation**: It's recommended to document the steps you've followed to embed Remotion in your Electron app. This documentation will be helpful for other developers until official guidelines are published.

Please be aware that embedding Remotion in an Electron app using this unofficial approach may require ongoing maintenance and monitoring for compatibility with future updates to Remotion and Electron. Use this guide as a starting point and be prepared to make adjustments as necessary.
