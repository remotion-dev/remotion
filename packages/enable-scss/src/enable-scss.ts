import type {WebpackOverrideFn} from '@remotion/bundler';

export const enableScss: WebpackOverrideFn = (currentConfiguration) => {
	return {
		...currentConfiguration,
		module: {
			...currentConfiguration.module,
			rules: [
				...(currentConfiguration.module?.rules || []),
				{
					test: /\.module\.s[ac]ss$/i, // Only target `.module.scss` files
					use: [
						{loader: require.resolve('style-loader')},
						{
							loader: require.resolve('css-loader'),
							options: {
								modules: {
									localIdentName: '[name]__[local]__[hash:base64:5]', // Keeps class names readable
								},
							},
						},
						{
							loader: require.resolve('sass-loader'),
							options: {sourceMap: true},
						},
					],
				},
				{
					test: /\.s[ac]ss$/i, // Non-module SCSS files
					exclude: /\.module\.s[ac]ss$/i, // Exclude `.module.scss` files
					use: [
						{loader: require.resolve('style-loader')},
						{loader: require.resolve('css-loader')}, // Regular CSS without CSS Modules
						{
							loader: require.resolve('sass-loader'),
							options: {sourceMap: true},
						},
					],
				},
			],
		},
	};
};
