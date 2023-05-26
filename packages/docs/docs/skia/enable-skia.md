---
image: /generated/articles-docs-skia-enable-skia.png
title: enableSkia()
crumb: "@remotion/skia"
---

A function that modifies the default Webpack configuration to make the necessary changes to support Skia.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
import { enableSkia } from "@remotion/skia/enable";

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableSkia(currentConfiguration);
});
```

:::note
Prior to `v3.3.39`, the option was called `Config.Bundling.overrideWebpackConfig()`.
:::

If you want to make other configuration changes, you can do so by doing them reducer-style:

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
import { enableSkia } from "@remotion/skia/enable";

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableSkia({
    ...currentConfiguration,

    // Make other changes
  });
});
```

:::note
Prior to `v3.3.39`, the option was called `Config.Bundling.overrideWebpackConfig()`.
:::

See the [setup](/docs/skia) to see full instructions on how to setup React Native Skia in Remotion.
