import fs from 'fs';
import path from 'path';

export type StaticFile = {
	path: string;
	size: number;
	lastModified: number;
};

export const getFilesInPublicFolder = (publicFolder: string): StaticFile[] => {
	const files = fs.readdirSync(publicFolder);

	return files.map((f) => {
		const stated = fs.statSync(path.join(publicFolder, f));

		return {
			path: f,
			lastModified: stated.mtimeMs,
			size: stated.size,
		};
	});
};
