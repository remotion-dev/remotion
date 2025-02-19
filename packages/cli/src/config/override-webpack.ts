import type {WebpackConfiguration} from '@remotion/bundler';

export type WebpackOverrideFn = (
	currentConfiguration: WebpackConfiguration,
) => WebpackConfiguration | Promise<WebpackConfiguration>;

export const defaultOverrideFunction: WebpackOverrideFn = (config) => config;
let overrideFn: WebpackOverrideFn = defaultOverrideFunction;

export const getWebpackOverrideFn = () => {
	return overrideFn;
};

export const overrideWebpackConfig = (fn: WebpackOverrideFn) => {
	const prevOverride = overrideFn;
	overrideFn = async (c) => fn(await prevOverride(c));
};
