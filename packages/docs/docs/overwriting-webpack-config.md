---
id: webpack
title: Custom Webpack config
---

import Tabs from "@theme/Tabs";

You can customize the Webpack configuration if you have at least Version 1.1 of Remotion.

Create a config file called `remotion.config.ts` in the root of your project. As a confirmation, you should get a console message `Applied configuration from [configuration-file]`.

## Overriding the webpack config

Get familiar with the default Webpack configuration which can be [found here](https://github.com/remotion-dev/remotion/blob/main/packages/bundler/src/webpack-config.ts).

In your `remotion.config.ts` file, you can call `Config.Bundler.overrideWebpackConfig` from `remotion`.

Overriding the Webpack config uses the reducer pattern - pass in a function that takes as it's argument a Webpack configuration and return a new Webpack configuration.

```ts twoslash
import { Config } from "remotion";

Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
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

## Snippets

### Enabling MDX support

The following `remotion.config.ts` file shows how to enable support for MDX. Installation of `mdx-loader babel-loader @babel/preset-env @babel/preset-react` is required.

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
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
});
```

:::info
Create a file which contains `declare module '*.mdx';` in your project to fix a TypeScript error showing up.
:::

### Enable TailwindCSS support

:::info
This documentation concerns TailwindCSS v2. [Help us update it to v3!](https://github.com/remotion-dev/remotion/issues/737)
:::

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
npm i postcss-loader postcss postcss-preset-env tailwindcss@2 autoprefixer
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add postcss-loader postcss postcss-preset-env tailwindcss@2 autoprefixer
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm i postcss-loader postcss postcss-preset-env tailwindcss@2 autoprefixer
```

  </TabItem>
</Tabs>

2. Add the following to your [`remotion.config.ts`](/docs/config) file:

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules
          ? currentConfiguration.module.rules
          : []
        ).filter((rule) => {
          if (rule === "...") {
            return false;
          }
          if (rule.test?.toString().includes(".css")) {
            return false;
          }
          return true;
        }),
        {
          test: /\.css$/i,
          use: [
            "style-loader",
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    "postcss-preset-env",
                    "tailwindcss",
                    "autoprefixer",
                  ],
                },
              },
            },
          ],
        },
      ],
    },
  };
});
```

3. Create a file `src/style.css` with the following content:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4. Import the stylesheet in your `src/Video.tsx` file. Add to the top of the file:

```js
import "./style.css";
```

5.  Start using TailwindCSS! You can verify that it's working by adding `className="bg-red-900"` to any element.

6.  _Optional_: Add a `tailwind.config.js` file to the root of your project. Add `/* eslint-env node */` to the top of the file to get rid of an ESLint rule complaining that `module` is not defined.

:::warning
Due to a caching bug, the config file might not be picked up until you remove the `node_modules/.cache` folder - watch this issue: https://github.com/remotion-dev/remotion/issues/315
:::

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

  <TabItem value="yarn">

```bash
yarn add sass sass-loader
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm i sass sass-loader
```

  </TabItem>
</Tabs>

2. Add the following to your [`remotion.config.ts`](/docs/config) file:

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
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
});
```

3. Restart the preview server.

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
npm i glsl-shader-loader glslify glslify-import-loader raw-roader
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add glsl-shader-loader glslify glslify-import-loader raw-roader
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm i glsl-shader-loader glslify glslify-import-loader raw-roader
```

  </TabItem>
</Tabs>

2. Add the following to your [`remotion.config.ts`](/docs/config) file:

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
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
});
```

3. Add the following to your entry file (e.g. `src/index.tsx`):

```ts
declare module "*.glsl" {
  const value: string;
  export default value;
}
```

4. Reset the webpack cache by deleting the `node_modules/.cache` folder.
5. Restart the preview server.

### Use legacy babel loader

See [Using legacy Babel transpilation](/docs/legacy-babel).

## Customizing configuration file location

You can pass a `--config` option to the command line to specify a custom location for your configuration file.

## See also

- [Configuration file](/docs/config)
