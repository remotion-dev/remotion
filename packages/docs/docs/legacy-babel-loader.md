---
image: /generated/articles-docs-legacy-babel-loader.png
title: Using legacy Babel transpilation
id: legacy-babel
crumb: "How To"
---

import Tabs from "@theme/Tabs";
import TabItem from '@theme/TabItem';

In Remotion 2.0, the traditional transpilation of Javascript and Typescript using the `babel-loader` has been replaced by the faster `esbuild-loader` by default.

If you for some reason need to go back to the previous behavior, you may [override the Webpack configuration](/docs/webpack). Remember that overriding the Webpack configuration works reducer-style, where you get the default configuration in a function argument and you return the modified version of your config.

We provide a compatibility package `@remotion/babel-loader` that you can install into your Remotion project and use the function `replaceLoadersWithBabel()` to swap out the ESBuild loader with the old Babel one that was in Remotion 1.0

This should not be necessary in general, it is encouraged to [report issues](https://github.com/remotion-dev/remotion/issues/new) regarding the new ESBuild loader.

## Example

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
npm i babel-loader @babel/preset-env @babel/preset-react
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm i babel-loader @babel/preset-env @babel/preset-react
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add babel-loader @babel/preset-env @babel/preset-react
```

  </TabItem>
</Tabs>

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
// ---cut---
import { replaceLoadersWithBabel } from "@remotion/babel-loader";

Config.overrideWebpackConfig((currentConfiguration) => {
  return replaceLoadersWithBabel(currentConfiguration);
});
```

## When using `bundle` or `deploySite`

When using the Node.JS APIs - [`bundle()`](/docs/bundle) for SSR or [`deploySite()`](/docs/lambda/deploysite) for Lambda, you also need to provide the Webpack override, since the Node.JS APIs do not read from the config file.

```ts twoslash title="my-script.js"
// @filename: ./src/webpack-override.ts
import { WebpackOverrideFn } from "@remotion/bundler";
export const webpackOverride: WebpackOverrideFn = (c) => c;
// @filename: remotion.config.ts
// @target: esnext
// ---cut---
import { bundle } from "@remotion/bundler";
import { replaceLoadersWithBabel } from "@remotion/babel-loader";

await bundle({
  entryPoint: require.resolve("./src/index.ts"),
  webpackOverride: (config) => replaceLoadersWithBabel(config),
});
```

## See also

- [Custom Webpack config](/docs/webpack)
