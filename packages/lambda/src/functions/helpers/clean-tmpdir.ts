import fs from 'fs';
import {join} from 'path';

export let deletedFiles: string[] = [];
export let deletedFilesSize = 0;

const deleteAllFilesInAFolderRecursively = (path: string) => {
	const files = fs.readdirSync(path);
	files.forEach((file) => {
		const filePath = join(path, file);
		try {
			const stat = fs.statSync(filePath);
			if (stat.isDirectory()) {
				deleteAllFilesInAFolderRecursively(filePath);
			} else {
				fs.unlinkSync(filePath);
				deletedFilesSize += stat.size;
			}
		} catch (err) {
			// Can fail if file was already deleted by cleanup. In that case
			// let's ignore it
		}

		deletedFiles.push(filePath);
	});
	if (path !== '/tmp') {
		fs.rmSync(path, {recursive: true, force: true});
	}
};

export const deleteTmpDir = () => {
	deletedFiles = [];
	deletedFilesSize = 0;
	if (typeof jest === 'undefined') {
		deleteAllFilesInAFolderRecursively('/tmp');
	}
};
