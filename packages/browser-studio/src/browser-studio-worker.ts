import type {HotMiddlewareMessage} from '@remotion/studio-shared';
import {getStudioEntryPoints} from '@remotion/studio-shared/studio-entry-points';
import type * as RspackBrowser from '@rspack/browser';
import {browserStudioDependencyVersions} from './dependency-versions';
import {studioRenderEntryExternal} from './dev/studio-render-entry-external';
import type {
	BrowserStudioDependencyResolution,
	BrowserStudioError,
	BrowserStudioHmrAsset,
	BrowserStudioWorkerCompileRequest,
	BrowserStudioWorkerCompileResponse,
	VirtualProject,
} from './types';
import {
	browserStudioVirtualFilePaths,
	getBrowserStudioVirtualFiles,
} from './virtual-files';

type BuiltinMemFs = typeof RspackBrowser.builtinMemFs;
type Compiler = RspackBrowser.Compiler;

type CompilerSession = {
	builtinMemFs: BuiltinMemFs;
	compiler: Compiler;
	initialCompiled: boolean;
	modifiedFiles: ReadonlySet<string> | undefined;
	project: VirtualProject;
	queuedProject: VirtualProject | null;
	removedFiles: ReadonlySet<string> | undefined;
	running: boolean;
};

let rspackBrowserPromise: Promise<typeof RspackBrowser> | null = null;
let compilerSession: CompilerSession | null = null;

const loadRspackBrowser = () => {
	const workerGlobal = globalThis as Record<string, unknown>;
	workerGlobal.window ??= globalThis;
	rspackBrowserPromise ??= import('@rspack/browser');
	return rspackBrowserPromise;
};

const normalizePath = (path: string) =>
	path.startsWith('/') ? path : `/${path}`;

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

const problemToString = (problem: unknown): string => {
	if (typeof problem === 'string') {
		return problem;
	}

	if (
		typeof problem === 'object' &&
		problem !== null &&
		'message' in problem &&
		typeof problem.message === 'string'
	) {
		return problem.message;
	}

	return String(problem);
};

const postResponse = (response: BrowserStudioWorkerCompileResponse) => {
	self.postMessage(response);
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

const isBarePackageImport = (request: string) =>
	!request.startsWith('.') &&
	!request.startsWith('/') &&
	!request.startsWith('http://') &&
	!request.startsWith('https://') &&
	!request.includes('!');

const getPackageName = (request: string) =>
	request.startsWith('@')
		? request.split('/').slice(0, 2).join('/')
		: request.split('/')[0];

const getVersionedPackageRequest = (request: string, version: string) => {
	if (!request.startsWith('@')) {
		const slashIndex = request.indexOf('/');
		return slashIndex === -1
			? `${request}@${version}`
			: `${request.slice(0, slashIndex)}@${version}${request.slice(slashIndex)}`;
	}

	const secondSlashIndex = request.indexOf('/', request.indexOf('/') + 1);
	return secondSlashIndex === -1
		? `${request}@${version}`
		: `${request.slice(0, secondSlashIndex)}@${version}${request.slice(secondSlashIndex)}`;
};

const externalizeSharedDependencies = (url: URL) => {
	url.searchParams.set('dev', '');
	url.searchParams.set('external', studioRenderEntryExternal.join(','));
};

const writeInitialFiles = ({
	builtinMemFs,
	project,
}: {
	builtinMemFs: BuiltinMemFs;
	project: VirtualProject;
}) => {
	builtinMemFs.volume.reset();
	builtinMemFs.volume.fromJSON({
		...getBrowserStudioVirtualFiles(),
		...Object.fromEntries(
			Object.entries(project.files).map(([path, contents]) => [
				normalizePath(path),
				contents,
			]),
		),
	});
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
}: Extract<BrowserStudioWorkerCompileRequest, {type: 'init'}>) => {
	const rspackBrowser = await loadRspackBrowser();
	const {BrowserHttpImportEsmPlugin, builtinMemFs, rspack} = rspackBrowser;
	writeInitialFiles({builtinMemFs, project});

	const resolvedVersions = {...browserStudioDependencyVersions};
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
		reactShim: browserStudioVirtualFilePaths.reactShim,
		sequenceStackTraces: browserStudioVirtualFilePaths.setupSequenceStackTraces,
		studioRenderEntry: '@remotion/studio/previewEntry',
		userDefinedComponent: normalizePath(project.entryPoint),
	});
	entryPoints.splice(
		entryPoints.length - 1,
		0,
		browserStudioVirtualFilePaths.browserRequireShim,
	);

	const compiler = rspack({
		context: normalizePath(project.rootDir),
		devtool: 'eval-cheap-module-source-map',
		entry: {bundle: {asyncChunks: false, import: entryPoints}},
		experiments: {
			buildHttp: {
				allowedUris: ['https://esm.sh/', `${self.location.origin}/`],
				cacheLocation: false,
			},
		},
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
			new BrowserHttpImportEsmPlugin({
				dependencyUrl: ({request}) => {
					if (!isBarePackageImport(request)) {
						return undefined;
					}

					const packageName = getPackageName(request);
					const resolvedUrl = resolvedUrls[packageName];
					if (resolvedUrl) {
						return resolvedUrl;
					}

					const version = resolvedVersions[packageName] ?? 'latest';
					const url = new URL(
						getVersionedPackageRequest(request, version),
						'https://esm.sh/',
					);
					externalizeSharedDependencies(url);
					return url.href;
				},
				dependencyVersions: resolvedVersions,
				domain: 'https://esm.sh',
				postprocess: ({url}) => externalizeSharedDependencies(url),
			}),
			new rspackBrowser.HotModuleReplacementPlugin(),
			getBrowserStudioHmrRuntimePlugin(rspackBrowser),
			new rspack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
		],
		resolve: {extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']},
	});

	return {builtinMemFs, compiler, rspackBrowser};
};

const makeHmrEvent = ({
	errors,
	statsJson,
	warnings,
}: {
	errors: string[];
	statsJson: RspackBrowser.StatsCompilation;
	warnings: string[];
}): HotMiddlewareMessage => ({
	action: 'built',
	errors,
	hash: statsJson.hash,
	modules: Object.fromEntries(
		(statsJson.modules ?? []).map((module, index) => [
			String(module.id ?? index),
			module.name ?? module.identifier ?? '',
		]),
	),
	name: '',
	time: statsJson.time,
	warnings,
});

const getHmrAssets = ({
	assetNames,
	builtinMemFs,
}: {
	assetNames: string[];
	builtinMemFs: BuiltinMemFs;
}): BrowserStudioHmrAsset[] =>
	assetNames
		.filter((name) => name.includes('.hot-update.'))
		.map((name) => ({
			content: String(
				builtinMemFs.volume.readFileSync(`/dist/${name}`, 'utf8'),
			),
			name,
		}));

const applyProjectUpdate = (
	session: CompilerSession,
	project: VirtualProject,
) => {
	const previousFiles = Object.fromEntries(
		Object.entries(session.project.files).map(([path, contents]) => [
			normalizePath(path),
			contents,
		]),
	);
	const nextFiles = Object.fromEntries(
		Object.entries(project.files).map(([path, contents]) => [
			normalizePath(path),
			contents,
		]),
	);
	const changed = Object.keys(nextFiles).filter(
		(path) => previousFiles[path] !== nextFiles[path],
	);
	const removed = Object.keys(previousFiles).filter(
		(path) => !(path in nextFiles),
	);
	session.project = project;

	if (changed.length === 0 && removed.length === 0) {
		return false;
	}

	for (const path of changed) {
		session.builtinMemFs.volume.mkdirSync(
			path.slice(0, path.lastIndexOf('/')) || '/',
			{recursive: true},
		);
		session.builtinMemFs.volume.writeFileSync(path, nextFiles[path]);
	}

	for (const path of removed) {
		session.builtinMemFs.volume.unlinkSync(path);
	}

	session.modifiedFiles = new Set(changed);
	session.removedFiles = new Set(removed);
	return true;
};

const runCompilation = (session: CompilerSession) => {
	if (session.running) {
		return;
	}

	session.running = true;
	const {modifiedFiles, removedFiles} = session;
	session.modifiedFiles = undefined;
	session.removedFiles = undefined;
	session.compiler.run(
		(error, stats) => {
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

			if (error) {
				if (runQueuedProject()) {
					return;
				}

				postResponse({error: makeBrowserStudioError(error), type: 'error'});
				return;
			}

			if (!stats) {
				if (runQueuedProject()) {
					return;
				}

				postResponse({
					error: makeBrowserStudioError('Rspack returned no compilation stats'),
					type: 'error',
				});
				return;
			}

			const statsJson = stats.toJson({
				all: false,
				assets: true,
				errors: true,
				hash: true,
				modules: true,
				timings: true,
				warnings: true,
			});
			const errors = (statsJson.errors ?? []).map(problemToString);
			const warnings = (statsJson.warnings ?? []).map(problemToString);

			if (!session.initialCompiled) {
				if (errors.length > 0) {
					if (runQueuedProject()) {
						return;
					}

					postResponse({
						error: makeBrowserStudioError('Rspack compilation failed', errors),
						type: 'error',
					});
					return;
				}

				session.initialCompiled = true;
				postResponse({
					bundle: String(
						session.builtinMemFs.volume.readFileSync('/dist/bundle.js', 'utf8'),
					),
					type: 'initial-compiled',
					warnings,
				});
				runQueuedProject();
				return;
			}

			postResponse({
				assets: getHmrAssets({
					assetNames: (statsJson.assets ?? [])
						.map((asset) => asset.name)
						.filter((name): name is string => Boolean(name)),
					builtinMemFs: session.builtinMemFs,
				}),
				hmrEvent: makeHmrEvent({errors, statsJson, warnings}),
				type: 'hmr-update',
				warnings,
			});
			runQueuedProject();
		},
		{modifiedFiles, removedFiles},
	);
};

const startCompiler = async (
	request: Extract<BrowserStudioWorkerCompileRequest, {type: 'init'}>,
) => {
	if (compilerSession) {
		compilerSession.compiler.close(() => undefined);
		compilerSession = null;
	}

	const {builtinMemFs, compiler} = await createCompiler(request);
	const session: CompilerSession = {
		builtinMemFs,
		compiler,
		initialCompiled: false,
		modifiedFiles: undefined,
		project: request.project,
		queuedProject: null,
		removedFiles: undefined,
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

self.addEventListener(
	'message',
	async (event: MessageEvent<BrowserStudioWorkerCompileRequest>) => {
		try {
			if (event.data.type === 'init') {
				await startCompiler(event.data);
				return;
			}

			updateProject(event.data);
		} catch (error) {
			postResponse({error: makeBrowserStudioError(error), type: 'error'});
		}
	},
);

export type {BrowserStudioWorkerCompileResponse};
