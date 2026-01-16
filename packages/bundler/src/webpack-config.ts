import {createHash} from 'node:crypto';
import path from 'node:path';
import ReactDOM from 'react-dom';
import {NoReactInternals} from 'remotion/no-react';
import type {Configuration} from 'webpack';
import webpack, {ProgressPlugin} from 'webpack';
import {CaseSensitivePathsPlugin} from './case-sensitive-paths';
import type {LoaderOptions} from './esbuild-loader/interfaces';
import {ReactFreshWebpackPlugin} from './fast-refresh';
import {AllowDependencyExpressionPlugin} from './hide-expression-dependency';
import {IgnorePackFileCacheWarningsPlugin} from './ignore-packfilecache-warnings';
import {AllowOptionalDependenciesPlugin} from './optional-dependencies';
import {jsonStringifyWithCircularReferences} from './stringify-with-circular-references';
import {getWebpackCacheName} from './webpack-cache';
import esbuild = require('esbuild');
export type WebpackConfiguration = Configuration;

export type WebpackOverrideFn = (
	currentConfiguration: WebpackConfiguration,
) => WebpackConfiguration | Promise<WebpackConfiguration>;

if (!ReactDOM?.version) {
	throw new Error('Could not find "react-dom" package. Did you install it?');
}

const reactDomVersion = ReactDOM.version.split('.')[0];
if (reactDomVersion === '0') {
	throw new Error(
		`Version ${reactDomVersion} of "react-dom" is not supported by Remotion`,
	);
}

const shouldUseReactDomClient = NoReactInternals.ENABLE_V5_BREAKING_CHANGES
	? true
	: parseInt(reactDomVersion, 10) >= 18;

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
	disableAskAI
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
	disableAskAI: boolean,
	experimentalClientSideRenderingEnabled: boolean;
}): Promise<[string, WebpackConfiguration]> => {
	const esbuildLoaderOptions: LoaderOptions = {
		target: 'chrome85',
		loader: 'tsx',
		implementation: esbuild,
		remotionRoot,
	};

	let lastProgress = 0;

	const isBun = typeof Bun !== 'undefined';

	const define = new webpack.DefinePlugin({
		'process.env.MAX_TIMELINE_TRACKS': maxTimelineTracks,
		'process.env.DISABLE_ASK_AI': disableAskAI,
		'process.env.KEYBOARD_SHORTCUTS_ENABLED': keyboardShortcutsEnabled,
		'process.env.BUFFER_STATE_DELAY_IN_MILLISECONDS':
			bufferStateDelayInMilliseconds,
		'process.env.EXPERIMENTAL_CLIENT_SIDE_RENDERING_ENABLED':
			experimentalClientSideRenderingEnabled,
	});

	const conf: WebpackConfiguration = await webpackOverride({
		optimization: {
			minimize: false,
		},
		experiments: {
			lazyCompilation: isBun
				? false
				: environment === 'production'
					? false
					: {
							entries: false,
						},
		},
		watchOptions: {
			poll: poll ?? undefined,
			aggregateTimeout: 0,
			ignored: ['**/.git/**', '**/.turbo/**', '**/node_modules/**'],
		},
		// Higher source map quality in development to power line numbers for stack traces
		devtool:
			environment === 'development' ? 'source-map' : 'cheap-module-source-map',
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
		output: {
			hashFunction: 'xxhash64',
			filename: NoReactInternals.bundleName,
			devtoolModuleFilenameTemplate: '[resource-path]',
			assetModuleFilename:
				environment === 'development' ? '[path][name][ext]' : '[hash][ext]',
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.web.js', '.js', '.jsx', '.mjs', '.cjs'],
			alias: {
				// Only one version of react
				'react/jsx-runtime': require.resolve('react/jsx-runtime'),
				'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
				react: require.resolve('react'),
				// Needed to not fail on this: https://github.com/remotion-dev/remotion/issues/5045
				'remotion/no-react': path.resolve(
					require.resolve('remotion'),
					'..',
					'..',
					'esm',
					'no-react.mjs',
				),
				remotion: path.resolve(
					require.resolve('remotion'),
					'..',
					'..',
					'esm',
					'index.mjs',
				),

				'@remotion/media-parser/worker': path.resolve(
					require.resolve('@remotion/media-parser'),
					'..',
					'esm',
					'worker.mjs',
				),
				// test visual controls before removing this
				'@remotion/studio': require.resolve('@remotion/studio'),
				'react-dom/client': shouldUseReactDomClient
					? require.resolve('react-dom/client')
					: require.resolve('react-dom'),
			},
		},
		module: {
			rules: [
				{
					test: /\.css$/i,
					use: [require.resolve('style-loader'), require.resolve('css-loader')],
					type: 'javascript/auto',
				},
				{
					test: /\.(png|svg|jpg|jpeg|webp|gif|bmp|webm|mp4|mov|mp3|m4a|wav|aac)$/,
					type: 'asset/resource',
				},
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
					test: /\.(woff(2)?|otf|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
					type: 'asset/resource',
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
	const hash = createHash('md5')
		.update(jsonStringifyWithCircularReferences(conf))
		.digest('hex');
	return [
		hash,
		{
			...conf,
			cache: enableCaching
				? {
						type: 'filesystem',
						name: getWebpackCacheName(environment, hash),
						version: hash,
					}
				: false,
			output: {
				...conf.output,
				...(outDir ? {path: outDir} : {}),
			},
			context: remotionRoot,
		},
	];
};
