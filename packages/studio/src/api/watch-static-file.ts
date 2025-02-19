import {getRemotionEnvironment} from 'remotion';
import type {StaticFile} from './get-static-files';
import {watchPublicFolder} from './watch-public-folder';

type WatcherCallback = (newData: StaticFile | null) => void;

export type WatchRemotionStaticFilesPayload = {
	files: StaticFile[];
};

/*
 * @description Watches for changes in a specific static file and invokes a callback function when the file changes, enabling dynamic updates in your Remotion projects.
 * @see [Documentation](https://www.remotion.dev/docs/studio/watch-static-file)
 */
export const watchStaticFile = (
	fileName: string,
	callback: WatcherCallback,
): {cancel: () => void} => {
	if (!getRemotionEnvironment().isStudio) {
		// eslint-disable-next-line no-console
		console.warn(
			'watchStaticFile() is only available while using the Remotion Studio.',
		);
		return {cancel: () => undefined};
	}

	if (window.remotion_isReadOnlyStudio) {
		// eslint-disable-next-line no-console
		console.warn(
			'watchStaticFile() is only available in an interactive Studio.',
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

	const {cancel} = watchPublicFolder((staticFiles) => {
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
	});

	return {cancel};
};
