import path from 'path';
import webpack from 'webpack';

const ErrorOverlayPlugin = require('@webhotelier/webpack-fast-refresh/error-overlay');
const ReactRefreshPlugin = require('@webhotelier/webpack-fast-refresh');

export const webpackConfig = ({
	entry,
	userDefinedComponent,
	outDir,
}: {
	entry: string;
	userDefinedComponent: string;
	outDir: string;
}): webpack.Configuration & {
	devServer: {
		contentBase: string;
		historyApiFallback: {
			index: string;
		};
		hot: true;
	};
} => ({
	entry: [
		path.resolve(
			__dirname,
			'..',
			'node_modules',
			'webpack-hot-middleware/client'
		),
		require.resolve('@webhotelier/webpack-fast-refresh/runtime.js'),
		userDefinedComponent,
		entry,
	],
	mode: 'development',
	plugins: [
		new ReactRefreshPlugin(),
		new ErrorOverlayPlugin(),
		new webpack.HotModuleReplacementPlugin(),
	],
	output: {
		filename: 'bundle.js',
		publicPath: '/',
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
			react: require.resolve('react'),
			recoil: require.resolve('recoil'),
		},
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: require.resolve('babel-loader'),
						options: {
							presets: [
								require.resolve('@babel/preset-env'),
								require.resolve('@babel/preset-react'),
								[
									require.resolve('@babel/preset-typescript'),
									{
										runtime: 'automatic',
										isTSX: true,
										allExtensions: true,
									},
								],
							],
							plugins: [require.resolve('react-refresh/babel')],
						},
					},
					{
						loader: require.resolve(
							'@webhotelier/webpack-fast-refresh/loader.js'
						),
					},
				],
			},
		],
	},
});
