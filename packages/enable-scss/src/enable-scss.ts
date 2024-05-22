import type {WebpackOverrideFn} from '@remotion/bundler';

export const enableScss: WebpackOverrideFn = (currentConfiguration) => {
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
						{loader: require.resolve('style-loader')},
						{loader: require.resolve('css-loader')},
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
