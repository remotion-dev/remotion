import {getDefinePluginDefinitions} from '@remotion/studio-shared/define-plugin-definitions';
import {getStudioEntryPoints} from '@remotion/studio-shared/studio-entry-points';
import type * as RspackBrowser from '@rspack/browser';
import {browserStudioDependencyVersions} from './dependency-versions';
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

type RspackStats = {
	hasErrors: () => boolean;
	toJson: (options: unknown) => {
		assets?: {name?: string}[];
		errors?: {message?: string}[];
		warnings?: {message?: string}[];
	};
};

type BuiltinMemFs = typeof RspackBrowser.builtinMemFs;

let rspackBrowserPromise: Promise<typeof RspackBrowser> | null = null;

const loadRspackBrowser = () => {
	const workerGlobal = globalThis as Record<string, unknown>;

	workerGlobal.window ??= globalThis;
	rspackBrowserPromise ??= import('@rspack/browser');
	return rspackBrowserPromise;
};

const makeBrowserStudioError = (
	error: unknown,
	diagnostics?: string[],
): BrowserStudioError => {
	if (error instanceof Error) {
		return {
			message: error.message,
			stack: error.stack,
			diagnostics,
		};
	}

	return {
		message: String(error),
		diagnostics,
	};
};

const normalizePath = (path: string) => {
	if (path.startsWith('/')) {
		return path;
	}

	return `/${path}`;
};

const writeFilesToMemFs = (project: VirtualProject, memFs: BuiltinMemFs) => {
	const files = {
		...getBrowserStudioVirtualFiles(),
		...Object.fromEntries(
			Object.entries(project.files).map(([path, contents]) => [
				normalizePath(path),
				contents,
			]),
		),
	};

	memFs.volume.reset();
	memFs.volume.fromJSON(files);
};

const compilerWarnings = (statsJson: {
	warnings?: {message?: string}[];
}): string[] =>
	(statsJson.warnings ?? []).map((warning) => warning.message ?? '');

const compilerErrors = (statsJson: {errors?: {message?: string}[]}): string[] =>
	(statsJson.errors ?? []).map((error) => error.message ?? '');

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

const compileProject = async ({
	project,
	dependencyResolutions,
}: BrowserStudioWorkerCompileRequest): Promise<BrowserStudioWorkerCompileResponse> => {
	try {
		const {BrowserHttpImportEsmPlugin, builtinMemFs, rspack} =
			await loadRspackBrowser();
		writeFilesToMemFs(project, builtinMemFs);

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
			fastRefreshRuntime: null,
			environmentSetup: browserStudioVirtualFilePaths.setupEnvironment,
			sequenceStackTraces:
				browserStudioVirtualFilePaths.setupSequenceStackTraces,
			userDefinedComponent: normalizePath(project.entryPoint),
			reactShim: browserStudioVirtualFilePaths.reactShim,
			studioRenderEntry: '@remotion/studio/renderEntry',
		});

		const compiler = rspack({
			context: normalizePath(project.rootDir),
			devtool: 'eval-cheap-module-source-map',
			entry: {
				bundle: {
					asyncChunks: false,
					import: entryPoints,
				},
			},
			experiments: {
				buildHttp: {
					allowedUris: ['https://esm.sh/'],
					cacheLocation: false,
				},
			},
			mode: 'development',
			module: {
				rules: [
					{
						parser: {
							worker: false,
						},
						test: /\.[cm]?[jt]sx?$/,
					},
					{
						test: /\.tsx?$/,
						use: [
							{
								loader: 'builtin:swc-loader',
								options: {
									jsc: {
										parser: {syntax: 'typescript', tsx: true},
										transform: {
											react: {
												runtime: 'automatic',
												development: true,
												refresh: false,
											},
										},
									},
									env: {targets: 'Chrome >= 111'},
								},
							},
						],
					},
					{
						test: /\.jsx?$/,
						exclude: /node_modules/,
						use: [
							{
								loader: 'builtin:swc-loader',
								options: {
									jsc: {
										parser: {syntax: 'ecmascript', jsx: true},
										transform: {
											react: {
												runtime: 'automatic',
												development: true,
												refresh: false,
											},
										},
									},
									env: {targets: 'Chrome >= 111'},
								},
							},
						],
					},
				],
			},
			optimization: {
				runtimeChunk: false,
				splitChunks: false,
			},
			output: {
				chunkFilename: '[name].js',
				filename: 'bundle.js',
				hashFunction: 'xxhash64',
				path: '/dist',
				publicPath: '',
			},
			plugins: [
				new rspack.DefinePlugin(
					getDefinePluginDefinitions({
						askAIEnabled: false,
						bufferStateDelayInMilliseconds: null,
						experimentalClientSideRenderingEnabled: false,
						keyboardShortcutsEnabled: true,
						maxTimelineTracks: null,
					}),
				),
				new BrowserHttpImportEsmPlugin({
					dependencyUrl: resolvedUrls,
					dependencyVersions: resolvedVersions,
					domain: 'https://esm.sh',
				}),
				new rspack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
			],
			resolve: {
				extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
			},
		});

		const stats = await new Promise<RspackStats>((resolve, reject) => {
			compiler.run((error: Error | null, compilationStats: unknown) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(compilationStats as RspackStats);
			});
		});

		const statsJson = stats.toJson({
			all: false,
			assets: true,
			errors: true,
			warnings: true,
		});
		const errors = compilerErrors(statsJson);

		if (stats.hasErrors()) {
			return {
				type: 'error',
				error: makeBrowserStudioError(
					new Error(errors.join('\n') || 'Rspack compilation failed'),
					errors,
				),
			};
		}

		const jsAssets = (statsJson.assets ?? [])
			.map((asset) => asset.name)
			.filter((name): name is string => Boolean(name?.endsWith('.js')));

		if (jsAssets.length !== 1) {
			throw new Error(
				`Expected Rspack to emit one JavaScript asset, got ${jsAssets.length}: ${jsAssets.join(
					', ',
				)}`,
			);
		}

		const bundle = builtinMemFs.volume.readFileSync(
			`/dist/${jsAssets[0]}`,
			'utf-8',
		);

		return {
			type: 'compiled',
			bundle: String(bundle),
			warnings: compilerWarnings(statsJson),
		};
	} catch (error) {
		return {
			type: 'error',
			error: makeBrowserStudioError(error),
		};
	}
};

self.onmessage = async (
	event: MessageEvent<BrowserStudioWorkerCompileRequest>,
) => {
	const response = await compileProject(event.data);
	self.postMessage(response);
};

export type {BrowserStudioWorkerCompileResponse};
