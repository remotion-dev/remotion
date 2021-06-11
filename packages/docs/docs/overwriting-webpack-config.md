---
id: webpack
title: Custom Webpack config
---

import Tabs from "@theme/Tabs";

You can customize the Webpack configuration if you have at least Version 1.1 of Remotion.

Create a config file called `remotion.config.ts` in the root of your project. As a confirmation, you should get a console message `Applied configuration from [configuration-file]`.

## Overriding the webpack config

Get familiar with the default Webpack configuration which can be [found here](https://github.com/JonnyBurger/remotion/blob/main/packages/bundler/src/webpack-config.ts).

In your `remotion.config.ts` file, you can call `Config.Bundler.overrideWebpackConfig` from `remotion`.

Overriding the Webpack config uses the reducer pattern - pass in a function that takes as it's argument a Webpack configuration and return a new Webpack configuration.

```tsx
import {Config} from 'remotion';

Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...currentConfiguration.module.rules,
        // Add more loaders here
      ],
    },
  };
});
```

:::info
Using the reducer pattern will help with type safety, give you auto-complete, ensure forwards-compatibility and keep it completely flexible - you can override just one property or pass in a completely new Webpack configuration.
:::

## Snippets

### Enabling MDX support

The following `remotion.config.ts` file shows how to enable support for MDX. Installation of `mdx-loader babel-loader @babel/preset-env @babel/preset-react` is required.

```ts
Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
	return {
		...currentConfiguration,
		module: {
			...currentConfiguration.module,
			rules: [
				...(currentConfiguration.module?.rules
					? currentConfiguration.module.rules
					: []),
				{
					test: /\.mdx?$/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: [
									'@babel/preset-env',
									[
										'@babel/preset-react',
										{
											runtime: 'automatic',
										},
									],
								],
							},
						},
						'mdx-loader',
					],
				},
			],
		},
	};
});

```

:::info
Create a file which contains `declare module '*.mdx';` in your project to fix a TypeScript error showing up.
:::

### Enable SASS/SCSS support

1. Install the following dependencies:

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
]
}>
<TabItem value="npm">

```bash
npm i sass sass-loader
```

  </TabItem>

  <TabItem value="yarn">

```bash
yarn add sass sass-loader
```

  </TabItem>
</Tabs>

2. Add the following to your [`remotion.config.ts`](/docs/config) file:

```tsx
Config.Bundling.overrideWebpackConfig((currentConfiguration) => {
	return {
		...currentConfiguration,
		module: {
			...currentConfiguration.module,
			rules: [
				...(currentConfiguration.module?.rules
					? currentConfiguration.module.rules
					: []),
				{
					test: /\.s[ac]ss$/i,
					use: [
						{
							loader: 'style-loader',
						},
						{
							loader: 'css-loader',
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: true,
							},
						},
					],
				},
			],
		},
	};
});
```

3. Restart the preview server.

### Use legacy babel loader

See [Using legacy Babel transpilation](legacy-babel).

## Customizing configuration file location

You can pass a `--config` option to the command line to specify a custom location for your configuration file.

## See also

- [Configuration file](/docs/config)
