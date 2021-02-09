import {WebpackConfiguration} from './webpack-config';

export type WebpackOverrideFn = (
	currentConfiguration: WebpackConfiguration
) => WebpackConfiguration;

export const defaultOverrideFunction: WebpackOverrideFn = (config) => config;
let overrideFn: WebpackOverrideFn = defaultOverrideFunction;

export const getOverrideFn = () => {
	return overrideFn;
};

export const overrideWebpackConfig = (fn: WebpackOverrideFn) => {
	overrideFn = fn;
};
