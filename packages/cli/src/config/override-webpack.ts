import type {WebpackConfiguration} from '@remotion/bundler';

export type WebpackOverrideFn = (
	currentConfiguration: WebpackConfiguration,
) => WebpackConfiguration | Promise<WebpackConfiguration>;

export const defaultOverrideFunction: WebpackOverrideFn = (config) => config;
let overrideFn: WebpackOverrideFn = defaultOverrideFunction;

export const getWebpackOverrideFn = () => {
	return overrideFn;
};

//	to warn the user if overrideWebpackConfig is invoked more than once
let invocations = 0;

export const overrideWebpackConfig = (fn: WebpackOverrideFn) => {
	if (invocations > 0) {
		const err = [
			'You specified the Config.overrideWebpackConfig() multiple times, which is not supported.',
			'Combine all Webpack overrides into a single one.',
			'You can curry multiple overrides:',
			'',
			'Instead of:',
			'',
			'  Config.overrideWebpackConfig((currentConfiguration) => {',
			'    return enableScss(currentConfiguration);',
			'  });',
			'  Config.overrideWebpackConfig((currentConfiguration) => {',
			'    return enableTailwind(currentConfiguration);',
			'  });',
			'',
			'Do this:',
			'',
			'  Config.overrideWebpackConfig((currentConfiguration) => {',
			'    return enableScss(enableTailwind(currentConfiguration));',
			'  });',
			'',
			'Read more: https://www.remotion.dev/docs/config#overridewebpackconfig',
		];
		throw new Error(err.join('\n'));
	}

	invocations++;
	overrideFn = fn;
};
