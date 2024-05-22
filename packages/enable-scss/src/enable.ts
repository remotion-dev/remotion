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
						{loader: 'style-loader'},
						{loader: 'css-loader'},
						{loader: 'sass-loader', options: {sourceMap: true}},
					],
				},
			],
		},
	};
};
