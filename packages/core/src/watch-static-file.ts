import {getRemotionEnvironment} from './get-remotion-environment';
import type {StaticFile} from './get-static-files';
import {ENABLE_V5_BREAKING_CHANGES} from './v5-flag';

type WatcherCallback = (newData: StaticFile | null) => void;

export const WATCH_REMOTION_STATIC_FILES = 'remotion_staticFilesChanged';

export type WatchRemotionStaticFilesPayload = {
	files: StaticFile[];
};

/*
 * @description Watches for changes in a specific static file and invokes a callback function when the file changes, enabling dynamic updates in your Remotion projects.
 * @see [Documentation](https://www.remotion.dev/docs/watchstaticfile)
 */
export const watchStaticFile = (
	fileName: string,
	callback: WatcherCallback,
): {cancel: () => void} => {
	if (ENABLE_V5_BREAKING_CHANGES) {
		throw new Error(
			'watchStaticFile() has moved into the `@remotion/studio` package. Update your imports.',
		);
	}

	// Check if function is called in Remotion Studio
	if (!getRemotionEnvironment().isStudio) {
		// eslint-disable-next-line no-console
		console.warn(
			'The watchStaticFile() API is only available while using the Remotion Studio.',
		);
		return {cancel: () => undefined};
	}

	const withoutStaticBase = fileName.startsWith(window.remotion_staticBase)
		? fileName.replace(window.remotion_staticBase, '')
		: fileName;
	const withoutLeadingSlash = withoutStaticBase.startsWith('/')
		? withoutStaticBase.slice(1)
		: withoutStaticBase;

	let prevFileData = window.remotion_staticFiles.find(
		(file: StaticFile) => file.name === withoutLeadingSlash,
	);

	// Check if the specified static file has updated or deleted
	const checkFile = (event: Event) => {
		const staticFiles: StaticFile[] = (
			(event as CustomEvent).detail as WatchRemotionStaticFilesPayload
		).files;

		// Check for user specified file
		const newFileData = staticFiles.find(
			(file: StaticFile) => file.name === withoutLeadingSlash,
		);

		if (!newFileData) {
			// File is deleted
			if (prevFileData !== undefined) {
				callback(null);
			}

			prevFileData = undefined;
			return;
		}

		if (
			prevFileData === undefined ||
			prevFileData.lastModified !== newFileData.lastModified
		) {
			callback(newFileData); // File is added or modified
			prevFileData = newFileData;
		}
	};

	window.addEventListener(WATCH_REMOTION_STATIC_FILES, checkFile);

	const cancel = () => {
		return window.removeEventListener(WATCH_REMOTION_STATIC_FILES, checkFile);
	};

	return {cancel};
};
