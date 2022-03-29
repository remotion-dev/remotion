import path from 'path';
import {Internals, WebpackConfiguration, WebpackOverrideFn} from 'remotion';
import webpack, {ProgressPlugin} from 'webpack';
import {LoaderOptions} from './esbuild-loader/interfaces';
import {ReactFreshWebpackPlugin} from './fast-refresh';
import {getWebpackCacheName} from './webpack-cache';
import esbuild = require('esbuild');

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
	inputProps,
	envVariables,
	maxTimelineTracks,
}: {
	entry: string;
	userDefinedComponent: string;
	outDir: string;
	environment: 'development' | 'production';
	webpackOverride?: WebpackOverrideFn;
	onProgressUpdate?: (f: number) => void;
	enableCaching?: boolean;
	inputProps?: object;
	envVariables?: Record<string, string>;
	maxTimelineTracks: number;
}): WebpackConfiguration => {
	return webpackOverride({
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
		cache: enableCaching
			? {
					type: 'filesystem',
					name: getWebpackCacheName(environment, inputProps ?? {}),
			  }
			: false,
		devtool:
			environment === 'development'
				? 'cheap-module-source-map'
				: 'cheap-module-source-map',
		entry: [
			require.resolve('./setup-environment'),
			environment === 'development'
				? require.resolve('./hot-middleware/client')
				: null,
			environment === 'development'
				? require.resolve('./fast-refresh/runtime.js')
				: null,
			environment === 'development'
				? require.resolve('./error-overlay/entry-basic.js')
				: null,

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
							'process.env.INPUT_PROPS': JSON.stringify(inputProps ?? {}),
							[`process.env.${Internals.ENV_VARIABLES_ENV_NAME}`]:
								JSON.stringify(envVariables ?? {}),
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
			path: outDir,
			devtoolModuleFilenameTemplate: '[resource-path]',
		},
		devServer: {
			contentBase: path.resolve(__dirname, '..', 'web'),
			historyApiFallback: true,
			hot: true,
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.jsx'],
			alias: {
				// Only one version of react
				'react/jsx-runtime': require.resolve('react/jsx-runtime'),
				react: require.resolve('react'),
				remotion: require.resolve('remotion'),
				'react-native$': 'react-native-web',
			},
		},
		module: {
			rules: [
				{
					test: /\.css$/i,
					use: [require.resolve('style-loader'), require.resolve('css-loader')],
				},
				{
					test: /\.(png|svg|jpg|jpeg|webp|gif|bmp|webm|mp4|mov|mp3|m4a|wav|aac)$/,
					use: [
						{
							loader: require.resolve('file-loader'),
							options: {
								// default md4 not available in node17
								hashType: 'md5',
								// So you can do require('hi.png')
								// instead of require('hi.png').default
								esModule: false,
								name: () => {
									// Don't rename files in development
									// so we can show the filename in the timeline
									if (environment === 'development') {
										return '[path][name].[ext]';
									}

									return '[md5:contenthash].[ext]';
								},
							},
						},
					],
				},
				{
					test: /\.tsx?$/,
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
				{
					test: /\.(woff(2)?|otf|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
					use: [
						{
							loader: require.resolve('file-loader'),
							options: {
								// default md4 not available in node17
								name: '[name].[ext]',
								outputPath: 'fonts/',
							},
						},
					],
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
				{
					test: /\.js$/,
					enforce: 'pre',
					use: [require.resolve('source-map-loader')],
				},
			],
		},
		ignoreWarnings: [/Failed to parse source map/],
	});
};
