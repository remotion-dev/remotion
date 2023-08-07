---
image: /generated/articles-docs-tailwind-enable-tailwind.png
title: enableTailwind()
crumb: "@remotion/tailwind"
---

_available from v3.3.95_

A function that modifies the default Webpack configuration to make the necessary changes to support TailwindCSS.

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind";

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration);
});
```

If you want to make other configuration changes, you can do so by doing them reducer-style:

```ts twoslash title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind";

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind({
    ...currentConfiguration,

    // Make other changes
  });
});
```

See the [setup](/docs/tailwind) to see full instructions on how to setup TailwindCSS in Remotion.
