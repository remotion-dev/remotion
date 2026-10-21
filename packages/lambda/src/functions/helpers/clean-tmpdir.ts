import fs from 'node:fs';
import {join} from 'node:path';
import {LambdaClientInternals} from '@remotion/lambda-client';

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

// Lambda's /tmp is per-function scratch space. Never wipe a developer's /tmp.
export const deleteTmpDir = () => {
	if (!LambdaClientInternals.isInsideLambda()) {
		return;
	}

	deleteAllFilesInAFolderRecursively('/tmp');
};
