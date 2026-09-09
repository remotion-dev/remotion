import {promises as fs} from 'node:fs';
import type {WatchIgnoreNextChangePlugin, webpack} from '@remotion/bundler';

let currentPlugin: WatchIgnoreNextChangePlugin | null = null;
let currentCompiler: webpack.Compiler | null = null;
let latestStats: webpack.Stats | null = null;
let filesToRebuild: string[] = [];

export const setWatchIgnoreNextChangePlugin = (
	plugin: WatchIgnoreNextChangePlugin,
	compiler: webpack.Compiler,
): void => {
	currentPlugin = plugin;
	currentCompiler = compiler;
	latestStats = null;
	filesToRebuild = [];
	compiler.hooks.invalid.tap('remotion-prepare-client-render', () => {
		latestStats = null;
	});
	compiler.hooks.watchRun.tap('remotion-prepare-client-render', () => {
		if (filesToRebuild.length === 0) {
			return;
		}

		compiler.modifiedFiles = new Set([
			...(compiler.modifiedFiles ?? []),
			...filesToRebuild,
		]);
		for (const file of filesToRebuild) {
			compiler.inputFileSystem?.purge?.(file);
			compiler.fileTimestamps?.delete(file);
		}

		filesToRebuild = [];
	});
	compiler.hooks.done.tap('remotion-prepare-client-render', (stats) => {
		latestStats = stats;
	});
};

export const prepareClientRender = async (): Promise<{hash: string}> => {
	if (!currentCompiler?.watching || !currentPlugin) {
		throw new Error('Studio bundler is not running');
	}

	filesToRebuild = currentPlugin.consumeSuppressedFilesForRebuild();
	if (filesToRebuild.length > 0) {
		await new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error('Timed out preparing the composition for export'));
			}, 60_000);
			currentCompiler!.watching!.invalidate((error) => {
				clearTimeout(timeout);
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}

	if (!latestStats || latestStats.hasErrors() || !latestStats.hash) {
		throw new Error('Fix the compilation errors before exporting');
	}

	return {hash: latestStats.hash};
};

export const suppressBundlerUpdateForFile = (absolutePath: string): void => {
	currentPlugin?.ignoreNextChange(absolutePath);
};

// Why do we need this?
// Consider we have a <Sequence>.
// 1. In visual mode, we update it to layout='none'. This is reflected in the browser and in the code,
//    but Webpack is not aware because we suppressed the file change
// 2. Reload the page. Sequence registers still as layout={undefined}, then listens to sequence props
//    asynchronously!
// 3. Server says that layout="none" is the case, props gets updated, and this reloads the <Sequence>.
//    The same happens again - infinite loop!
// --> When reloading the Studio, it is a good idea to reset Webpack to a non-hacked state.

export const reloadPreviouslySuppressedFiles = async (): Promise<void> => {
	if (!currentPlugin) {
		return;
	}

	const files = currentPlugin.consumeSuppressedFilesHistory();

	const now = new Date();
	await Promise.all(
		files.map(async (file) => {
			try {
				await fs.utimes(file, now, now);
			} catch {}
		}),
	);
};
