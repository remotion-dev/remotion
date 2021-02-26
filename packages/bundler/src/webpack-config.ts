import path from 'path';
import {WebpackConfiguration, WebpackOverrideFn} from 'remotion';
import webpack, {ProgressPlugin} from 'webpack';

const ErrorOverlayPlugin = require('@webhotelier/webpack-fast-refresh/error-overlay');
const ReactRefreshPlugin = require('@webhotelier/webpack-fast-refresh');

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;
export function truthy<T>(value: T): value is Truthy<T> {
	return Boolean(value);
}

export const webpackConfig = ({
	entry,
	userDefinedComponent,
	outDir,
	environment,
	webpackOverride = (f) => f,
	onProgressUpdate,
}: {
	entry: string;
	userDefinedComponent: string;
	outDir: string;
	environment: 'development' | 'production';
	webpackOverride?: WebpackOverrideFn;
	onProgressUpdate?: (f: number) => void;
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
		devtool: 'cheap-module-source-map',
		entry: [
			environment === 'development'
				? require.resolve('webpack-hot-middleware/client') + '?overlay=true'
				: null,
			environment === 'development'
				? require.resolve('@webhotelier/webpack-fast-refresh/runtime.js')
				: null,
			userDefinedComponent,
			entry,
		].filter(Boolean) as [string, ...string[]],
		mode: environment,
		plugins:
			environment === 'development'
				? [
						new ErrorOverlayPlugin(),
						new ReactRefreshPlugin(),
						new webpack.HotModuleReplacementPlugin(),
				  ]
				: [
						new ProgressPlugin((p) => {
							if (onProgressUpdate) {
								onProgressUpdate(Number((p * 100).toFixed(2)));
							}
						}),
				  ],
		output: {
			globalObject: 'this',
			filename: 'bundle.js',
			path: outDir,
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
				'styled-components': require.resolve('styled-components'),
				'react-native$': 'react-native-web',
			},
		},
		module: {
			rules: [
				{
					test: /\.(woff|woff2)$/,
					use: {
						loader: 'url-loader',
					},
				},
				{
					test: /\.css$/i,
					use: ['style-loader', 'css-loader'],
				},
				{
					test: /\.(png|svg|jpg|jpeg|webp|gif|bmp|webm|mp4|mp3|wav|aac)$/,
					use: [
						{
							loader: require.resolve('file-loader'),
							options: {
								// So you can do require('hi.png')
								// instead of require('hi.png').default
								esModule: false,
								name: () => {
									// Don't rename files in development
									// so we can show the filename in the timeline
									if (environment === 'development') {
										return '[path][name].[ext]';
									}

									return '[contenthash].[ext]';
								},
							},
						},
					],
				},
				{
					test: /\.tsx?$/,
					use: [
						{
							loader: require.resolve('babel-loader'),
							options: {
								presets: [
									require.resolve('@babel/preset-env'),
									[
										require.resolve('@babel/preset-react'),
										{
											runtime: 'automatic',
										},
									],
									[
										require.resolve('@babel/preset-typescript'),
										{
											runtime: 'automatic',
											isTSX: true,
											allExtensions: true,
										},
									],
								],
								plugins: [
									require.resolve('@babel/plugin-proposal-class-properties'),
									environment === 'development'
										? require.resolve('react-refresh/babel')
										: null,
								].filter(truthy),
							},
						},
						environment === 'development'
							? {
									loader: require.resolve(
										'@webhotelier/webpack-fast-refresh/loader.js'
									),
							  }
							: null,
					].filter(truthy),
				},
				{
					test: /\.jsx?$/,
					loader: require.resolve('babel-loader'),
					options: {
						presets: [
							require.resolve('@babel/preset-env'),
							[
								require.resolve('@babel/preset-react'),
								{
									runtime: 'automatic',
								},
							],
						],
						plugins: [
							require.resolve('@babel/plugin-proposal-class-properties'),
						],
					},
				},
			],
		},
	});
};
