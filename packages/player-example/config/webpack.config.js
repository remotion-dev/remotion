'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const paths = require('./paths');
const modules = require('./modules');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const createEnvironmentHash = require('./webpack/persistentCache/createEnvironmentHash');

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

const reactRefreshRuntimeEntry = require.resolve('react-refresh/runtime');
const reactRefreshWebpackPluginRuntimeEntry = require.resolve(
	'@pmmmwh/react-refresh-webpack-plugin'
);

// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';

const imageInlineSizeLimit = parseInt(
	process.env.IMAGE_INLINE_SIZE_LIMIT || '10000',
	10
);

// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig);

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
// eslint-disable-next-line complexity
module.exports = function (webpackEnv) {
	const isEnvDevelopment = webpackEnv === 'development';
	const isEnvProduction = webpackEnv === 'production';

	// Variable used for enabling profiling in Production
	// passed into alias object. Uses a flag if passed into the build command
	const isEnvProductionProfile =
		isEnvProduction && process.argv.includes('--profile');

	// We will provide `paths.publicUrlOrPath` to our app
	// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
	// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
	// Get environment variables to inject into our app.
	const publicUrl = paths.publicUrlOrPath.slice(0, -1);
	const env = {
		// Useful for determining whether we’re running in production mode.
		// Most importantly, it switches React into the correct mode.
		NODE_ENV: process.env.NODE_ENV || 'development',
		// Useful for resolving the correct path to static assets in `public`.
		// For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
		// This should only be used as an escape hatch. Normally you would put
		// images into the `src` and `import` them in code to get their paths.
		PUBLIC_URL: publicUrl,
		// We support configuring the sockjs pathname during development.
		// These settings let a developer run multiple simultaneous projects.
		// They are used as the connection `hostname`, `pathname` and `port`
		// in webpackHotDevClient. They are used as the `sockHost`, `sockPath`
		// and `sockPort` options in webpack-dev-server.
		WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
		WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
		WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
		// Whether or not react-refresh is enabled.
		// It is defined here so it is available in the webpackHotDevClient.
		FAST_REFRESH: process.env.FAST_REFRESH !== 'false',
	};

	const shouldUseReactRefresh = env.FAST_REFRESH;

	return {
		target: ['browserslist'],
		// Webpack noise constrained to errors and warnings
		stats: 'errors-warnings',
		mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
		// Stop compilation early in production
		bail: isEnvProduction,
		devtool: isEnvProduction
			? shouldUseSourceMap
				? 'source-map'
				: false
			: isEnvDevelopment && 'cheap-module-source-map',
		// These are the "entry points" to our application.
		// This means they will be the "root" imports that are included in JS bundle.
		entry: [require.resolve('../src/react-shim.js'), paths.appIndexJs],
		output: {
			// The build folder.
			path: paths.appBuild,
			// Add /* filename */ comments to generated require()s in the output.
			pathinfo: isEnvDevelopment,
			// There will be one main bundle, and one file per asynchronous chunk.
			// In development, it does not produce real files.
			filename: isEnvProduction
				? 'static/js/[name].[contenthash:8].js'
				: isEnvDevelopment && 'static/js/bundle.js',
			// There are also additional JS chunk files if you use code splitting.
			chunkFilename: isEnvProduction
				? 'static/js/[name].[contenthash:8].chunk.js'
				: isEnvDevelopment && 'static/js/[name].chunk.js',
			assetModuleFilename: 'static/media/[name].[hash][ext]',
			// Webpack uses `publicPath` to determine where the app is being served from.
			// It requires a trailing slash, or the file assets will get an incorrect path.
			// We inferred the "public path" (such as / or /my-project) from homepage.
			publicPath: paths.publicUrlOrPath,
			// Point sourcemap entries to original disk location (format as URL on Windows)
			devtoolModuleFilenameTemplate: isEnvProduction
				? (info) =>
						path
							.relative(paths.appSrc, info.absoluteResourcePath)
							.replace(/\\/g, '/')
				: isEnvDevelopment &&
				  ((info) =>
						path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
		},
		cache: {
			type: 'filesystem',
			version: createEnvironmentHash(env),
			cacheDirectory: paths.appWebpackCache,
			store: 'pack',
			buildDependencies: {
				defaultWebpack: ['webpack/lib/'],
				config: [__filename],
				tsconfig: [paths.appTsConfig, paths.appJsConfig].filter((f) =>
					fs.existsSync(f)
				),
			},
		},
		infrastructureLogging: {
			level: 'none',
		},
		optimization: {
			minimize: isEnvProduction,
		},
		resolve: {
			// This allows you to set a fallback for where webpack should look for modules.
			// We placed these paths second because we want `node_modules` to "win"
			// if there are any conflicts. This matches Node resolution mechanism.
			// https://github.com/facebook/create-react-app/issues/253
			modules: ['node_modules', paths.appNodeModules].concat(
				modules.additionalModulePaths || []
			),
			// These are the reasonable defaults supported by the Node ecosystem.
			// We also include JSX as a common component filename extension to support
			// some tools, although we do not recommend using it, see:
			// https://github.com/facebook/create-react-app/issues/290
			// `web` extension prefixes have been added for better support
			// for React Native Web.
			extensions: paths.moduleFileExtensions
				.map((ext) => `.${ext}`)
				.filter((ext) => useTypeScript || !ext.includes('ts')),
			alias: {
				// Support React Native Web
				// https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
				'react-native': 'react-native-web',
				// Allows for better profiling with ReactDevTools
				...(isEnvProductionProfile && {
					'react-dom$': 'react-dom/profiling',
					'scheduler/tracing': 'scheduler/tracing-profiling',
				}),
				...(modules.webpackAliases || {}),
			},
			plugins: [
				// Prevents users from importing files from outside of src/ (or node_modules/).
				// This often causes confusion because we only process files within src/ with babel.
				// To fix this, we prevent you from importing files out of src/ -- if you'd like to,
				// please link the files into your node_modules/ and let module-resolution kick in.
				// Make sure your source files are compiled, as they will not be processed in any way.
				new ModuleScopePlugin(paths.appSrc, [
					paths.appPackageJson,
					reactRefreshRuntimeEntry,
					reactRefreshWebpackPluginRuntimeEntry,
				]),
			],
		},
		module: {
			strictExportPresence: true,
			rules: [
				{
					// "oneOf" will traverse all following loaders until one will
					// match the requirements. When no loader matches it will fall
					// back to the "file" loader at the end of the loader list.
					oneOf: [
						// TODO: Merge this config once `image/avif` is in the mime-db
						// https://github.com/jshttp/mime-db
						{
							test: [/\.avif$/],
							type: 'asset',
							mimetype: 'image/avif',
							parser: {
								dataUrlCondition: {
									maxSize: imageInlineSizeLimit,
								},
							},
						},
						// "url" loader works like "file" loader except that it embeds assets
						// smaller than specified limit in bytes as data URLs to avoid requests.
						// A missing `test` is equivalent to a match.
						{
							test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
							type: 'asset',
							parser: {
								dataUrlCondition: {
									maxSize: imageInlineSizeLimit,
								},
							},
						},
						// Process application JS with Babel.
						// The preset includes JSX, Flow, TypeScript, and some ESnext features.
						{
							test: /\.(js|mjs|jsx|ts|tsx)$/,
							include: paths.appSrc,
							loader: require.resolve(
								'@remotion/bundler/dist/esbuild-loader/index.js'
							),
							options: {
								target: 'chrome85',
								loader: 'tsx',
								implementation: require('esbuild'),
							},
						},
						// Process any JS outside of the app with Babel.
						// Unlike the application JS, we only compile the standard ES features.
						{
							test: /\.(js|mjs)$/,
							exclude: /@babel(?:\/|\\{1,2})runtime/,
							loader: require.resolve(
								'@remotion/bundler/dist/esbuild-loader/index.js'
							),
							options: {
								target: 'chrome85',
								loader: 'tsx',
								implementation: require('esbuild'),
							},
						},

						// "file" loader makes sure those assets get served by WebpackDevServer.
						// When you `import` an asset, you get its (virtual) filename.
						// In production, they would get copied to the `build` folder.
						// This loader doesn't use a "test" so it will catch all modules
						// that fall through the other loaders.
						{
							// Exclude `js` files to keep "css" loader working as it injects
							// its runtime that would otherwise be processed through "file" loader.
							// Also exclude `html` and `json` extensions so they get processed
							// by webpacks internal loaders.
							exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
							type: 'asset/resource',
						},
						// ** STOP ** Are you adding a new loader?
						// Make sure to add the new loader(s) before the "file" loader.
					],
				},
			].filter(Boolean),
		},
		plugins: [
			// Generates an `index.html` file with the <script> injected.
			new HtmlWebpackPlugin({
				inject: true,
				template: paths.appHtml,
				...(isEnvProduction
					? {
							minify: {
								removeComments: true,
								collapseWhitespace: true,
								removeRedundantAttributes: true,
								useShortDoctype: true,
								removeEmptyAttributes: true,
								removeStyleLinkTypeAttributes: true,
								keepClosingSlash: true,
								minifyJS: true,
								minifyCSS: true,
								minifyURLs: true,
							},
					  }
					: undefined),
			}),
			// Inlines the webpack runtime script. This script is too small to warrant
			// a network request.
			// https://github.com/facebook/create-react-app/issues/5358
			isEnvProduction &&
				shouldInlineRuntimeChunk &&
				new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
			// Makes some environment variables available in index.html.
			// The public URL is available as %PUBLIC_URL% in index.html, e.g.:
			// <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
			// It will be an empty string unless you specify "homepage"
			// in `package.json`, in which case it will be the pathname of that URL.
			new InterpolateHtmlPlugin(HtmlWebpackPlugin, env),
			// This gives some necessary context to module not found errors, such as
			// the requesting resource.
			new ModuleNotFoundPlugin(paths.appPath),
			// Makes some environment variables available to the JS code, for example:
			// if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
			// It is absolutely essential that NODE_ENV is set to production
			// during a production build.
			// Otherwise React will be compiled in the very slow development mode.
			new webpack.DefinePlugin(env),
			// Experimental hot reloading for React .
			// https://github.com/facebook/react/tree/main/packages/react-refresh
			isEnvDevelopment &&
				shouldUseReactRefresh &&
				new ReactRefreshWebpackPlugin({
					overlay: false,
				}),
		].filter(Boolean),
		// Turn off performance processing because we utilize
		// our own hints via the FileSizeReporter
		performance: false,
	};
};
