import path from 'path';
import webpack from 'webpack';

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
}: {
	entry: string;
	userDefinedComponent: string;
	outDir: string;
	environment: 'development' | 'production';
}): webpack.Configuration & {
	devServer: {
		contentBase: string;
		historyApiFallback: {
			index: string;
		};
		hot: true;
	};
} => ({
	optimization: {
		minimize: false,
	},
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
			: [],
	output: {
		globalObject: 'this',
		filename: 'bundle.js',
		path: outDir,
	},
	devServer: {
		contentBase: path.resolve(__dirname, '..', 'web'),
		historyApiFallback: {
			index: 'index.html',
		},
		hot: true,
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
		alias: {
			// Only one version of react
			'react/jsx-runtime': require.resolve('react/jsx-runtime'),
			react: require.resolve('react'),
			recoil: require.resolve('recoil'),
		},
	},
	module: {
		rules: [
			{
				test: /\.(png|svg|jpg|gif|webm|mp4)$/,
				use: [require.resolve('file-loader')],
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
		],
	},
});
