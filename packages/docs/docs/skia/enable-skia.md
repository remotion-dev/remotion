---
title: enableSkia()
---

A function that modifies the default Webpack configuration to make the necessary changes to support Skia.

```ts twoslash title="remotion.config.ts"
import { Config } from "remotion";
import { enableSkia } from "@remotion/skia/enable";

Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
  return enableSkia(currentConfiguration);
});
```

If you want to make other configuration changes, you can do so by doing them reducer-style:

```ts twoslash title="remotion.config.ts"
import { Config } from "remotion";
import { enableSkia } from "@remotion/skia/enable";

Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
  const newConfig = enableSkia(currentConfiguration);

  return {
    ...newConfig,
    // Make other changes
  };
});
```

See the [setup](/docs/skia) to see full instructions on how to setup React Native Skia in Remotion.
