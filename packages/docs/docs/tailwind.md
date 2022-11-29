---
id: tailwind
title: TailwindCSS
---

import Tabs from "@theme/Tabs";
import TabItem from '@theme/TabItem';

## Using the template

The easiest way to get started with Tailwind and Remotion is to [use the template by cloning it on GitHub](https://github.com/remotion-dev/template-tailwind) or running the following:

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
npx create-video --tailwind
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm create video --tailwind
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn create video -- --tailwind
```

  </TabItem>

</Tabs>

## Install in existing project

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
npm i postcss-loader postcss postcss-preset-env tailwindcss autoprefixer
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add postcss-loader postcss postcss-preset-env tailwindcss autoprefixer
```

  </TabItem>
  <TabItem value="pnpm">

```bash
pnpm i postcss-loader postcss postcss-preset-env tailwindcss autoprefixer
```

  </TabItem>
</Tabs>

2. Create a function for overriding the webpack config

```ts twoslash title="src/enable-tailwind.ts"
import { WebpackOverrideFn } from "remotion";

export const enableTailwind: WebpackOverrideFn = (currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules
          ? currentConfiguration.module.rules
          : []
        ).filter((rule) => {
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
};
```

3. Add the Webpack override to your config file:

```ts twoslash title="remotion.config.ts"
// @filename: ./src/enable-tailwind.ts
import { WebpackOverrideFn } from "remotion";
export const enableTailwind: WebpackOverrideFn = (c) => c;
// @filename: remotion.config.ts
// ---cut---
import { Config } from "remotion";
import { enableTailwind } from "./src/enable-tailwind";

Config.Bundling.overrideWebpackConfig(enableTailwind);
```

4. If you use the [`bundle()` or `deploySite()` Node.JS API, add the Webpack override to it as well](/docs/webpack#when-using-bundle-and-deploysite).

5. Create a file `src/style.css` with the following content:

```css title="src/style.css"
@tailwind base;
@tailwind components;
@tailwind utilities;
```

6. Import the stylesheet in your `src/Root.tsx` file. Add to the top of the file:

```js title="src/Root.tsx"
import "./style.css";
```

7.  Add a `tailwind.config.js` file to the root of your project:

```js title="tailwind.config.js"
/* eslint-env node */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

8. Ensure your `package.json` does not have `"sideEffects": false` set. If it has, declare that CSS files have a side effect:

```diff title="package.json"
{
// Only if `"sideEffects": false` exists in your package.json.
-  "sideEffects": false
+  "sideEffects": ["*.css"]
}
```

9. Start using TailwindCSS! You can verify that it's working by adding `className="bg-red-900"` to any element.

## See also

- [TailwindCSS v2 (legacy)](/docs/tailwind-legacy)
