---
image: /generated/articles-docs-overwriting-webpack-config.png
id: webpack
title: Custom Webpack config
crumb: 'How To'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Remotion ships with [it's own Webpack configuration](https://github.com/remotion-dev/remotion/blob/main/packages/bundler/src/webpack-config.ts).

You can override it reducer-style by creating a function that takes the previous Webpack configuration and returns the the new one.

## When rendering using the command line

In your [`remotion.config.ts`](/docs/config) file, you can call [`Config.overrideWebpackConfig()`](/docs/config#overridewebpackconfig) from `@remotion/cli/config`.

```ts twoslash title="remotion.config.ts"
import {Config} from '@remotion/cli/config';

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
import {WebpackOverrideFn} from '@remotion/bundler';

export const webpackOverride: WebpackOverrideFn = (currentConfiguration) => {
  return {
    ...currentConfiguration,
    // Your override here
  };
};
```

```ts twoslash title="remotion.config.ts"
// @filename: ./src/webpack-override.ts
import {WebpackOverrideFn} from '@remotion/bundler';
export const webpackOverride: WebpackOverrideFn = (c) => c;
// @filename: remotion.config.ts
// ---cut---
import {Config} from '@remotion/cli/config';
import {webpackOverride} from './src/webpack-override';

Config.overrideWebpackConfig(webpackOverride);
```

With `bundle`:

```ts twoslash title="my-script.js"
// @filename: ./src/webpack-override.ts
import {WebpackOverrideFn} from '@remotion/bundler';
export const webpackOverride: WebpackOverrideFn = (c) => c;
// @filename: remotion.config.ts
// @target: esnext
// ---cut---
import {bundle} from '@remotion/bundler';
import {webpackOverride} from './src/webpack-override';

await bundle({
  entryPoint: require.resolve('./src/index.ts'),
  webpackOverride,
});
```

Or while using with `deploySite`:

```ts twoslash title="my-script.js"
// @filename: ./src/webpack-override.ts
import {WebpackOverrideFn} from '@remotion/bundler';
export const webpackOverride: WebpackOverrideFn = (c) => c;
// @filename: remotion.config.ts
// @target: esnext
// ---cut---
import {deploySite} from '@remotion/lambda';
import {webpackOverride} from './src/webpack-override';

await deploySite({
  entryPoint: require.resolve('./src/index.ts'),
  region: 'us-east-1',
  bucketName: 'remotionlambda-c7fsl3d',
  options: {
    webpackOverride,
  },
  // ...other parameters
});
```

## Multiple Webpack overrides

If you have multiple overrides, you should curry them:

```tsx twoslash
import {Config} from '@remotion/cli/config';
import {enableScss} from '@remotion/enable-scss';
import {enableTailwind} from '@remotion/tailwind-v4';

Config.overrideWebpackConfig((c) => enableScss(enableTailwind(c)));
```

From Remotion v4.0.229, you can also use `Config.overrideWebpackConfig` multiple times, but this only works in the config file:

```tsx twoslash
import {Config} from '@remotion/cli/config';
import {enableScss} from '@remotion/enable-scss';
import {enableTailwind} from '@remotion/tailwind-v4';

Config.overrideWebpackConfig(enableScss);
Config.overrideWebpackConfig(enableTailwind);
```

## Snippets

### Enabling MDX support

1. Install the following dependencies:

<Installation pkg="@mdx-js/loader @mdx-js/react" />

2. Create a file with the Webpack override:

```ts twoslash title="enable-mdx.ts"
import {WebpackOverrideFn} from '@remotion/bundler';
// ---cut---
export const enableMdx: WebpackOverrideFn = (currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules ? currentConfiguration.module.rules : []),
        {
          test: /\.mdx?$/,
          use: [
            {
              loader: '@mdx-js/loader',
              options: {},
            },
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
import {WebpackOverrideFn} from '@remotion/bundler';
export const enableMdx: WebpackOverrideFn = (c) => c;
// @filename: remotion.config.ts
// ---cut---
import {Config} from '@remotion/cli/config';
import {enableMdx} from './src/enable-mdx';

Config.overrideWebpackConfig(enableMdx);
```

4. Add it to your [Node.JS API calls as well if necessary](#when-using-bundle-and-deploysite).

5. Create a file which contains `declare module '*.mdx';` in your project to fix a TypeScript error showing up.

### Enable TailwindCSS support

- [TailwindCSS V3](/docs/tailwind)
- [TailwindCSS V2 (Legacy)](/docs/tailwind-legacy)

### Enable SASS/SCSS support

The easiest way is to use the `@remotion/enable-scss`.  
Follow these [instructions](/docs/enable-scss/overview) to enable it.

### Enable SVGR support

This allows you to enable `import` SVG files as React components.

1. Install the following dependency:

<Installation pkg="@svgr/webpack" />

2. Declare an override function:

```ts twoslash title="src/enable-svgr.ts"
import {WebpackOverrideFn} from '@remotion/bundler';

export const enableSvgr: WebpackOverrideFn = (currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          resourceQuery: {not: [/url/]}, // Exclude react component if *.svg?url
          use: ['@svgr/webpack'],
        },
        ...(currentConfiguration.module?.rules ?? []).map((r) => {
          if (!r) {
            return r;
          }
          if (r === '...') {
            return r;
          }
          if (!r.test?.toString().includes('svg')) {
            return r;
          }
          return {
            ...r,
            // Remove Remotion loading SVGs as a URL
            test: new RegExp(r.test.toString().replace(/svg\|/g, '').slice(1, -1)),
          };
        }),
      ],
    },
  };
};
```

3. Add the override function to your [`remotion.config.ts`](/docs/config) file:

```ts twoslash title="remotion.config.ts"
// @filename: ./src/enable-svgr.ts
import {WebpackOverrideFn} from '@remotion/bundler';
export const enableSvgr: WebpackOverrideFn = (c) => c;
// @filename: remotion.config.ts
// ---cut---
import {Config} from '@remotion/cli/config';
import {enableSvgr} from './src/enable-svgr';

Config.overrideWebpackConfig(enableSvgr);
```

4. Add it to your [Node.JS API calls as well if necessary](#when-using-bundle-and-deploysite).

5. Restart the Remotion Studio.

### Enable support for GLSL imports

1. Install the following dependencies:

<Installation pkg="glsl-shader-loader glslify glslify-import-loader raw-loader" />

2. Declare a webpack override:

```ts twoslash title="src/enable.glsl.ts"
import {WebpackOverrideFn} from '@remotion/bundler';

export const enableGlsl: WebpackOverrideFn = (currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules ? currentConfiguration.module.rules : []),
        {
          test: /\.(glsl|vs|fs|vert|frag)$/,
          exclude: /node_modules/,
          use: ['glslify-import-loader', 'raw-loader', 'glslify-loader'],
        },
      ],
    },
  };
};
```

```ts twoslash title="remotion.config.ts"
// @filename: ./src/enable-glsl.ts
import {WebpackOverrideFn} from '@remotion/bundler';
export const enableGlsl: WebpackOverrideFn = (c) => c;

// @filename: remotion.config.ts
// ---cut---
import {Config} from '@remotion/cli/config';
import {enableGlsl} from './src/enable-glsl';

Config.overrideWebpackConfig(enableGlsl);
```

3. Add the following to your [entry point](/docs/terminology/entry-point) (e.g. `src/index.ts`):

```ts
declare module '*.glsl' {
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
import {Config} from '@remotion/cli/config';

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
import {Config} from '@remotion/cli/config';

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

### Change the `@jsxImportSource`

```tsx twoslash
import {Config} from '@remotion/cli/config';

Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    module: {
      ...config.module,
      rules: config.module?.rules?.map((rule) => {
        // @ts-expect-error
        if (!rule?.use) {
          return rule;
        }

        return {
          // @ts-expect-error
          ...rule,
          // @ts-expect-error
          use: rule?.use.map((use) => {
            if (!use?.loader?.includes('esbuild')) {
              return use;
            }
            return {
              ...use,
              options: {
                ...use.options,
                jsxImportSource: 'react',
              },
            };
          }),
        };
      }),
    },
  };
});
```

### Use legacy babel loader

See [Using legacy Babel transpilation](/docs/legacy-babel).

## Enable TypeScript aliases

See [TypeScript aliases](/docs/typescript-aliases).

## Customizing configuration file location

You can pass a `--config` option to the command line to specify a custom location for your configuration file.

## Importing ES Modules in remotion.config.ts<AvailableFrom v="4.0.117"/>

The [config file](/docs/config) gets executed in a CommonJS environment. If you want to import ES modules, you can pass an async function to `Config.overrideWebpackConfig`:

```ts twoslash title="remotion.config.ts"
// @filename: src/enable-sass.ts
import {WebpackOverrideFn} from '@remotion/bundler';
export const enableSass: WebpackOverrideFn = (c) => c;

// @filename: remotion.config.ts
// ---cut---
import {Config} from '@remotion/cli/config';

Config.overrideWebpackConfig(async (currentConfiguration) => {
  const {enableSass} = await import('./src/enable-sass');
  return enableSass(currentConfiguration);
});
```

## See also

- [Configuration file](/docs/config)
