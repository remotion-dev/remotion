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
	if(invocations > 0){
		throw new Error('You specified the overrideWebpackConfig() multiple times which is incorrect, in such a case, only the function passed in the latest override will be considered. If you want to call more than one functions, pass a single function and then call other functions from inside. Read More: https://www.remotion.dev/docs/config#overridewebpackconfig   https://github.com/remotion-dev/remotion/issues/4063  \n')
	
	}
	
	invocations++
	overrideFn = fn;
};
