---
image: /generated/articles-docs-tailwind-enable-tailwind.png
title: enableTailwind()
crumb: '@remotion/tailwind'
---

_available from v3.3.95_

:::note
This is documentation for enabling Tailwind v3.  
For the Tailwind v4 version of this site, see the [Tailwind v4 documentation](/docs/tailwind-v4/enable-tailwind).
:::

A function that modifies the default Webpack configuration to make the necessary changes to support TailwindCSS.
See the [setup](/docs/tailwind) to see full instructions on how to setup TailwindCSS in Remotion.

```ts twoslash title="remotion.config.ts"
import {Config} from '@remotion/cli/config';
import {enableTailwind} from '@remotion/tailwind';

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration);
});
```

## Multiple Webpack changes

If you want to make other configuration changes, you can do so by doing them reducer-style:

```ts twoslash title="remotion.config.ts"
import {Config} from '@remotion/cli/config';
import {enableTailwind} from '@remotion/tailwind';

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind({
    ...currentConfiguration,

    // Make other changes
  });
});
```

## Custom Tailwind config location<AvailableFrom v="4.0.187" />

By default, TailwindCSS will search for a file called `tailwind.config.js` in the current working directory where you executed the Remotion CLI.  
This is not in line with Remotion which resolves files relative to the [Remotion Root](/docs/terminology/remotion-root).

This mean if you execute the Remotion CLI from a different directory, Tailwind will not be able to find the config file.  
To fix this, you can pass the path to the config file as the second argument to `enableTailwind()`:

```ts twoslash title="remotion.config.ts"
import path from 'node:path';
import {Config} from '@remotion/cli/config';
import {enableTailwind} from '@remotion/tailwind';

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration, {
    configLocation: path.join(__dirname, 'tailwind.config.js'),
  });
});
```
