import {
	createBrowserCompiler,
	type BrowserCompiler,
	type BrowserCompilerProject,
} from './create-browser-compiler';
import {createBrowserDependencyPlugin} from './dependency-resolution';
import {BrowserBundlerError, serializeCompilerError} from './errors';
import {
	browserBundleHmrBridgeName,
	browserBundleHotUpdateName,
} from './fast-refresh-bridge';
import {
	createBrowserHmrRuntimePlugin,
	createBrowserReactRefreshPlugin,
} from './hmr-plugins';
import {makeBrowserHttpClient} from './http-client';
import {getBrowserReactRefreshVirtualFiles} from './refresh-virtual-files';
import type {
	BrowserBundlerWorkerRequest,
	BrowserBundlerWorkerResponse,
} from './types';
import {normalizeVirtualPath} from './virtual-project';

declare const __BROWSER_BUNDLER_DEPENDENCY_VERSIONS__: Record<string, string>;

const sharedModules = [
	'react',
	'react-dom',
	'react-dom/client',
	'react/jsx-runtime',
	'react/jsx-dev-runtime',
	'remotion',
	'remotion/no-react',
	'remotion/version',
];

let compiler: BrowserCompiler | null = null;
let previousProject: BrowserCompilerProject | null = null;
let previousHash: string | null = null;
let sessionId: string | null = null;
let queue: Promise<void> = Promise.resolve();

const refreshPaths = {
	entry: '/__remotion_browser_bundler__/refresh-entry.js',
	runtime: '/__remotion_browser_bundler__/refresh-runtime.js',
	utils: '/__remotion_browser_bundler__/refreshUtils.js',
};
const hotEntry = '/__remotion_browser_bundler__/hot-entry.js';

const postResponse = (response: BrowserBundlerWorkerResponse) => {
	self.postMessage(response);
};

self.addEventListener(
	'message',
	(event: MessageEvent<BrowserBundlerWorkerRequest>) => {
		const request = event.data;
		queue = queue.then(async () => {
			try {
				const project: BrowserCompilerProject = {
					...request.project,
					rootDir: '/',
				};
				const {enableFastRefresh} = request;
				const entryPoint = normalizeVirtualPath(project.entryPoint);
				if (
					compiler &&
					(previousProject?.rootDir !== project.rootDir ||
						previousProject?.entryPoint !== project.entryPoint)
				) {
					await compiler.dispose();
					compiler = null;
				}

				if (compiler === null) {
					previousHash = null;
					sessionId = crypto.randomUUID();
				}

				compiler ??= await createBrowserCompiler({
					project,
					virtualFiles: enableFastRefresh
						? {
								...getBrowserReactRefreshVirtualFiles(refreshPaths),
								[hotEntry]: `
globalThis[${JSON.stringify(browserBundleHmrBridgeName)}].setHotRuntime({
  check: () => module.hot.check(false),
  apply: () => module.hot.apply(),
  getHash: () => __webpack_hash__,
  status: () => module.hot.status(),
});
require(${JSON.stringify(entryPoint)});
module.hot.accept(${JSON.stringify(entryPoint)}, () => {
  require(${JSON.stringify(entryPoint)});
});
`,
							}
						: {},
					onProgress: (progress) =>
						postResponse({type: 'progress', ...progress}),
					configure: (rspack) => ({
						context: normalizeVirtualPath(project.rootDir),
						mode: 'development',
						devtool: 'inline-cheap-module-source-map',
						entry: {
							bundle: {
								asyncChunks: false,
								import: enableFastRefresh
									? [refreshPaths.entry, hotEntry]
									: [entryPoint],
							},
						},
						experiments: {
							buildHttp: {
								allowedUris: ['https://esm.sh/', `${self.location.origin}/`],
								cacheLocation: false,
								httpClient: makeBrowserHttpClient({fetchImplementation: fetch}),
							},
						},
						externals: Object.fromEntries(
							[
								...sharedModules,
								...(enableFastRefresh ? ['react-refresh/runtime'] : []),
							].map((name) => [name, `commonjs ${name}`]),
						),
						module: {
							rules: [
								{parser: {worker: false}, test: /\.[cm]?[jt]sx?$/},
								...(enableFastRefresh
									? [
											{
												exclude: [
													/node_modules/,
													/__remotion_browser_bundler__/,
												],
												test: /\.[jt]sx?$/,
												use: [{loader: 'builtin:react-refresh-loader'}],
											},
										]
									: []),
								{
									test: /\.[jt]sx?$/,
									use: [
										{
											loader: 'builtin:swc-loader',
											options: {
												env: {targets: 'Chrome >= 111'},
												jsc: {
													parser: {syntax: 'typescript', tsx: true},
													transform: {
														react: {
															development: enableFastRefresh,
															refresh: enableFastRefresh,
															runtime: 'automatic',
														},
													},
												},
											},
										},
									],
								},
							],
						},
						optimization: {
							emitOnErrors: !enableFastRefresh,
							runtimeChunk: false,
							splitChunks: false,
						},
						output: {
							chunkFilename: '[name].js',
							chunkFormat: 'array-push',
							chunkLoading: 'jsonp',
							filename: 'bundle.js',
							path: '/dist',
							publicPath: '',
							hashFunction: 'xxhash64',
							uniqueName: 'remotion-browser-bundler',
							...(enableFastRefresh
								? {hotUpdateGlobal: browserBundleHotUpdateName}
								: {}),
						},
						plugins: [
							...(enableFastRefresh
								? [
										createBrowserReactRefreshPlugin({
											rspack,
											refreshRuntime: refreshPaths.runtime,
											refreshUtils: refreshPaths.utils,
										}),
										new rspack.HotModuleReplacementPlugin(),
										createBrowserHmrRuntimePlugin({
											rspack,
											bridgeName: browserBundleHmrBridgeName,
										}),
									]
								: []),
							createBrowserDependencyPlugin({
								rspack,
								development: enableFastRefresh,
								external: [
									'react',
									'react-dom',
									'remotion',
									...(enableFastRefresh ? ['react-refresh'] : []),
								],
								resolvedUrls: {},
								resolvedVersions: {
									...__BROWSER_BUNDLER_DEPENDENCY_VERSIONS__,
									...request.dependencyVersions,
								},
								resolvePackage: null,
							}),
							new rspack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
						],
						resolve: {extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']},
					}),
				});
				previousProject = project;
				const result = await compiler.compile(project);
				if (result.bundle === null) {
					throw new BrowserBundlerError(
						'Rspack compilation failed',
						result.errors,
					);
				}

				if (enableFastRefresh && (!result.hash || sessionId === null)) {
					throw new Error('Rspack did not return a Fast Refresh build hash.');
				}

				postResponse({
					type: 'bundle',
					id: request.id,
					bundle: {
						code: result.bundle,
						warnings: result.warnings,
						fastRefresh:
							enableFastRefresh && result.hash && sessionId !== null
								? {
										sessionId,
										hash: result.hash,
										previousHash,
										assets: result.assets.filter((asset) =>
											asset.name.includes('.hot-update.'),
										),
									}
								: null,
					},
				});
				previousHash = result.hash ?? null;
			} catch (error) {
				postResponse({
					type: 'error',
					id: request.id,
					error: serializeCompilerError(error),
				});
			}
		});
	},
);
