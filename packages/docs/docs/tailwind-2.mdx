---
image: /generated/articles-docs-tailwind-2.png
id: tailwind-legacy
title: TailwindCSS v2 (Legacy)
crumb: "Legacy docs"
---

import Tabs from "@theme/Tabs";
import TabItem from '@theme/TabItem';

:::info
This documentation concerns TailwindCSS v2. [See here for V3!](/docs/tailwind)
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
  <TabItem value="pnpm">

```bash
pnpm i postcss-loader postcss postcss-preset-env tailwindcss@2 autoprefixer
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add postcss-loader postcss postcss-preset-env tailwindcss@2 autoprefixer
```

  </TabItem>
</Tabs>

2. Add the following to your [`remotion.config.ts`](/docs/config) file:

```ts twoslash
import { Config } from "@remotion/cli/config";
// ---cut---
Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules
          ? currentConfiguration.module.rules
          : []
        ).filter((rule) => {
          if (!rule) {
            return false;
          }
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

4. Import the stylesheet in your `src/Root.tsx` file. Add to the top of the file:

```js
import "./style.css";
```

5.  Start using TailwindCSS! You can verify that it's working by adding `className="bg-red-900"` to any element.

6.  _Optional_: Add a `tailwind.config.js` file to the root of your project. Add `/* eslint-env node */` to the top of the file to get rid of an ESLint rule complaining that `module` is not defined.

:::warning
Due to a caching bug, the config file might not be picked up until you remove the `node_modules/.cache` folder - watch this issue: https://github.com/remotion-dev/remotion/issues/315
:::
