import {
	createBrowserCompiler,
	type BrowserCompiler,
	type BrowserCompilerProject,
} from './create-browser-compiler';
import {createBrowserDependencyPlugin} from './dependency-resolution';
import {BrowserBundlerError, serializeCompilerError} from './errors';
import {makeBrowserHttpClient} from './http-client';
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
let queue: Promise<void> = Promise.resolve();

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
				if (
					compiler &&
					(previousProject?.rootDir !== project.rootDir ||
						previousProject?.entryPoint !== project.entryPoint)
				) {
					await compiler.dispose();
					compiler = null;
				}

				compiler ??= await createBrowserCompiler({
					project,
					virtualFiles: {},
					onProgress: (progress) =>
						postResponse({type: 'progress', ...progress}),
					configure: (rspack) => ({
						context: normalizeVirtualPath(project.rootDir),
						mode: 'development',
						devtool: 'inline-cheap-module-source-map',
						entry: {
							bundle: {
								asyncChunks: false,
								import: [normalizeVirtualPath(project.entryPoint)],
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
							sharedModules.map((name) => [name, `commonjs ${name}`]),
						),
						module: {
							rules: [
								{parser: {worker: false}, test: /\.[cm]?[jt]sx?$/},
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
															// jsxDEV is unavailable in production React.
															development: false,
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
						optimization: {runtimeChunk: false, splitChunks: false},
						output: {
							filename: 'bundle.js',
							path: '/dist',
							publicPath: '',
							hashFunction: 'xxhash64',
							uniqueName: 'remotion-browser-bundler',
						},
						plugins: [
							createBrowserDependencyPlugin({
								rspack,
								development: false,
								external: ['react', 'react-dom', 'remotion'],
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

				postResponse({
					type: 'bundle',
					id: request.id,
					bundle: {code: result.bundle, warnings: result.warnings},
				});
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
