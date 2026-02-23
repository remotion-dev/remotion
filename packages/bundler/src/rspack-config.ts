import type {Configuration} from '@rspack/core';
import {DefinePlugin, ProgressPlugin, rspack} from '@rspack/core';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import {getDefinePluginDefinitions} from './define-plugin-definitions';
import {
	computeHashAndFinalConfig,
	getBaseConfig,
	getOutputConfig,
	getResolveConfig,
	getSharedModuleRules,
} from './shared-bundler-config';
import type {WebpackOverrideFn} from './webpack-config';

export type RspackConfiguration = Configuration;

export const rspackConfig = async ({
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
}): Promise<[string, RspackConfiguration]> => {
	let lastProgress = 0;

	const define = new DefinePlugin(
		getDefinePluginDefinitions({
			maxTimelineTracks,
			askAIEnabled,
			keyboardShortcutsEnabled,
			bufferStateDelayInMilliseconds,
			experimentalClientSideRenderingEnabled,
			experimentalVisualModeEnabled,
		}) as unknown as Record<string, string>,
	);

	const swcLoaderRule = {
		loader: 'builtin:swc-loader',
		options: {
			jsc: {
				parser: {syntax: 'typescript' as const, tsx: true},
				transform: {
					react: {
						runtime: 'automatic' as const,
						development: environment === 'development',
						refresh: environment === 'development',
					},
				},
			},
			env: {targets: 'Chrome >= 85'},
		},
	};

	const swcLoaderRuleJsx = {
		loader: 'builtin:swc-loader',
		options: {
			jsc: {
				parser: {syntax: 'ecmascript' as const, jsx: true},
				transform: {
					react: {
						runtime: 'automatic' as const,
						development: environment === 'development',
						refresh: environment === 'development',
					},
				},
			},
			env: {targets: 'Chrome >= 85'},
		},
	};

	// Rspack config is structurally compatible with webpack config at runtime,
	// but the TypeScript types differ. Cast through `any` for the override.
	const conf = (await webpackOverride({
		...getBaseConfig(environment, poll),
		ignoreWarnings: [/"__dirname" is used and has been mocked/],
		node: {
			// Suppress the warning in `source-map`
			__dirname: 'mock',
		},
		entry: [
			require.resolve('./setup-environment'),
			userDefinedComponent,
			require.resolve('../react-shim.js'),
			entry,
		].filter(Boolean) as [string, ...string[]],
		mode: environment,
		plugins:
			environment === 'development'
				? [
						new ReactRefreshPlugin({overlay: false}),
						new rspack.HotModuleReplacementPlugin(),
						define,
					]
				: [
						new ProgressPlugin((p: number) => {
							if (onProgress) {
								if ((p === 1 && p > lastProgress) || p - lastProgress > 0.05) {
									lastProgress = p;
									onProgress(Number((p * 100).toFixed(2)));
								}
							}
						}),
						define,
					],
		output: getOutputConfig(environment),
		resolve: getResolveConfig(),
		module: {
			rules: [
				...getSharedModuleRules(),
				{
					test: /\.tsx?$/,
					use: [swcLoaderRule],
				},
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					use: [swcLoaderRuleJsx],
				},
			],
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} as any)) as RspackConfiguration;

	const [hash, finalConf] = computeHashAndFinalConfig(conf, {
		enableCaching,
		environment,
		outDir,
		remotionRoot,
	});
	return [hash, finalConf as unknown as RspackConfiguration];
};

export const createRspackCompiler = (config: RspackConfiguration) => {
	return rspack(config);
};
