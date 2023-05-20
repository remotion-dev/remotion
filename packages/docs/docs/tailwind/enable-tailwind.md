---
image: /generated/articles-docs-tailwind-enable-tailwind.png
title: enableTailwind()
crumb: "@remotion/tailwind"
---

A function that modifies the default Webpack configuration to make the necessary changes to support TailwindCSS.

```ts twoslash title="remotion.config.ts"
import { Config } from "remotion";
import { enableTailwind } from "@remotion/tailwind";

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration);
});
```

:::note
Prior to `v3.3.39`, the option was called `Config.Bundling.overrideWebpackConfig()`.
:::

If you want to make other configuration changes, you can do so by doing them reducer-style:

```ts twoslash title="remotion.config.ts"
import { Config } from "remotion";
import { enableTailwind } from "@remotion/tailwind";

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind({
    ...currentConfiguration,

    // Make other changes
  });
});
```

:::note
Prior to `v3.3.39`, the option was called `Config.Bundling.overrideWebpackConfig()`.
:::

See the [setup](/docs/tailwind) to see full instructions on how to setup TailwindCSS in Remotion.
