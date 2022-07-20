import {createHash} from 'crypto';
import ReactDOM from 'react-dom';
import type {WebpackConfiguration, WebpackOverrideFn} from 'remotion';
import {Internals} from 'remotion';
import webpack, {ProgressPlugin} from 'webpack';
import type {LoaderOptions} from './esbuild-loader/interfaces';
import {ReactFreshWebpackPlugin} from './fast-refresh';
import {getWebpackCacheName} from './webpack-cache';
import esbuild = require('esbuild');

if (!ReactDOM || !ReactDOM.version) {
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
	onProgressUpdate,
	enableCaching = Internals.DEFAULT_WEBPACK_CACHE_ENABLED,
	envVariables,
	maxTimelineTracks,
	entryPoints,
}: {
	entry: string;
	userDefinedComponent: string;
	outDir: string;
	environment: 'development' | 'production';
	webpackOverride: WebpackOverrideFn;
	onProgressUpdate?: (f: number) => void;
	enableCaching?: boolean;
	envVariables: Record<string, string>;
	maxTimelineTracks: number;
	entryPoints: string[];
}): [string, WebpackConfiguration] => {
	const conf: webpack.Configuration = {
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
			aggregateTimeout: 0,
			ignored: ['**/.git/**', '**/node_modules/**'],
		},

		devtool:
			environment === 'development'
				? 'cheap-module-source-map'
				: 'cheap-module-source-map',
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
							[`process.env.${Internals.ENV_VARIABLES_ENV_NAME}`]:
								JSON.stringify(envVariables),
						}),
				  ]
				: [
						new ProgressPlugin((p) => {
							if (onProgressUpdate) {
								onProgressUpdate(Number((p * 100).toFixed(2)));
							}
						}),
				  ],
		output: {
			hashFunction: 'xxhash64',
			globalObject: 'this',
			filename: 'bundle.js',
			devtoolModuleFilenameTemplate: '[resource-path]',
			assetModuleFilename:
				environment === 'development' ? '[path][name][ext]' : '[hash][ext]',
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.jsx'],
			alias: {
				// Only one version of react
				'react/jsx-runtime': require.resolve('react/jsx-runtime'),
				react: require.resolve('react'),
				'react-dom/client': shouldUseReactDomClient
					? require.resolve('react-dom/client')
					: require.resolve('react-dom'),
				remotion: require.resolve('remotion'),
				'react-native$': 'react-native-web',
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
	};
	const hash = createHash('md5').update(JSON.stringify(conf)).digest('hex');
	return [
		hash,
		webpackOverride({
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
				path: outDir,
			},
		}),
	];
};
