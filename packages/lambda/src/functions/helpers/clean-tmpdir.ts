import fs from 'fs';

export const deletedFiles: string[] = [];

const deleteAllFilesInAFolderRecursively = (path: string) => {
	deletedFiles.push('weird');
	fs.readdirSync(path).forEach((file) => {
		const filePath = path + '/' + file;
		deletedFiles.push(filePath);
		if (fs.statSync(filePath).isDirectory()) {
			// recurse
			deleteAllFilesInAFolderRecursively(filePath);
		} else {
			// delete file

			fs.unlinkSync(filePath);
		}
	});
};

export const deleteTmpDir = () => {
	deleteAllFilesInAFolderRecursively('/tmp');
};
