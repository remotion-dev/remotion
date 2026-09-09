import {promises as fs} from 'node:fs';
import type {WatchIgnoreNextChangePlugin} from '@remotion/bundler';

let currentPlugin: WatchIgnoreNextChangePlugin | null = null;

export const setWatchIgnoreNextChangePlugin = (
	plugin: WatchIgnoreNextChangePlugin,
): void => {
	currentPlugin = plugin;
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
