import {mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import type {PickOpenTimelineRequest} from '@remotion/studio-shared';

type PickerType = PickOpenTimelineRequest['type'];
type DirectoryHistory = Record<PickerType, string | null>;

const histories = new Map<string, Promise<DirectoryHistory>>();

export const getNativeFilePickerDirectory = async ({
	remotionRoot,
	type,
	updateDirectory,
}: {
	remotionRoot: string;
	type: PickerType;
	updateDirectory: string | null;
}): Promise<string | null> => {
	const filePath = path.join(
		remotionRoot,
		'node_modules',
		'.cache',
		'remotion',
		'native-file-picker-directories.json',
	);
	const previous =
		histories.get(filePath) ??
		(async (): Promise<DirectoryHistory> => {
			try {
				const saved: unknown = JSON.parse(await readFile(filePath, 'utf8'));
				if (typeof saved === 'object' && saved !== null) {
					return {
						timeline:
							'timeline' in saved && typeof saved.timeline === 'string'
								? saved.timeline
								: null,
						'media-directory':
							'media-directory' in saved &&
							typeof saved['media-directory'] === 'string'
								? saved['media-directory']
								: null,
					};
				}
			} catch {}

			return {timeline: null, 'media-directory': null};
		})();
	const history = previous.then(async (directories) => {
		if (updateDirectory === null || directories[type] === updateDirectory) {
			return directories;
		}

		const updated = {...directories, [type]: updateDirectory};
		try {
			await mkdir(path.dirname(filePath), {recursive: true});
			await writeFile(filePath, JSON.stringify(updated));
		} catch {}

		return updated;
	});
	histories.set(filePath, history);
	const directory = (await history)[type];
	if (directory === null) return null;
	try {
		return (await stat(directory)).isDirectory() ? directory : null;
	} catch {
		return null;
	}
};
