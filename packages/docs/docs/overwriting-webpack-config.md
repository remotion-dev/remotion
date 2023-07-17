---
image: /generated/articles-docs-overwriting-webpack-config.png
id: webpack
title: Custom Webpack config
crumb: "How To"
---

import Tabs from "@theme/Tabs";
import TabItem from '@theme/TabItem';

Remotion ships with [it's own Webpack configuration](https://github.com/remotion-dev/remotion/blob/main/packages/bundler/src/webpack-config.ts).

You can override it reducer-style by creating a function that takes the previous Webpack configuration and returns the the new one.

## When rendering using the command line

In your `remotion.config.ts` file, you can call `Config.Bundler.overrideWebpackConfig()` from `remotion`.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules ?? []),
        // Add more loaders here
      ],
    },
  };
});
```

:::info
Using the reducer pattern will help with type safety, give you auto-complete, ensure forwards-compatibility and keep it completely flexible - you can override just one property or pass in a completely new Webpack configuration.
:::

## When using `bundle()` and `deploySite()`

When using the Node.JS APIs - [`bundle()`](/docs/bundle) for SSR or [`deploySite()`](/docs/lambda/deploysite) for Lambda, you also need to provide the Webpack override, since the Node.JS APIs do not read from the config file. We recommend you put the webpack override in a separate file so you can read it from both the command line and your Node.JS script.

```ts twoslash title="src/webpack-override.ts"
import { WebpackOverrideFn } from "@remotion/bundler";

export const webpackOverride: WebpackOverrideFn = (currentConfiguration) => {
  return {
    ...currentConfiguration,
    // Your override here
  };
};
```

```ts twoslash title="remotion.config.ts"
// @filename: ./src/webpack-override.ts
import { WebpackOverrideFn } from "@remotion/bundler";
export const webpackOverride: WebpackOverrideFn = (c) => c;
// @filename: remotion.config.ts
// ---cut---
import { Config } from "@remotion/cli/config";
import { webpackOverride } from "./src/webpack-override";

Config.overrideWebpackConfig(webpackOverride);
```

With `bundle`:

```ts twoslash title="my-script.js"
// @filename: ./src/webpack-override.ts
import { WebpackOverrideFn } from "@remotion/bundler";
export const webpackOverride: WebpackOverrideFn = (c) => c;
// @filename: remotion.config.ts
// @target: esnext
// ---cut---
import { bundle } from "@remotion/bundler";
import { webpackOverride } from "./src/webpack-override";

await bundle({
  entryPoint: require.resolve("./src/index.ts"),
  webpackOverride,
});
```

Or while using with `deploySite`:

```ts twoslash title="my-script.js"
// @filename: ./src/webpack-override.ts
import { WebpackOverrideFn } from "@remotion/bundler";
export const webpackOverride: WebpackOverrideFn = (c) => c;
// @filename: remotion.config.ts
// @target: esnext
// ---cut---
import { deploySite } from "@remotion/lambda";
import { webpackOverride } from "./src/webpack-override";

await deploySite({
  entryPoint: require.resolve("./src/index.ts"),
  region: "us-east-1",
  bucketName: "remotionlambda-c7fsl3d",
  options: {
    webpackOverride,
  },
  // ...other parameters
});
```

## Snippets

### Enabling MDX support

1. Install the following dependencies:

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
]
}>
<TabItem value="npm">

```bash
npm i mdx-loader babel-loader @babel/preset-env @babel/preset-react
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm i mdx-loader babel-loader @babel/preset-env @babel/preset-react
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add mdx-loader babel-loader @babel/preset-env @babel/preset-react
```

  </TabItem>
</Tabs>

2. Create a file with the Webpack override:

```ts twoslash title="enable-mdx.ts"
import { WebpackOverrideFn } from "@remotion/bundler";
// ---cut---
export const enableMdx: WebpackOverrideFn = (currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules
          ? currentConfiguration.module.rules
          : []),
        {
          test: /\.mdx?$/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [
                  "@babel/preset-env",
                  [
                    "@babel/preset-react",
                    {
                      runtime: "automatic",
                    },
                  ],
                ],
              },
            },
            "mdx-loader",
          ],
        },
      ],
    },
  };
};
```

3. Add it to the config file:

```ts twoslash title="remotion.config.ts"
// @filename: ./src/enable-mdx.ts
import { WebpackOverrideFn } from "@remotion/bundler";
export const enableMdx: WebpackOverrideFn = (c) => c;
// @filename: remotion.config.ts
// ---cut---
import { Config } from "@remotion/cli/config";
import { enableMdx } from "./src/enable-mdx";

Config.overrideWebpackConfig(enableMdx);
```

4. Add it to your [Node.JS API calls as well if necessary](#when-using-bundle-and-deploysite).

5. Create a file which contains `declare module '*.mdx';` in your project to fix a TypeScript error showing up.

### Enable TailwindCSS support

- [TailwindCSS V3](/docs/tailwind)
- [TailwindCSS V2 (Legacy)](/docs/tailwind-legacy)

### Enable SASS/SCSS support

1. Install the following dependencies:

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
]
}>
<TabItem value="npm">

```bash
npm i sass sass-loader
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm i sass sass-loader
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add sass sass-loader
```

  </TabItem>
</Tabs>

2. Declare an override function:

```ts twoslash title="src/enable-sass.ts"
import { WebpackOverrideFn } from "@remotion/bundler";

const enableSass: WebpackOverrideFn = (currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules
          ? currentConfiguration.module.rules
          : []),
        {
          test: /\.s[ac]ss$/i,
          use: [
            { loader: "style-loader" },
            { loader: "css-loader" },
            { loader: "sass-loader", options: { sourceMap: true } },
          ],
        },
      ],
    },
  };
};
```

3. Add the override function to your [`remotion.config.ts`](/docs/config) file:

```ts twoslash title="remotion.config.ts"
// @filename: ./src/enable-sass.ts
import { WebpackOverrideFn } from "@remotion/bundler";
export const enableSass: WebpackOverrideFn = (c) => c;
// @filename: remotion.config.ts
// ---cut---
import { Config } from "@remotion/cli/config";
import { enableSass } from "./src/enable-sass";

Config.overrideWebpackConfig(enableSass);
```

4. Add it to your [Node.JS API calls as well if necessary](#when-using-bundle-and-deploysite).

5. Restart the Remotion Studio.

### Enable support for GLSL imports

1. Install the following dependencies:

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
]
}>
<TabItem value="npm">

```bash
npm i glsl-shader-loader glslify glslify-import-loader raw-loader
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add glsl-shader-loader glslify glslify-import-loader raw-loader
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm i glsl-shader-loader glslify glslify-import-loader raw-loader
```

  </TabItem>
</Tabs>

2. Declare a webpack override:

```ts twoslash title="src/enable.glsl.ts"
import { WebpackOverrideFn } from "@remotion/bundler";

export const enableGlsl: WebpackOverrideFn = (currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules
          ? currentConfiguration.module.rules
          : []),
        {
          test: /\.(glsl|vs|fs|vert|frag)$/,
          exclude: /node_modules/,
          use: ["glslify-import-loader", "raw-loader", "glslify-loader"],
        },
      ],
    },
  };
};
```

```ts twoslash title="remotion.config.ts"
// @filename: ./src/enable-glsl.ts
import { WebpackOverrideFn } from "@remotion/bundler";
export const enableGlsl: WebpackOverrideFn = (c) => c;

// @filename: remotion.config.ts
// ---cut---
import { Config } from "@remotion/cli/config";
import { enableGlsl } from "./src/enable-glsl";

Config.overrideWebpackConfig(enableGlsl);
```

3. Add the following to your [entry point](/docs/terminology#entry-point) (e.g. `src/index.ts`):

```ts
declare module "*.glsl" {
  const value: string;
  export default value;
}
```

4. Add it to your [Node.JS API calls as well if necessary](#when-using-bundle-and-deploysite).

5. Reset the webpack cache by deleting the `node_modules/.cache` folder.
6. Restart the Remotion Studio.

### Enable WebAssembly

There are two WebAssembly modes: asynchronous and synchronous. We recommend testing both and seeing which one works for the WASM library you are trying to use.

```ts twoslash title="remotion.config.ts - synchronous"
import { Config } from "@remotion/cli/config";

Config.overrideWebpackConfig((conf) => {
  return {
    ...conf,
    experiments: {
      syncWebAssembly: true,
    },
  };
});
```

:::note
Since Webpack does not allow synchronous WebAssembly code in the main chunk, you most likely need to declare your composition using [`lazyComponent`](/docs/composition#example-using-lazycomponent) instead of `component`. Check out a [demo project](https://github.com/remotion-dev/id3-tags) for an example.
:::

```ts twoslash title="remotion.config.ts - asynchronous"
import { Config } from "@remotion/cli/config";

Config.overrideWebpackConfig((conf) => {
  return {
    ...conf,
    experiments: {
      asyncWebAssembly: true,
    },
  };
});
```

After you've done that, clear the Webpack cache:

```bash
rm -rf node_modules/.cache
```

After restarting, you can import `.wasm` files using an import statement.

Add the Webpack override to your [Node.JS API calls as well if necessary](#when-using-bundle-and-deploysite).

### Use legacy babel loader

See [Using legacy Babel transpilation](/docs/legacy-babel).

## Enable TypeScript aliases

See [TypeScript aliases](/docs/typescript-aliases).

## Customizing configuration file location

You can pass a `--config` option to the command line to specify a custom location for your configuration file.

## See also

- [Configuration file](/docs/config)
