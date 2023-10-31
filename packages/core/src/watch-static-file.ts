import {getRemotionEnvironment} from './get-remotion-environment';
import type {StaticFile} from './get-static-files';

type WatcherCallback = (newData: StaticFile | null) => void;

/**
 * @description Watch for changes in a specific static file.
 * @param {string} fileName - The name of the static file to watch for changes.
 * @param {WatcherCallback} callback - A callback function to be called when the file changes.
 * @returns {() => void} A function that can be used to cancel the event listener.
 * @see [Documentation](https://www.remotion.dev/docs/watchstaticfile)
 */
export const watchStaticFile = (
	fileName: string,
	callback: WatcherCallback,
): (() => void) => {
	// Check if function is called in Remotion Studio
	if (!getRemotionEnvironment().isStudio) {
		console.warn('The API is only available while using the Remotion Studio.');
		return () => {};
	}

	let prevFileData = window.remotion_staticFiles.find(
		(file: StaticFile) => file.name === fileName,
	);

	// Check if the specified static file has updated or deleted
	const checkFile = (event: Event) => {
		const staticFiles: StaticFile[] = (event as CustomEvent).detail.files;

		// Check for user specified file
		const newFileData = staticFiles.find(
			(file: StaticFile) => file.name === fileName,
		);

		if (newFileData) {
			if (
				prevFileData === undefined ||
				prevFileData.lastModified !== newFileData.lastModified
			) {
				callback(newFileData); // File is added or modified
				prevFileData = newFileData;
			} else {
				return () => {};
			}
		} else {
			callback(null); // File is deleted
		}
	};

	window.addEventListener('watch_remotion_staticFiles', checkFile);

	const cancel = () => {
		return window.removeEventListener('watch_remotion_staticFiles', checkFile);
	};

	return cancel;
};
