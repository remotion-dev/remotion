---
id: tailwind
title: TailwindCSS
---

import Tabs from "@theme/Tabs";

## Using the template

The easiest way to get started with Tailwind and Remotion is to [use the template by cloning it on GitHub](https://github.com/remotion-dev/template-tailwind/generate) or running the following:

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
yarn create video --tailwind
```

  </TabItem>

  <TabItem value="yarn">

```bash
pnpm create video -- --tailwind
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

2. Add the following to your [`remotion.config.ts`](/docs/config) file:

```ts twoslash
import { Config } from "remotion";
// ---cut---
Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
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
});
```

3. Create a file `src/style.css` with the following content:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4. Import the stylesheet in your `src/Video.tsx` file. Add to the top of the file:

```js
import "./style.css";
```

5.  Add a `tailwind.config.js` file to the root of your project:

```js
/* eslint-env node */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

6.  Start using TailwindCSS! You can verify that it's working by adding `className="bg-red-900"` to any element.

## See also

- [TailwindCSS v2 (legacy)](/docs/tailwind-legacy)
