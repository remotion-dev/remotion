import {
	createBrowserCompiler,
	createBrowserDependencyPlugin,
	getVirtualProjectChanges,
	getVirtualProjectFiles,
	makeBrowserHttpClient,
	normalizeVirtualPath,
	type BrowserCompiler,
	type BrowserCompilerResult,
} from '@remotion/browser-bundler/compiler';
import type {HotMiddlewareMessage} from '@remotion/studio-shared';
import {getStudioEntryPoints} from '@remotion/studio-shared/studio-entry-points';
import type * as RspackBrowser from '@rspack/browser';
import {BROWSER_STUDIO_TRANSFORMERS_PACKAGE} from './browser-studio-import-map';
import {browserStudioDependencyVersions} from './dependency-versions';
import {studioRenderEntryExternal} from './dev/studio-render-entry-external';
import type {
	BrowserStudioDependencyResolution,
	BrowserStudioError,
	BrowserStudioWorkerCompileRequest,
	BrowserStudioWorkerCompileResponse,
	VirtualProject,
} from './types';
import {
	browserStudioVirtualFilePaths,
	getBrowserStudioVirtualFiles,
} from './virtual-files';
import {
	getBrowserStudioWorkspacePackageExports,
	resolveBrowserStudioRemotionPackage,
} from './workspace-package-exports';

type CompilerSession = {
	compiler: BrowserCompiler;
	initialCompiled: boolean;
	project: VirtualProject;
	queuedProject: VirtualProject | null;
	resolvedUrls: Record<string, string>;
	resolvedVersions: Record<string, string>;
	running: boolean;
};

let compilerSession: CompilerSession | null = null;

const postResponse = (response: BrowserStudioWorkerCompileResponse) => {
	self.postMessage(response);
};

const browserStudioVendorExternals = {
	react: 'globalThis.remotion_browserStudioVendor.react',
	'react-dom': 'globalThis.remotion_browserStudioVendor.reactDom',
	'react-dom/client': 'globalThis.remotion_browserStudioVendor.reactDomClient',
	'react/jsx-dev-runtime':
		'globalThis.remotion_browserStudioVendor.reactJsxDevRuntime',
	'react/jsx-runtime':
		'globalThis.remotion_browserStudioVendor.reactJsxRuntime',
	'react-refresh/runtime':
		'globalThis.remotion_browserStudioVendor.reactRefreshRuntime',
	remotion: 'globalThis.remotion_browserStudioVendor.remotion',
	'remotion/no-react':
		'globalThis.remotion_browserStudioVendor.remotionNoReact',
	'remotion/version': 'globalThis.remotion_browserStudioVendor.remotionVersion',
};

const makeBrowserStudioError = (
	error: unknown,
	diagnostics?: string[],
): BrowserStudioError => {
	if (error instanceof Error) {
		return {
			diagnostics,
			message: error.message,
			stack: error.stack,
		};
	}

	return {diagnostics, message: String(error)};
};

const applyDependencyResolution = ({
	name,
	resolution,
	resolvedUrls,
	resolvedVersions,
}: {
	name: string;
	resolution: BrowserStudioDependencyResolution;
	resolvedUrls: Record<string, string>;
	resolvedVersions: Record<string, string>;
}) => {
	if (typeof resolution === 'string' && resolution.startsWith('http')) {
		resolvedUrls[name] = resolution;
		return;
	}

	if (typeof resolution === 'string') {
		resolvedVersions[name] = resolution;
		return;
	}

	if (resolution?.url) {
		resolvedUrls[name] = resolution.url;
		return;
	}

	if (resolution?.version) {
		resolvedVersions[name] = resolution.version;
	}
};

const getReactRefreshPlugin = (
	rspackBrowser: typeof RspackBrowser,
): RspackBrowser.RspackPluginInstance => ({
	name: 'browser-studio-react-refresh',
	apply: (compiler) => {
		new rspackBrowser.ProvidePlugin({
			$ReactRefreshRuntime$: browserStudioVirtualFilePaths.reactRefreshRuntime,
			__react_refresh_utils__: browserStudioVirtualFilePaths.reactRefreshUtils,
		}).apply(compiler);
		new rspackBrowser.DefinePlugin({
			__react_refresh_error_overlay__: false,
			__react_refresh_library__: JSON.stringify('browser-studio'),
			__react_refresh_socket__: false,
			__reload_on_runtime_errors__: false,
		}).apply(compiler);

		compiler.hooks.compilation.tap(
			'browser-studio-react-refresh',
			(compilation) => {
				compilation.hooks.additionalTreeRuntimeRequirements.tap(
					'browser-studio-react-refresh',
					(_chunk, runtimeRequirements) => {
						runtimeRequirements.add(rspackBrowser.RuntimeGlobals.moduleCache);
					},
				);
			},
		);
	},
});

const getBrowserStudioHmrRuntimePlugin = (
	rspackBrowser: typeof RspackBrowser,
): RspackBrowser.RspackPluginInstance => {
	class BrowserStudioManifestRuntimeModule extends rspackBrowser.RuntimeModule {
		constructor() {
			super(
				'browser studio hmr manifest',
				rspackBrowser.RuntimeModule.STAGE_TRIGGER,
			);
		}

		generate() {
			return `${rspackBrowser.RuntimeGlobals.hmrDownloadManifest} = function() {
	return window.remotion_browserStudioHmr.getManifest(${rspackBrowser.RuntimeGlobals.getUpdateManifestFilename}());
};`;
		}
	}

	return {
		name: 'browser-studio-hmr-runtime',
		apply: (compiler) => {
			compiler.hooks.compilation.tap(
				'browser-studio-hmr-runtime',
				(compilation) => {
					compilation.hooks.runtimeRequirementInTree
						.for(rspackBrowser.RuntimeGlobals.hmrDownloadManifest)
						.tap('browser-studio-hmr-runtime', (chunk) => {
							compilation.addRuntimeModule(
								chunk,
								new BrowserStudioManifestRuntimeModule(),
							);
						});

					rspackBrowser.RuntimePlugin.getCompilationHooks(
						compilation,
					).createScript.tap('browser-studio-hmr-runtime', (code) => {
						return `${code}\nscript.src = window.remotion_browserStudioHmr.resolveScriptUrl(script.src);`;
					});
				},
			);
		},
	};
};

const createCompiler = async ({
	dependencyResolutions,
	project,
	remotionPackageSource,
	useVendorBundle,
}: Extract<BrowserStudioWorkerCompileRequest, {type: 'init'}>) => {
	const resolvedVersions = {...browserStudioDependencyVersions};
	if (remotionPackageSource?.type === 'release') {
		for (const name of Object.keys(resolvedVersions)) {
			if (name === 'remotion' || name.startsWith('@remotion/')) {
				resolvedVersions[name] = remotionPackageSource.version;
			}
		}
	}

	const workspacePackageExports = getBrowserStudioWorkspacePackageExports();
	const resolvedUrls: Record<string, string> = {};
	for (const [name, resolution] of Object.entries(dependencyResolutions)) {
		applyDependencyResolution({
			name,
			resolution,
			resolvedUrls,
			resolvedVersions,
		});
	}

	const entryPoints = getStudioEntryPoints({
		environmentSetup: browserStudioVirtualFilePaths.setupEnvironment,
		fastRefreshRuntime: browserStudioVirtualFilePaths.reactRefreshEntry,
		reactScan: null,
		reactShim: browserStudioVirtualFilePaths.reactShim,
		sequenceStackTraces: browserStudioVirtualFilePaths.setupSequenceStackTraces,
		studioRenderEntry: useVendorBundle
			? browserStudioVirtualFilePaths.studioPreviewEntry
			: '@remotion/studio/previewEntry',
		userDefinedComponent: normalizeVirtualPath(project.entryPoint),
	});
	entryPoints.splice(
		entryPoints.length - 1,
		0,
		browserStudioVirtualFilePaths.browserRequireShim,
	);

	const compiler = await createBrowserCompiler({
		project,
		virtualFiles: getBrowserStudioVirtualFiles(),
		onProgress: (progress) =>
			postResponse({type: 'load-progress', ...progress}),
		configure: (rspackBrowser) => ({
			context: normalizeVirtualPath(project.rootDir),
			devtool: 'eval-cheap-module-source-map',
			entry: {bundle: {asyncChunks: false, import: entryPoints}},
			experiments: {
				buildHttp: {
					allowedUris: [
						'https://esm.sh/',
						`${self.location.origin}/`,
						...(remotionPackageSource ? [remotionPackageSource.baseUrl] : []),
					],
					cacheLocation: false,
					httpClient: makeBrowserHttpClient({
						fetchImplementation: fetch,
					}),
				},
			},
			externals: [
				...(useVendorBundle ? [browserStudioVendorExternals] : []),
				({request}, callback) => {
					if (request === BROWSER_STUDIO_TRANSFORMERS_PACKAGE) {
						callback(undefined, request, 'import');
						return;
					}

					callback();
				},
			],
			externalsType: useVendorBundle ? 'var' : undefined,
			mode: 'development',
			module: {
				rules: [
					{parser: {worker: false}, test: /\.[cm]?[jt]sx?$/},
					{
						exclude: [/node_modules/, /__remotion_browser_studio__/],
						test: /\.[jt]sx?$/,
						use: [{loader: 'builtin:react-refresh-loader'}],
					},
					{
						test: /\.tsx?$/,
						use: [
							{
								loader: 'builtin:swc-loader',
								options: {
									env: {targets: 'Chrome >= 111'},
									jsc: {
										parser: {syntax: 'typescript', tsx: true},
										transform: {
											react: {
												development: true,
												refresh: true,
												importSource:
													browserStudioVirtualFilePaths.jsxImportSource,
												runtime: 'automatic',
											},
										},
									},
								},
							},
						],
					},
					{
						exclude: /node_modules/,
						test: /\.jsx?$/,
						use: [
							{
								loader: 'builtin:swc-loader',
								options: {
									env: {targets: 'Chrome >= 111'},
									jsc: {
										parser: {jsx: true, syntax: 'ecmascript'},
										transform: {
											react: {
												development: true,
												refresh: true,
												importSource:
													browserStudioVirtualFilePaths.jsxImportSource,
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
				chunkFilename: '[name].js',
				chunkFormat: 'array-push',
				chunkLoading: 'jsonp',
				filename: 'bundle.js',
				hashFunction: 'xxhash64',
				path: '/dist',
				publicPath: '/__remotion_browser_studio_hmr__/',
			},
			plugins: [
				getReactRefreshPlugin(rspackBrowser),
				createBrowserDependencyPlugin({
					rspack: rspackBrowser,
					development: true,
					external: studioRenderEntryExternal,
					resolvedUrls,
					resolvedVersions,
					resolvePackage: (request) =>
						resolveBrowserStudioRemotionPackage({
							packages: workspacePackageExports,
							request,
							source: remotionPackageSource,
						}),
				}),
				new rspackBrowser.HotModuleReplacementPlugin(),
				getBrowserStudioHmrRuntimePlugin(rspackBrowser),
				new rspackBrowser.optimize.LimitChunkCountPlugin({maxChunks: 1}),
			],
			resolve: {extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']},
		}),
	});

	return {
		compiler,
		resolvedUrls,
		resolvedVersions,
	};
};

const makeHmrEvent = (result: BrowserCompilerResult): HotMiddlewareMessage => ({
	action: 'built',
	errors: result.errors,
	hash: result.hash,
	modules: result.modules,
	name: '',
	time: result.time,
	warnings: result.warnings,
});

const applyProjectUpdate = (
	session: CompilerSession,
	project: VirtualProject,
) => {
	const {modified, removed} = getVirtualProjectChanges({
		previous: getVirtualProjectFiles(session.project),
		next: getVirtualProjectFiles(project),
	});
	session.project = project;

	return modified.length > 0 || removed.length > 0;
};

const runCompilation = async (session: CompilerSession) => {
	if (session.running) {
		return;
	}

	session.running = true;
	const outcome = await session.compiler.compile(session.project).then(
		(compilation) => ({type: 'success' as const, result: compilation}),
		(error: unknown) => ({
			type: 'error' as const,
			error: makeBrowserStudioError(error),
		}),
	);
	if (compilerSession !== session) {
		return;
	}

	session.running = false;
	const {queuedProject} = session;
	session.queuedProject = null;
	const runQueuedProject = () => {
		if (!queuedProject || !applyProjectUpdate(session, queuedProject)) {
			return false;
		}

		if (session.initialCompiled) {
			postResponse({type: 'building'});
		}

		runCompilation(session);
		return true;
	};

	if (outcome.type === 'error') {
		if (!runQueuedProject()) {
			postResponse({error: outcome.error, type: 'error'});
		}

		return;
	}

	const {result} = outcome;
	if (!session.initialCompiled) {
		if (result.bundle === null) {
			if (!runQueuedProject()) {
				postResponse({
					error: makeBrowserStudioError(
						'Rspack compilation failed',
						result.errors,
					),
					type: 'error',
				});
			}

			return;
		}

		session.initialCompiled = true;
		postResponse({
			bundle: result.bundle,
			type: 'initial-compiled',
			warnings: result.warnings,
		});
		runQueuedProject();
		return;
	}

	postResponse({
		assets: result.assets.filter((asset) =>
			asset.name.includes('.hot-update.'),
		),
		hmrEvent: makeHmrEvent(result),
		type: 'hmr-update',
		warnings: result.warnings,
	});
	runQueuedProject();
};

const startCompiler = async (
	request: Extract<BrowserStudioWorkerCompileRequest, {type: 'init'}>,
) => {
	if (compilerSession) {
		const previous = compilerSession;
		compilerSession = null;
		await previous.compiler.dispose();
	}

	const {compiler, resolvedUrls, resolvedVersions} =
		await createCompiler(request);
	const session: CompilerSession = {
		compiler,
		initialCompiled: false,
		project: request.project,
		queuedProject: null,
		resolvedUrls,
		resolvedVersions,
		running: false,
	};
	compilerSession = session;
	runCompilation(session);
};

const updateProject = (
	request: Extract<BrowserStudioWorkerCompileRequest, {type: 'update-project'}>,
) => {
	if (!compilerSession) {
		throw new Error('Cannot update Browser Studio before initializing it');
	}

	for (const [name, resolution] of Object.entries(
		request.dependencyResolutions,
	)) {
		applyDependencyResolution({
			name,
			resolution,
			resolvedUrls: compilerSession.resolvedUrls,
			resolvedVersions: compilerSession.resolvedVersions,
		});
	}

	if (compilerSession.running) {
		compilerSession.queuedProject = request.project;
		return;
	}

	if (!applyProjectUpdate(compilerSession, request.project)) {
		return;
	}

	if (compilerSession.initialCompiled) {
		postResponse({type: 'building'});
	}

	runCompilation(compilerSession);
};

let messages: Promise<void> = Promise.resolve();

self.addEventListener(
	'message',
	(event: MessageEvent<BrowserStudioWorkerCompileRequest>) => {
		messages = messages.then(async () => {
			try {
				if (event.data.type === 'init') {
					await startCompiler(event.data);
					return;
				}

				updateProject(event.data);
			} catch (error) {
				postResponse({error: makeBrowserStudioError(error), type: 'error'});
			}
		});
	},
);

export type {BrowserStudioWorkerCompileResponse};
