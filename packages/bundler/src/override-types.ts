import type {Configuration as RspackConfigurationType} from '@rspack/core';
import type {Configuration as WebpackConfigurationType} from 'webpack';

export type WebpackConfiguration = WebpackConfigurationType;
export type RspackConfiguration = RspackConfigurationType;

export type WebpackOverrideFn = (
	currentConfiguration: WebpackConfiguration,
) => WebpackConfiguration | Promise<WebpackConfiguration>;

export type RspackOverrideFn = (
	currentConfiguration: RspackConfiguration,
) => RspackConfiguration | Promise<RspackConfiguration>;

export type BundlerName = 'webpack' | 'rspack';

export type BundlerOverrideFn = (
	currentConfiguration: WebpackConfiguration | RspackConfiguration,
	context: {bundler: BundlerName},
) =>
	| WebpackConfiguration
	| RspackConfiguration
	| Promise<WebpackConfiguration | RspackConfiguration>;
