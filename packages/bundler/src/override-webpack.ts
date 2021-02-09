import {WebpackConfiguration} from './webpack-config';

type OverrideFn = (configuration: WebpackConfiguration) => WebpackConfiguration;

let overrideFn: OverrideFn = (config) => config;

export const getOverrideFn = () => {
	return overrideFn;
};

export const overrideWebpackConfig = (fn: OverrideFn) => {
	overrideFn = fn;
};
