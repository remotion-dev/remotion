import fs from 'fs';

const deleteAllFilesInAFolderRecursively = (path: string) => {
	fs.readdirSync(path).forEach((file) => {
		const filePath = path + '/' + file;
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
