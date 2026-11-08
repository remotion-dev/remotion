import {promises as fs} from 'node:fs';
import type {WatchIgnoreNextChangePlugin} from '@remotion/bundler';

const pendingSuppressedWrites = new Set<string>();

let currentPlugin: WatchIgnoreNextChangePlugin | null = null;

export const setWatchIgnoreNextChangePlugin = (
	plugin: WatchIgnoreNextChangePlugin | null,
): void => {
	currentPlugin = plugin;
	pendingSuppressedWrites.clear();
};

export const suppressBundlerUpdateForFile = (absolutePath: string): void => {
	pendingSuppressedWrites.add(absolutePath);
};

// Consume the intent for this write, rather than letting an earlier suppressed
// write swallow a subsequent structural change in the watcher's aggregated event.
export const prepareBundlerForFileWrite = (
	absolutePath: string,
	contents: string | null,
): void => {
	if (pendingSuppressedWrites.delete(absolutePath)) {
		currentPlugin?.ignoreNextChange(absolutePath, contents);
	} else {
		currentPlugin?.requireRebuild(absolutePath);
	}
};

export const notifyBundlerOfFileChange = (
	absolutePath: string,
	contents: string | null,
): void => {
	currentPlugin?.notifyFileChanged(absolutePath, contents);
};

export const invalidatePreviouslySuppressedFiles = async (
	onlyFile: string | null,
): Promise<boolean> => {
	if (!currentPlugin) {
		return false;
	}

	const files = currentPlugin.consumeSuppressedFilesForRebuild(onlyFile);
	const now = new Date();
	const touchedFiles = await Promise.all(
		files.map(async (file) => {
			try {
				await fs.utimes(file, now, now);
				return {file, contents: await fs.readFile(file, 'utf8')};
			} catch {
				return null;
			}
		}),
	);
	for (const file of touchedFiles) {
		if (file !== null)
			currentPlugin.notifyFileChanged(file.file, file.contents);
	}

	return touchedFiles.some((file) => file !== null);
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
	await invalidatePreviouslySuppressedFiles(null);
};
