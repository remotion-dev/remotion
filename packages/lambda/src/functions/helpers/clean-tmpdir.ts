import fs from 'node:fs';
import {join} from 'node:path';

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
			}
		} catch {
			// Can fail if file was already deleted by cleanup. In that case
			// let's ignore it
		}
	});
	if (path !== '/tmp') {
		fs.rmSync(path, {recursive: true, force: true});
	}
};

export const deleteTmpDir = () => {
	deleteAllFilesInAFolderRecursively('/tmp');
};
