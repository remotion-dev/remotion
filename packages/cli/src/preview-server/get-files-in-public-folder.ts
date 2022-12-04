import fs, {statSync} from 'fs';
import path from 'path';
// eslint-disable-next-line no-restricted-imports
import type {StaticFile} from 'remotion';

const readRecursively = ({
	folder,
	output = [],
	startPath,
}: {
	folder: string;
	startPath: string;
	output?: StaticFile[];
}): StaticFile[] => {
	const absFolder = path.join(startPath, folder);
	const files = fs.readdirSync(absFolder);
	for (const file of files) {
		if (file.startsWith('.DS_Store')) {
			continue;
		}

		const stat = statSync(path.join(absFolder, file));
		if (stat.isDirectory()) {
			readRecursively({startPath, folder: path.join(folder, file), output});
		} else if (stat.isFile()) {
			output.push({
				path: path.join(folder, file),
				lastModified: Math.floor(stat.mtimeMs),
				size: stat.size,
			});
		} else if (stat.isSymbolicLink()) {
			const realpath = fs.realpathSync(path.join(folder, file));
			const realStat = fs.statSync(realpath);
			if (realStat.isFile()) {
				output.push({
					path: realpath,
					lastModified: Math.floor(realStat.mtimeMs),
					size: realStat.size,
				});
			}
		}
	}

	return output.sort((a, b) => a.path.localeCompare(b.path));
};

export const getFilesInPublicFolder = (publicFolder: string): StaticFile[] => {
	return readRecursively({folder: '.', startPath: publicFolder});
};
