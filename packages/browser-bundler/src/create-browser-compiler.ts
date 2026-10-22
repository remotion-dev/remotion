import type * as RspackBrowser from '@rspack/browser';
import {loadRspackBrowser} from './load-rspack';
import type {BrowserBundlerProgress, VirtualProject} from './types';
import {
	getVirtualProjectChanges,
	getVirtualProjectFiles,
	normalizeVirtualPath,
} from './virtual-project';

export type BrowserCompilerProject = VirtualProject & {
	rootDir: string;
};

export type BrowserCompilerResult = {
	bundle: string | null;
	assets: {name: string; content: string}[];
	errors: string[];
	warnings: string[];
	hash: string | undefined;
	modules: Record<string, string>;
	time: number | undefined;
};

export type BrowserCompiler = {
	compile: (project: BrowserCompilerProject) => Promise<BrowserCompilerResult>;
	dispose: () => Promise<void>;
};

const problemToString = (problem: unknown): string => {
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

// Rspack's WASM filesystem is global to a worker. Keep one compiler per worker.
export const createBrowserCompiler = async ({
	project,
	virtualFiles,
	configure,
	onProgress,
}: {
	project: BrowserCompilerProject;
	virtualFiles: Record<string, string>;
	configure: (rspack: typeof RspackBrowser) => RspackBrowser.Configuration;
	onProgress: ((progress: BrowserBundlerProgress) => void) | null;
}): Promise<BrowserCompiler> => {
	const rspack = await loadRspackBrowser(onProgress);
	const {volume} = rspack.builtinMemFs;
	let currentFiles = getVirtualProjectFiles(project);
	const rootDir = normalizeVirtualPath(project.rootDir);
	const entryPoint = normalizeVirtualPath(project.entryPoint);
	volume.reset();
	volume.fromJSON({...virtualFiles, ...currentFiles});

	const compiler = rspack.rspack(configure(rspack));
	const outputPath = compiler.options.output.path;
	let queue: Promise<void> = Promise.resolve();
	let disposed = false;
	let disposal: Promise<void> | null = null;
	let initial = true;

	return {
		compile: (nextProject) => {
			if (disposed) {
				return Promise.reject(new Error('The browser compiler was disposed.'));
			}

			const nextFiles = getVirtualProjectFiles(nextProject);
			const run = queue.then(() => {
				if (
					normalizeVirtualPath(nextProject.rootDir) !== rootDir ||
					normalizeVirtualPath(nextProject.entryPoint) !== entryPoint
				) {
					throw new Error(
						'Create a new compiler when changing rootDir or entryPoint.',
					);
				}

				if (!Object.hasOwn(nextFiles, entryPoint)) {
					throw new Error(
						`The virtual entry point does not exist: ${entryPoint}`,
					);
				}

				const {modified, removed} = getVirtualProjectChanges({
					previous: currentFiles,
					next: nextFiles,
				});
				for (const path of modified) {
					volume.mkdirSync(path.slice(0, path.lastIndexOf('/')) || '/', {
						recursive: true,
					});
					volume.writeFileSync(path, nextFiles[path]);
				}

				for (const path of removed) {
					volume.unlinkSync(path);
				}

				currentFiles = nextFiles;
				const modifiedFiles = initial ? undefined : new Set(modified);
				const removedFiles = initial ? undefined : new Set(removed);
				initial = false;

				return new Promise<BrowserCompilerResult>((resolve, reject) => {
					compiler.run(
						(error, stats) => {
							if (error) {
								reject(error);
								return;
							}

							if (!stats) {
								reject(new Error('Rspack returned no compilation stats'));
								return;
							}

							try {
								const json = stats.toJson({
									all: false,
									assets: true,
									errors: true,
									hash: true,
									modules: true,
									timings: true,
									warnings: true,
								});
								const errors = (json.errors ?? []).map(problemToString);
								resolve({
									bundle:
										errors.length === 0
											? String(
													volume.readFileSync(
														`${outputPath}/bundle.js`,
														'utf8',
													),
												)
											: null,
									assets: stats.compilation
										.getAssets()
										.map(({name, source}) => ({
											name,
											content: String(source.source()),
										})),
									errors,
									warnings: (json.warnings ?? []).map(problemToString),
									hash: json.hash,
									modules: Object.fromEntries(
										(json.modules ?? []).map((module, index) => [
											String(module.id ?? index),
											module.name ?? module.identifier ?? '',
										]),
									),
									time: json.time,
								});
							} catch (readError) {
								reject(readError);
							}
						},
						{modifiedFiles, removedFiles},
					);
				});
			});
			// A failed build must not poison subsequent edits. Its caller still
			// receives the rejection, while the serialization queue can continue.
			queue = run.then(
				() => undefined,
				() => undefined,
			);
			return run;
		},
		dispose: () => {
			disposed = true;
			disposal ??= queue.then(
				() =>
					new Promise<void>((resolve, reject) => {
						compiler.close((error) => {
							if (error) {
								reject(error);
								return;
							}

							resolve();
						});
					}),
			);
			return disposal;
		},
	};
};
