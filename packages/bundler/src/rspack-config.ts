import {getStudioEntryPoints} from '@remotion/studio-shared/studio-entry-points';
import type {Configuration} from '@rspack/core';
import {ProgressPlugin, rspack} from '@rspack/core';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
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
	remotionRoot,
	poll,
	extraPlugins,
}: {
	entry: string;
	userDefinedComponent: string;
	outDir: string | null;
	environment: 'development' | 'production';
	webpackOverride: WebpackOverrideFn;
	onProgress?: (f: number) => void;
	enableCaching?: boolean;
	remotionRoot: string;
	poll: number | null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	extraPlugins: any[];
}): Promise<[string, RspackConfiguration]> => {
	let lastProgress = 0;

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
		node: {
			// Suppress the warning in `source-map`
			__dirname: 'mock',
			__filename: 'mock',
		},
		entry: getStudioEntryPoints({
			fastRefreshRuntime: null,
			environmentSetup: require.resolve('./setup-environment'),
			sequenceStackTraces:
				environment === 'development'
					? require.resolve('./setup-sequence-stack-traces')
					: null,
			userDefinedComponent,
			reactShim: require.resolve('../react-shim.js'),
			studioRenderEntry: entry,
		}),
		mode: environment,
		plugins:
			environment === 'development'
				? [
						new ReactRefreshPlugin({overlay: false}),
						new rspack.HotModuleReplacementPlugin(),
						...extraPlugins,
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
					],
		output: getOutputConfig(environment),
		resolve: getResolveConfig(),
		module: {
			rules: [
				...getSharedModuleRules(),
				{
					// Emscripten's main.js spawns Workers of itself via
					// new Worker(new URL('./main.js', import.meta.url)).
					// This creates a circular chunk dependency that breaks HMR when `@remotion/whisper-web` is used.
					// TODO: whisper-web does not work in Studio with Rspack, also not with Webpack.
					// Disable Worker detection so rspack doesn't create a
					// worker chunk; the new URL() is still handled as an asset.
					test: /[\\/]whisper-web[\\/]main\.js$/,
					parser: {
						worker: false,
					},
				},
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
