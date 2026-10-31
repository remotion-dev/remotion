import {getStudioEntryPoints} from '@remotion/studio-shared/studio-entry-points';
import type {ReactRefreshRspackPlugin as ReactRefreshRspackPluginType} from '@rspack/plugin-react-refresh';
import {getRspack} from './get-rspack';
import {AllowOptionalDependenciesPlugin} from './optional-dependencies';
import type {
	BundlerOverrideFn,
	RspackConfiguration,
	RspackOverrideFn,
} from './override-types';
import {getReactScanEntryPoint} from './react-scan-entry-point';
import {
	computeHashAndFinalConfig,
	getBaseConfig,
	getOutputConfig,
	getResolveConfig,
	getSharedModuleRules,
	transformersImportMetaWarning,
} from './shared-bundler-config';

export type {RspackConfiguration, RspackOverrideFn} from './override-types';

export const rspackConfig = async ({
	entry,
	userDefinedComponent,
	outDir,
	environment,
	bundlerOverride = (f) => f,
	rspackOverride = (f) => f,
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
	bundlerOverride: BundlerOverrideFn;
	rspackOverride: RspackOverrideFn;
	onProgress?: (f: number) => void;
	enableCaching?: boolean;
	remotionRoot: string;
	poll: number | null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	extraPlugins: any[];
}): Promise<[string, RspackConfiguration]> => {
	const {ProgressPlugin, rspack} = getRspack();
	const ReactRefreshRspackPlugin =
		environment === 'development'
			? (require('@rspack/plugin-react-refresh')
					.ReactRefreshRspackPlugin as typeof ReactRefreshRspackPluginType)
			: null;
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

	const sharedBaseConfig = getBaseConfig(environment, poll, 'rspack');
	const baseConfig = {
		...sharedBaseConfig,
		optimization: {
			...sharedBaseConfig.optimization,
			// The optional dependency plugin removes expected resolution errors after
			// compilation. Rspack must emit their throwing fallback chunks first.
			emitOnErrors: true,
		},
		experiments: {
			nativeWatcher: true,
		},
		...(environment === 'development'
			? // Makes the first HMR event faster.
				{incremental: {buildChunkGraph: true}}
			: {}),
		ignoreWarnings: [transformersImportMetaWarning],
		node: {
			// Suppress the warning in `source-map`
			__dirname: 'mock',
			__filename: 'mock',
		},
		entry: getStudioEntryPoints({
			fastRefreshRuntime:
				environment === 'development'
					? require.resolve('./fast-refresh/notify-on-refresh.js')
					: null,
			reactScan: getReactScanEntryPoint(environment),
			environmentSetup: require.resolve('./setup-environment'),
			sequenceStackTraces: require.resolve('./setup-sequence-stack-traces'),
			studioBootstrap:
				environment === 'development'
					? require.resolve('./setup-studio')
					: null,
			userDefinedComponent,
			reactShim: require.resolve('../react-shim.js'),
			studioRenderEntry: entry,
		}),
		mode: environment,
		plugins: ReactRefreshRspackPlugin
			? [
					new ReactRefreshRspackPlugin(),
					new rspack.HotModuleReplacementPlugin(),
					new AllowOptionalDependenciesPlugin(),
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
					new AllowOptionalDependenciesPlugin(),
				],
		output: getOutputConfig(environment),
		resolve: getResolveConfig(),
		module: {
			rules: [
				...getSharedModuleRules(),
				...(environment === 'development'
					? [
							{
								test: /[\\/]@rspack[\\/]plugin-react-refresh[\\/]client[\\/]refreshUtils\.js$/,
								enforce: 'pre' as const,
								use: [
									require.resolve('./fast-refresh/zero-delay-rspack-refresh-loader.js'),
								],
							},
						]
					: []),
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
	} as RspackConfiguration;
	const sharedConfig = await bundlerOverride(baseConfig, {bundler: 'rspack'});
	const conf = await rspackOverride(sharedConfig as RspackConfiguration);

	const [hash, finalConf] = computeHashAndFinalConfig(conf, {
		bundler: 'rspack',
		enableCaching,
		environment,
		outDir,
		remotionRoot,
	});
	return [hash, finalConf as unknown as RspackConfiguration];
};

export const createRspackCompiler = (config: RspackConfiguration) => {
	return getRspack().rspack(config);
};
