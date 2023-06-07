import {createHash} from 'node:crypto';
import ReactDOM from 'react-dom';
import webpack, {ProgressPlugin} from 'webpack';
import type {LoaderOptions} from './esbuild-loader/interfaces';
import {ReactFreshWebpackPlugin} from './fast-refresh';
import {jsonStringifyWithCircularReferences} from './stringify-with-circular-references';
import {getWebpackCacheName} from './webpack-cache';
import esbuild = require('esbuild');

import {Internals} from 'remotion';
import type {Configuration} from 'webpack';
import {AllowOptionalDependenciesPlugin} from './optional-dependencies';
export type WebpackConfiguration = Configuration;

export type WebpackOverrideFn = (
	currentConfiguration: WebpackConfiguration
) => WebpackConfiguration;

if (!ReactDOM?.version) {
	throw new Error('Could not find "react-dom" package. Did you install it?');
}

const reactDomVersion = ReactDOM.version.split('.')[0];
if (reactDomVersion === '0') {
	throw new Error(
		`Version ${reactDomVersion} of "react-dom" is not supported by Remotion`
	);
}

const shouldUseReactDomClient = parseInt(reactDomVersion, 10) >= 18;

const esbuildLoaderOptions: LoaderOptions = {
	target: 'chrome85',
	loader: 'tsx',
	implementation: esbuild,
};

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;

function truthy<T>(value: T): value is Truthy<T> {
	return Boolean(value);
}

export const webpackConfig = ({
	entry,
	userDefinedComponent,
	outDir,
	environment,
	webpackOverride = (f) => f,
	onProgress,
	enableCaching = true,
	maxTimelineTracks,
	entryPoints,
	remotionRoot,
	keyboardShortcutsEnabled,
	poll,
}: {
	entry: string;
	userDefinedComponent: string;
	outDir: string | null;
	environment: 'development' | 'production';
	webpackOverride: WebpackOverrideFn;
	onProgress?: (f: number) => void;
	enableCaching?: boolean;
	maxTimelineTracks: number;
	keyboardShortcutsEnabled: boolean;
	entryPoints: string[];
	remotionRoot: string;
	poll: number | null;
}): [string, WebpackConfiguration] => {
	const conf: WebpackConfiguration = webpackOverride({
		optimization: {
			minimize: false,
		},
		experiments: {
			lazyCompilation:
				environment === 'production'
					? false
					: {
							entries: false,
					  },
		},
		watchOptions: {
			poll: poll ?? undefined,
			aggregateTimeout: 0,
			ignored: ['**/.git/**', '**/node_modules/**'],
		},

		devtool: 'cheap-module-source-map',
		entry: [
			// Fast Refresh must come first,
			// because setup-environment imports ReactDOM.
			// If React DOM is imported before Fast Refresh, Fast Refresh does not work
			environment === 'development'
				? require.resolve('./fast-refresh/runtime.js')
				: null,
			require.resolve('./setup-environment'),
			...entryPoints,
			userDefinedComponent,
			require.resolve('../react-shim.js'),
			entry,
		].filter(Boolean) as [string, ...string[]],
		mode: environment,
		plugins:
			environment === 'development'
				? [
						new ReactFreshWebpackPlugin(),
						new webpack.HotModuleReplacementPlugin(),
						new webpack.DefinePlugin({
							'process.env.MAX_TIMELINE_TRACKS': maxTimelineTracks,
							'process.env.KEYBOARD_SHORTCUTS_ENABLED':
								keyboardShortcutsEnabled,
						}),
						new AllowOptionalDependenciesPlugin(),
				  ]
				: [
						new ProgressPlugin((p) => {
							if (onProgress) {
								onProgress(Number((p * 100).toFixed(2)));
							}
						}),
						new AllowOptionalDependenciesPlugin(),
				  ],
		output: {
			hashFunction: 'xxhash64',
			filename: Internals.bundleName,
			devtoolModuleFilenameTemplate: '[resource-path]',
			assetModuleFilename:
				environment === 'development' ? '[path][name][ext]' : '[hash][ext]',
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.web.js', '.js', '.jsx'],
			alias: {
				// Only one version of react
				'react/jsx-runtime': require.resolve('react/jsx-runtime'),
				react: require.resolve('react'),
				'react-dom/client': shouldUseReactDomClient
					? require.resolve('react-dom/client')
					: require.resolve('react-dom'),
				remotion: require.resolve('remotion'),
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
