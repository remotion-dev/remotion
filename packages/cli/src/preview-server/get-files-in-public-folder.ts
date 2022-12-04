import fs from 'fs';
import path from 'path';

export type StaticFile = {
	path: string;
	size: number;
	lastModified: number;
};

export const getFilesInPublicFolder = (publicFolder: string): StaticFile[] => {
	const files = fs.readdirSync(publicFolder);

	return files
		.filter((f) => {
			return !f.startsWith('.DS_Store');
		})
		.map((f) => {
			const stated = fs.statSync(path.join(publicFolder, f));

			return {
				path: f,
				lastModified: Math.floor(stated.mtimeMs),
				size: stated.size,
			};
		});
};
