import type {
	BundlerOverrideFn,
	RspackOverrideFn,
	WebpackOverrideFn,
} from '@remotion/bundler';

export type {
	BundlerOverrideFn,
	RspackOverrideFn,
	WebpackOverrideFn,
} from '@remotion/bundler';

export const defaultOverrideFunction: WebpackOverrideFn = (config) => config;
export const defaultRspackOverrideFunction: RspackOverrideFn = (config) =>
	config;
export const defaultBundlerOverrideFunction: BundlerOverrideFn = (config) =>
	config;

let webpackOverrideFn: WebpackOverrideFn = defaultOverrideFunction;
let rspackOverrideFn: RspackOverrideFn = defaultRspackOverrideFunction;
let bundlerOverrideFn: BundlerOverrideFn = defaultBundlerOverrideFunction;

export const getWebpackOverrideFn = () => {
	return webpackOverrideFn;
};

export const getRspackOverrideFn = () => {
	return rspackOverrideFn;
};

export const getBundlerOverrideFn = () => {
	return bundlerOverrideFn;
};

export const overrideWebpackConfig = (fn: WebpackOverrideFn) => {
	const prevOverride = webpackOverrideFn;
	webpackOverrideFn = async (c) => fn(await prevOverride(c));
};

export const overrideRspackConfig = (fn: RspackOverrideFn) => {
	const prevOverride = rspackOverrideFn;
	rspackOverrideFn = async (c) => fn(await prevOverride(c));
};

export const overrideBundlerConfig = (fn: BundlerOverrideFn) => {
	const prevOverride = bundlerOverrideFn;
	bundlerOverrideFn = async (c, context) =>
		fn(await prevOverride(c, context), context);
};

export const resetBundlerOverrides = () => {
	webpackOverrideFn = defaultOverrideFunction;
	rspackOverrideFn = defaultRspackOverrideFunction;
	bundlerOverrideFn = defaultBundlerOverrideFunction;
};
