import type {BundlerConfiguration} from '@remotion/bundler';

/**
 * @description A function that modifies the default bundler configuration to make the necessary changes to support Tailwind.
 * @see [Documentation](https://www.remotion.dev/docs/tailwind-v4/enable-tailwind)
 */
export const enableTailwind = <Configuration extends BundlerConfiguration>(
	currentConfiguration: Configuration,
): Configuration => {
	return {
		...currentConfiguration,
		module: {
			...currentConfiguration.module,
			rules: [
				...(currentConfiguration.module?.rules
					? currentConfiguration.module.rules
					: []
				).filter(
					(rule) =>
						rule && rule !== '...' && !rule.test?.toString().includes('.css'),
				),
				{
					test: /\.css$/i,
					use: [
						require.resolve('style-loader'),
						{
							loader: require.resolve('css-loader'),
							options: {
								modules: {
									auto: true,
									namedExport: false,
								},
							},
						},
						require.resolve('@tailwindcss/webpack'),
					],
				},
			],
		},
	};
};
