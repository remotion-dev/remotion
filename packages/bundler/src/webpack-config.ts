import type {Configuration} from 'webpack';
import webpack, {ProgressPlugin} from 'webpack';
import {CaseSensitivePathsPlugin} from './case-sensitive-paths';
import {getDefinePluginDefinitions} from './define-plugin-definitions';
import type {LoaderOptions} from './esbuild-loader/interfaces';
import {ReactFreshWebpackPlugin} from './fast-refresh';
import {AllowDependencyExpressionPlugin} from './hide-expression-dependency';
import {IgnorePackFileCacheWarningsPlugin} from './ignore-packfilecache-warnings';
import {AllowOptionalDependenciesPlugin} from './optional-dependencies';
import {
	computeHashAndFinalConfig,
	getBaseConfig,
	getOutputConfig,
	getResolveConfig,
	getSharedModuleRules,
} from './shared-bundler-config';
import esbuild = require('esbuild');
export type WebpackConfiguration = Configuration;

export type WebpackOverrideFn = (
	currentConfiguration: WebpackConfiguration,
) => WebpackConfiguration | Promise<WebpackConfiguration>;

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;

function truthy<T>(value: T): value is Truthy<T> {
	return Boolean(value);
}

export const webpackConfig = async ({
	entry,
	userDefinedComponent,
	outDir,
	environment,
	webpackOverride = (f) => f,
	onProgress,
	enableCaching = true,
	maxTimelineTracks,
	remotionRoot,
	keyboardShortcutsEnabled,
	bufferStateDelayInMilliseconds,
	poll,
	experimentalClientSideRenderingEnabled,
	experimentalVisualModeEnabled,
	askAIEnabled,
}: {
	entry: string;
	userDefinedComponent: string;
	outDir: string | null;
	environment: 'development' | 'production';
	webpackOverride: WebpackOverrideFn;
	onProgress?: (f: number) => void;
	enableCaching?: boolean;
	maxTimelineTracks: number | null;
	keyboardShortcutsEnabled: boolean;
	bufferStateDelayInMilliseconds: number | null;
	remotionRoot: string;
	poll: number | null;
	askAIEnabled: boolean;
	experimentalClientSideRenderingEnabled: boolean;
	experimentalVisualModeEnabled: boolean;
}): Promise<[string, WebpackConfiguration]> => {
	const esbuildLoaderOptions: LoaderOptions = {
		target: 'chrome85',
		loader: 'tsx',
		implementation: esbuild,
		remotionRoot,
	};

	let lastProgress = 0;

	const define = new webpack.DefinePlugin(
		getDefinePluginDefinitions({
			maxTimelineTracks,
			askAIEnabled,
			keyboardShortcutsEnabled,
			bufferStateDelayInMilliseconds,
			experimentalClientSideRenderingEnabled,
			experimentalVisualModeEnabled,
		}),
	);

	const conf: WebpackConfiguration = await webpackOverride({
		...getBaseConfig(environment, poll),
		entry: [
			// Fast Refresh must come first,
			// because setup-environment imports ReactDOM.
			// If React DOM is imported before Fast Refresh, Fast Refresh does not work
			environment === 'development'
				? require.resolve('./fast-refresh/runtime.js')
				: null,
			require.resolve('./setup-environment'),
			userDefinedComponent,
			require.resolve('../react-shim.js'),
			entry,
		].filter(Boolean) as [string, ...string[]],
		mode: environment,
		plugins:
			environment === 'development'
				? [
						new ReactFreshWebpackPlugin(),
						new CaseSensitivePathsPlugin(),
						new webpack.HotModuleReplacementPlugin(),
						define,
						new AllowOptionalDependenciesPlugin(),
						new AllowDependencyExpressionPlugin(),
						new IgnorePackFileCacheWarningsPlugin(),
					]
				: [
						new ProgressPlugin((p) => {
							if (onProgress) {
								if ((p === 1 && p > lastProgress) || p - lastProgress > 0.05) {
									lastProgress = p;
									onProgress(Number((p * 100).toFixed(2)));
								}
							}
						}),
						define,
						new AllowOptionalDependenciesPlugin(),
						new AllowDependencyExpressionPlugin(),
						new IgnorePackFileCacheWarningsPlugin(),
					],
		output: getOutputConfig(environment),
		resolve: getResolveConfig(),
		module: {
			rules: [
				...getSharedModuleRules(),
				{
					test: /\.tsx?$/,
					use: [
						{
							loader: require.resolve('./esbuild-loader/index.js'),
							options: esbuildLoaderOptions,
						},
						// Keep the order to match babel-loader
						environment === 'development'
							? {
									loader: require.resolve('./fast-refresh/loader.js'),
								}
							: null,
					].filter(truthy),
				},
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					use: [
						{
							loader: require.resolve('./esbuild-loader/index.js'),
							options: esbuildLoaderOptions,
						},
						environment === 'development'
							? {
									loader: require.resolve('./fast-refresh/loader.js'),
								}
							: null,
					].filter(truthy),
				},
			],
		},
	});

	return computeHashAndFinalConfig(conf, {
		enableCaching,
		environment,
		outDir,
		remotionRoot,
	});
};
