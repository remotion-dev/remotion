---
title: Using legacy Babel transpilation
id: legacy-babel
---

In Remotion 2.0, the traditional transpilation of Javascript and Typescript using the `babel-loader` has been replaced by the faster `esbuild-loader` by default.

If you for some reason need to go back to the previous behavior, you may [override the Webpack configuration](/docs/webpack). Remember that overriding the Webpack configuration works reducer-style, where you get the default configuration in a function argument and you return the modified version of your config.

We provide a compatibility package `@remotion/babel-loader` that you can install into your Remotion project and use the function `replaceLoadersWithBabel()` to swap out the ESBuild loader with the old Babel one that was in Remotion 1.0

This should not be necessary in general, it is encouraged to [report issues](https://github.com/remotion-dev/remotion/issues/new) regarding the new ESBuild loader.

## Example

```bash title="Console"
npm i @remotion/babel-loader
```

```ts twoslash title="remotion.config.ts"
import { Config } from "remotion";
// ---cut---
import { replaceLoadersWithBabel } from "@remotion/babel-loader";

Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
  return replaceLoadersWithBabel(currentConfiguration);
});
```

## See also

- [Custom Webpack config](/docs/webpack)
