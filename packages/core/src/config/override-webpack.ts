import {Configuration} from 'webpack';

export type WebpackConfiguration = Configuration & {
	devServer: {
		contentBase: string;
		historyApiFallback: boolean;
		hot: true;
	};
};

export type WebpackOverrideFn = (
	currentConfiguration: WebpackConfiguration
) => WebpackConfiguration;

export const defaultOverrideFunction: WebpackOverrideFn = (config) => config;
let overrideFn: WebpackOverrideFn = defaultOverrideFunction;

export const getWebpackOverrideFn = () => {
	return overrideFn;
};

export const overrideWebpackConfig = (fn: WebpackOverrideFn) => {
	overrideFn = fn;
};
