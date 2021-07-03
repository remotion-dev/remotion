import fs from 'fs';
import {join} from 'path';
import {DOWNLOADS_DIR, OUTPUT_PATH_PREFIX} from '../../shared/constants';

export let deletedFiles: string[] = [];
export let deletedFilesSize = 0;

const deleteAllFilesInAFolderRecursively = (path: string) => {
	const files = fs.readdirSync(path);
	files.forEach((file) => {
		const filePath = join(path, file);
		if (
			!filePath.startsWith(OUTPUT_PATH_PREFIX) &&
			!filePath.startsWith(DOWNLOADS_DIR) &&
			!filePath.startsWith('/tmp/puppeteer_dev_chrome')
		) {
			return;
		}

		if (fs.statSync(filePath).isDirectory()) {
			deleteAllFilesInAFolderRecursively(filePath);
		} else {
			const stat = fs.statSync(filePath);
			fs.unlinkSync(filePath);
			deletedFiles.push(filePath);
			deletedFilesSize += stat.size;
		}
	});
	if (path !== '/tmp') {
		fs.rmdirSync(path);
	}
};

export const deleteTmpDir = () => {
	deletedFiles = [];
	deletedFilesSize = 0;
	deleteAllFilesInAFolderRecursively('/tmp');
};
