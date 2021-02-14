---
id: webpack
title: Custom Webpack config
---

You can customize the Webpack configuration if you have at least Version 1.1 of Remotion.

Create a config file called `remotion.config.ts` in the root of your project. As a confirmation, you should get a console message `Applied configuration from [configuration-file]`.

## Overriding the webpack config

Get familiar with the default Webpack configuration which can be [found here](https://github.com/JonnyBurger/remotion/blob/main/packages/bundler/src/webpack-config.ts).

In your `remotion.config.ts` file, you can call `overrideWebpackConfig` from `@remotion/bundler`.

Overriding the Webpack config uses the reducer pattern - pass in a function that takes as it's argument a Webpack configuration and return a new Webpack configuration.

```tsx
import {Config} from 'remotion';

Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...currentConfiguration.module.rules,
        // Add more loaders here
      ],
    },
  };
});
```

:::info
Using the reducer pattern will help with type safety, give you auto-complete, ensure forwards-compatibility and keep it completely flexible - you can override just one property or pass in a completely new Webpack configuration.
:::

## Enabling MDX support

The following `remotion.config.ts` file shows how to enable support for MDX. Installation of `mdx-loader babel-loader @babel/preset-env @babel/preset-react` is required.

```ts
import {overrideWebpackConfig} from '@remotion/bundler';

overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...currentConfiguration.module.rules,
        {
          test: /\.mdx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                  [
                    '@babel/preset-react',
                    {
                      runtime: 'automatic',
                    },
                  ],
                ],
              },
            },
            'mdx-loader',
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

## Customizing configuration file location

You can pass a `--config` option to the command line to specify a custom location for your configuration file.
