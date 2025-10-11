import {getRemotionEnvironment} from 'remotion';
import {getStaticFiles, type StaticFile} from './get-static-files';

type WatcherCallback = (newFiles: StaticFile[]) => void;

export const WATCH_REMOTION_STATIC_FILES = 'remotion_staticFilesChanged';

/*
 * @description Watches for changes in the public directory and calls a callback function when a file is added, removed, or modified.
 * @see [Documentation](https://www.remotion.dev/docs/studio/watch-public-folder)
 */
export const watchPublicFolder = (
	callback: WatcherCallback,
): {cancel: () => void} => {
	if (!getRemotionEnvironment().isStudio) {
		// eslint-disable-next-line no-console
		console.warn(
			'The watchPublicFolder() API is only available while using the Remotion Studio.',
		);
		return {cancel: () => undefined};
	}

	if (window.remotion_isReadOnlyStudio) {
		throw new Error('watchPublicFolder() is not available in read-only Studio');
	}

	const emitUpdate = () => {
		callback(getStaticFiles());
	};

	window.addEventListener(WATCH_REMOTION_STATIC_FILES, emitUpdate);

	const cancel = () => {
		return window.removeEventListener(WATCH_REMOTION_STATIC_FILES, emitUpdate);
	};

	return {cancel};
};
